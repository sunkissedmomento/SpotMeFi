import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { SpotifyClient, refreshAccessToken } from '@/lib/spotify/client'
import { generatePlaylistIntent } from '@/lib/ai/claude'
import { SpotifyTrack } from '@/lib/spotify/types'

export async function POST(request: NextRequest) {
  try {
    const spotifyUserId = request.cookies.get('spotify_user_id')?.value

    if (!spotifyUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { prompt } = await request.json()

    if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
      return NextResponse.json(
        { error: 'Invalid prompt' },
        { status: 400 }
      )
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('spotify_id', spotifyUserId)
      .single()

    if (userError || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check playlist limit (5 per user)
    const { count, error: countError } = await supabase
      .from('playlists')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)

    if (countError) {
      console.error('Error checking playlist count:', countError)
    }

    if (count !== null && count >= 5) {
      return NextResponse.json(
        {
          error: 'Playlist limit reached',
          message: 'You have reached the maximum of 5 playlists. This is a demo version with limited generations.'
        },
        { status: 403 }
      )
    }

    let accessToken = user.access_token

    if (!accessToken || Date.now() >= user.token_expires_at) {
      if (!user.refresh_token) {
        return NextResponse.json(
          { error: 'Token expired, please login again' },
          { status: 401 }
        )
      }

      const tokenResponse = await refreshAccessToken(user.refresh_token)
      accessToken = tokenResponse.access_token

      const expiresAt = Date.now() + tokenResponse.expires_in * 1000
      await supabase
        .from('users')
        .update({
          access_token: tokenResponse.access_token,
          refresh_token: tokenResponse.refresh_token || user.refresh_token,
          token_expires_at: expiresAt,
        })
        .eq('id', user.id)
    }

    console.log('Analyzing playlist intent with Claude 3.5 Haiku...')
    const intent = await generatePlaylistIntent(prompt)

    console.log('Discovering tracks on Spotify based on intent...')
    const spotifyClient = new SpotifyClient(accessToken)

    let tracks: SpotifyTrack[] = []

    // Strategy 1: Search by intent (genres, keywords, year)
    if (intent.genres.length > 0 || intent.keywords.length > 0) {
      const yearStart = intent.year_range?.start
      const yearEnd = intent.year_range?.end

      const searchTracks = await spotifyClient.discoverTracksByIntent(
        intent.genres,
        intent.keywords,
        yearStart,
        yearEnd,
        50
      )
      tracks.push(...searchTracks)
    }

    // Strategy 2: Get recommendations based on genres
    if (intent.include_popular && intent.genres.length > 0) {
      try {
        const recommendations = await spotifyClient.getRecommendations(
          intent.genres,
          30
        )
        tracks.push(...recommendations)
      } catch (error) {
        console.error('Failed to get recommendations:', error)
      }
    }

    // Strategy 3: Include new releases if requested
    if (intent.year_focus === 'recent') {
      try {
        const newReleases = await spotifyClient.getNewReleases(30)
        tracks.push(...newReleases)
      } catch (error) {
        console.error('Failed to get new releases:', error)
      }
    }

    // Remove duplicates and sort by popularity
    const uniqueTracks = tracks
      .filter((track, index, self) =>
        self.findIndex(t => t.id === track.id) === index
      )
      .sort((a, b) => b.popularity - a.popularity)
      .slice(0, 30)

    if (uniqueTracks.length === 0) {
      return NextResponse.json(
        { error: 'No tracks found matching the prompt' },
        { status: 404 }
      )
    }

    console.log('Creating Spotify playlist...')
    const playlist = await spotifyClient.createPlaylist(
      spotifyUserId,
      intent.playlist_title,
      intent.playlist_description
    )

    console.log('Adding tracks to playlist...')
    const trackUris = uniqueTracks.map(track => track.uri)
    await spotifyClient.addTracksToPlaylist(playlist.id, trackUris)

    console.log('Saving playlist to database...')
    await supabase.from('playlists').insert({
      user_id: user.id,
      prompt: prompt.trim(),
      playlist_name: intent.playlist_title,
      playlist_description: intent.playlist_description,
      playlist_id_spotify: playlist.id,
      track_count: uniqueTracks.length,
    })

    const finalPlaylist = await spotifyClient.getPlaylist(playlist.id)

    return NextResponse.json({
      playlist: {
        id: finalPlaylist.id,
        name: finalPlaylist.name,
        description: finalPlaylist.description,
        url: finalPlaylist.external_urls.spotify,
        image: finalPlaylist.images[0]?.url || null,
        trackCount: uniqueTracks.length,
        tracks: uniqueTracks.map(track => ({
          id: track.id,
          name: track.name,
          artists: track.artists.map(a => a.name).join(', '),
          album: track.album.name,
          image: track.album.images[0]?.url || null,
        })),
      },
    })
  } catch (error) {
    console.error('Generate playlist error:', error)
    return NextResponse.json(
      { error: 'Failed to generate playlist' },
      { status: 500 }
    )
  }
}
