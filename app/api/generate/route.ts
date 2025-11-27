import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { SpotifyClient, refreshAccessToken } from '@/lib/spotify/client'
import { generatePlaylistConcept } from '@/lib/ai/openai'

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

    console.log('Generating playlist concept with OpenAI GPT-4o...')
    const concept = await generatePlaylistConcept(prompt)

    console.log('Searching for tracks on Spotify...')
    const spotifyClient = new SpotifyClient(accessToken)

    const trackPromises = concept.track_queries.map(query =>
      spotifyClient.searchTrack(query).catch(err => {
        console.error(`Failed to search for "${query}":`, err)
        return []
      })
    )

    const trackResults = await Promise.all(trackPromises)
    const tracks = trackResults
      .flat()
      .filter((track, index, self) =>
        self.findIndex(t => t.id === track.id) === index
      )
      .slice(0, 30)

    if (tracks.length === 0) {
      return NextResponse.json(
        { error: 'No tracks found matching the prompt' },
        { status: 404 }
      )
    }

    console.log('Creating Spotify playlist...')
    const playlist = await spotifyClient.createPlaylist(
      spotifyUserId,
      concept.playlist_title,
      concept.playlist_description
    )

    console.log('Adding tracks to playlist...')
    const trackUris = tracks.map(track => track.uri)
    await spotifyClient.addTracksToPlaylist(playlist.id, trackUris)

    console.log('Saving playlist to database...')
    await supabase.from('playlists').insert({
      user_id: user.id,
      prompt: prompt.trim(),
      playlist_name: concept.playlist_title,
      playlist_description: concept.playlist_description,
      playlist_id_spotify: playlist.id,
      track_count: tracks.length,
    })

    const finalPlaylist = await spotifyClient.getPlaylist(playlist.id)

    return NextResponse.json({
      playlist: {
        id: finalPlaylist.id,
        name: finalPlaylist.name,
        description: finalPlaylist.description,
        url: finalPlaylist.external_urls.spotify,
        image: finalPlaylist.images[0]?.url || null,
        trackCount: tracks.length,
        tracks: tracks.map(track => ({
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
