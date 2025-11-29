// app/api/generate/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { SpotifyClient, refreshAccessToken } from '@/lib/spotify/client'
import { generatePlaylistIntent } from '@/lib/ai/claude'
import { SpotifyTrack } from '@/lib/spotify/types'
import { rankTracksByMatch } from '@/lib/spotify/track-matcher'
import { learnFromPlaylist, getUserLearnedPreferences, getTopGenres, getTopMoods } from '@/lib/preferences/learner'

export async function POST(req: NextRequest) {
  try {
    const spotifyUserId = req.cookies.get('spotify_user_id')?.value
    if (!spotifyUserId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { prompt, answers } = await req.json()
    if (!prompt || typeof prompt !== 'string')
      return NextResponse.json({ error: 'Invalid prompt' }, { status: 400 })

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SECRET_KEY!
    )

    const { data: user } = await supabase
      .from('users')
      .select('*')
      .eq('spotify_id', spotifyUserId)
      .single()

    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    const { count } = await supabase
      .from('playlists')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)

    if (count && count >= 5)
      return NextResponse.json({ error: 'Playlist limit reached' }, { status: 403 })

    // ----------------------------
    // Refresh token if needed
    // ----------------------------
    let accessToken = user.access_token
    if (!accessToken || Date.now() >= user.token_expires_at) {
      const tokenResp = await refreshAccessToken(user.refresh_token)
      accessToken = tokenResp.access_token

      await supabase
        .from('users')
        .update({
          access_token: tokenResp.access_token,
          refresh_token: tokenResp.refresh_token || user.refresh_token,
          token_expires_at: Date.now() + tokenResp.expires_in * 1000,
        })
        .eq('id', user.id)
    }

    const spotifyClient = new SpotifyClient(accessToken)

    // ----------------------------
    // Get User Preferences (Top Artists & Tracks)
    // ----------------------------
    let userTopArtists: any[] = []
    let userTopTracks: any[] = []
    let learnedPreferences = await getUserLearnedPreferences(user.id)

    try {
      // Get user's top artists and tracks from last 6 months
      userTopArtists = await spotifyClient.getUserTopArtists('medium_term', 20)
      userTopTracks = await spotifyClient.getUserTopTracks('medium_term', 10)

      console.log(`User preferences: ${userTopArtists.length} top artists, ${userTopTracks.length} top tracks`)
    } catch (error) {
      console.warn('Could not fetch user preferences, continuing without them:', error)
    }

    // ----------------------------
    // Extract AI Playlist Intent (with optional answers from clarification)
    // ----------------------------
    const intent = await generatePlaylistIntent(
      prompt,
      answers ? { answers } : undefined,
      userTopArtists.length > 0 ? {
        topArtists: userTopArtists.map(a => a.name),
        topGenres: userTopArtists.flatMap(a => a.genres || []).slice(0, 5)
      } : undefined,
      learnedPreferences ? {
        favoriteGenres: getTopGenres(learnedPreferences, 5),
        favoriteMoods: getTopMoods(learnedPreferences, 3),
        favoriteArtists: learnedPreferences.favorite_artists.slice(0, 10)
      } : undefined
    )

    // ----------------------------
    // Seed & Confirmed Artists
    // ----------------------------
    const seedArtists = intent.confirmed_artists?.length
      ? intent.confirmed_artists
      : intent.artist_name
      ? [intent.artist_name]
      : []

    let detectedArtists: string[] = [...seedArtists]

    // Fallback: detect from prompt
    if (!detectedArtists.length) {
      const words = prompt.toLowerCase().split(/,|and|&|\+|\s+/).filter(Boolean)
      for (let i = 0; i < words.length; i++) {
        const oneWord = words[i]
        const twoWord = i < words.length - 1 ? `${words[i]} ${words[i + 1]}` : null
        const candidates = [oneWord]
        if (twoWord) candidates.push(twoWord)

        for (const candidate of candidates) {
          try {
            const results = await spotifyClient.searchArtists(candidate, 1)
            if (results?.length && !detectedArtists.includes(results[0].name))
              detectedArtists.push(results[0].name)
          } catch {}
        }
      }
    }

    // ----------------------------
    // Track Discovery
    // ----------------------------
    // If user specified a limit, use it. Otherwise, get ALL matching tracks
    const userSpecifiedLimit = intent.track_limit
    const maximumTracks = 200 // Safety limit to avoid overwhelming API/DB
    let tracks: SpotifyTrack[] = []

    // 1️⃣ Seed Artists + Featured Tracks (PRIMARY METHOD)
    for (const artist of detectedArtists) {
      try {
        // Get ALL available tracks from this artist (up to Spotify's limit)
        const artistTracks = await spotifyClient.searchArtistTracksExact(artist, 50)
        const featuredTracks = await spotifyClient.searchTrack(`feat ${artist}`, 30)

        tracks = tracks.concat(artistTracks)
        tracks = tracks.concat(featuredTracks)

        console.log(`Found ${artistTracks.length} tracks from ${artist}, ${featuredTracks.length} featuring ${artist}`)
      } catch (err) {
        console.error(`Failed fetching tracks for artist ${artist}:`, err)
      }
    }

    // 2️⃣ Fallback: discover by intent ONLY if no artists were detected
    if (!tracks.length && detectedArtists.length === 0) {
      console.log('No artists detected, using generic discovery')
      const discovered = await spotifyClient.discoverTracksByIntent(
        intent.genres,
        intent.keywords,
        intent.year_range?.start,
        intent.year_range?.end,
        100, // Get more tracks for filtering
        intent.moods,
        intent.energy_level,
        intent.language,
        intent.include_popular ? 'popular' : intent.include_emerging ? 'emerging' : undefined
      )
      tracks = tracks.concat(discovered)
    }

    console.log(`Discovered ${tracks.length} tracks before deduplication`)

    // ----------------------------
    // Deduplicate
    // ----------------------------
    const seen: { [id: string]: boolean } = {}
    const uniqueTracks = tracks.filter(t => t?.id && !seen[t.id] && (seen[t.id] = true))

    if (!uniqueTracks.length) return NextResponse.json({ error: 'No tracks found' }, { status: 404 })

    // ----------------------------
    // Enrich with Audio Features (optional - graceful fallback)
    // ----------------------------
    let enrichedTracks = uniqueTracks
    try {
      enrichedTracks = await spotifyClient.enrichTracksWithAudioFeatures(uniqueTracks)
    } catch (error) {
      console.warn('Failed to fetch audio features, proceeding without them:', error)
      // Continue with tracks without audio features
      enrichedTracks = uniqueTracks.map(track => ({ ...track, audioFeatures: undefined }))
    }

    // ----------------------------
    // Score & Rank Tracks by Checklist
    // ----------------------------
    // Use higher threshold if artists were specified (stricter matching)
    // Lower threshold to get more tracks (trade-off: slightly less relevant)
    const minScore = detectedArtists.length > 0 ? 30 : 20

    const rankedTracks = rankTracksByMatch(enrichedTracks, intent, prompt, minScore)

    console.log(`Ranked tracks: ${rankedTracks.length} passed filtering (min score: ${minScore})`)
    console.log('Top 5 scores:', rankedTracks.slice(0, 5).map(t => ({
      track: t.track.name,
      artist: t.track.artists[0]?.name,
      score: t.overallScore,
      reason: t.matchReason,
      categoryScores: t.categoryScores
    })))

    // Take ALL matching tracks (up to user limit or maximum)
    const trackLimit = userSpecifiedLimit || Math.min(rankedTracks.length, maximumTracks)
    const finalTracks = rankedTracks.slice(0, trackLimit).map(scored => scored.track)

    console.log(`Selected ${finalTracks.length} tracks for playlist (user limit: ${userSpecifiedLimit || 'none'}, available: ${rankedTracks.length})`)

    if (!finalTracks.length) {
      console.error('No tracks passed filtering. Try lowering requirements or being more specific.')
      return NextResponse.json({ error: 'No matching tracks found' }, { status: 404 })
    }

    // ----------------------------
    // Create Playlist
    // ----------------------------
    const playlist = await spotifyClient.createPlaylist(
      spotifyUserId,
      intent.playlist_title,
      intent.playlist_description
    )

    await spotifyClient.addTracksToPlaylist(playlist.id, finalTracks.map(t => t.uri))

    const { data: insertedPlaylist } = await supabase.from('playlists').insert({
      user_id: user.id,
      prompt: prompt.trim(),
      playlist_name: intent.playlist_title,
      playlist_description: intent.playlist_description,
      playlist_id_spotify: playlist.id,
      track_count: finalTracks.length,
    }).select().single()

    // ----------------------------
    // Learn from this playlist generation
    // ----------------------------
    await learnFromPlaylist(
      user.id,
      intent.genres,
      intent.moods,
      detectedArtists,
      finalTracks.length
    )

    const finalPlaylist = await spotifyClient.getPlaylist(playlist.id)

    return NextResponse.json({
      playlist: {
        id: insertedPlaylist?.id || finalPlaylist.id,
        spotifyId: finalPlaylist.id,
        name: finalPlaylist.name,
        description: finalPlaylist.description,
        url: finalPlaylist.external_urls.spotify,
        image: finalPlaylist.images?.[0]?.url || null,
        trackCount: finalTracks.length,
        tracks: finalTracks.map(t => ({
          id: t.id,
          name: t.name,
          artists: t.artists.map(a => a.name).join(', '),
          album: t.album.name,
          image: t.album.images?.[0]?.url || null,
        })),
      },
    })
  } catch (err) {
    console.error('Error generating playlist:', err)
    return NextResponse.json({ error: 'Failed to generate playlist' }, { status: 500 })
  }
}
