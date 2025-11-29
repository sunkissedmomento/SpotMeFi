// app/api/playlists/[id]/refine/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { SpotifyClient, refreshAccessToken } from '@/lib/spotify/client'
import { refineExistingPlaylist } from '@/lib/ai/claude'
import { SpotifyTrack } from '@/lib/spotify/types'
import { rankTracksByMatch } from '@/lib/spotify/track-matcher'

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const spotifyUserId = req.cookies.get('spotify_user_id')?.value
    if (!spotifyUserId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { refinementPrompt } = await req.json()
    if (!refinementPrompt || typeof refinementPrompt !== 'string')
      return NextResponse.json({ error: 'Invalid refinement prompt' }, { status: 400 })

    const playlistId = params.id

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SECRET_KEY!
    )

    // ----------------------------
    // Get User
    // ----------------------------
    const { data: user } = await supabase
      .from('users')
      .select('*')
      .eq('spotify_id', spotifyUserId)
      .single()

    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    // ----------------------------
    // Get Existing Playlist
    // ----------------------------
    const { data: playlist } = await supabase
      .from('playlists')
      .select('*')
      .eq('id', playlistId)
      .eq('user_id', user.id)
      .single()

    if (!playlist) return NextResponse.json({ error: 'Playlist not found' }, { status: 404 })

    // ----------------------------
    // Refresh Spotify Token if Needed
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
    // Get Current Tracks from Spotify
    // ----------------------------
    const spotifyPlaylist = await spotifyClient.getPlaylist(playlist.playlist_id_spotify)
    const currentTracks = spotifyPlaylist.tracks.items.map((item: any) => ({
      id: item.track.id,
      name: item.track.name,
      artists: item.track.artists,
      uri: item.track.uri,
    }))

    console.log(`Current playlist has ${currentTracks.length} tracks`)

    // ----------------------------
    // Get AI Refinement Instructions
    // ----------------------------
    const refinementResult = await refineExistingPlaylist(
      playlist.prompt,
      currentTracks,
      refinementPrompt
    )

    console.log('Refinement result:', refinementResult)

    // ----------------------------
    // Process Track Changes
    // ----------------------------
    let tracksToAdd: SpotifyTrack[] = []

    // Search for tracks to add
    if (refinementResult.tracksToAdd.length > 0) {
      for (const trackQuery of refinementResult.tracksToAdd) {
        try {
          const searchResults = await spotifyClient.searchTrack(trackQuery, 5)
          if (searchResults.length > 0) {
            tracksToAdd.push(searchResults[0])
          }
        } catch (error) {
          console.error(`Failed to search for track: ${trackQuery}`, error)
        }
      }
    }

    // Deduplicate - don't add tracks already in playlist (by ID or song name + artist)
    const existingTrackIds = new Set(currentTracks.map((t: any) => t.id))
    const existingSongs = new Set(
      currentTracks.map((t: any) => {
        const artistNames = t.artists.map((a: any) => a.name.toLowerCase().trim()).sort().join(', ')
        return `${artistNames} - ${t.name.toLowerCase().trim()}`
      })
    )

    tracksToAdd = tracksToAdd.filter(t => {
      // Check track ID
      if (existingTrackIds.has(t.id)) {
        console.log(`Skipping duplicate track ID: "${t.name}"`)
        return false
      }

      // Check song name + artist combination
      const artistNames = t.artists.map(a => a.name.toLowerCase().trim()).sort().join(', ')
      const songKey = `${artistNames} - ${t.name.toLowerCase().trim()}`
      if (existingSongs.has(songKey)) {
        console.log(`Skipping duplicate song: "${t.name}" by ${t.artists.map(a => a.name).join(', ')} (different album/single)`)
        return false
      }

      return true
    })

    console.log(`Adding ${tracksToAdd.length} new tracks`)

    // ----------------------------
    // Apply Changes to Spotify Playlist
    // ----------------------------

    // Remove tracks first
    if (refinementResult.tracksToRemove.length > 0) {
      const tracksToRemoveUris = currentTracks
        .filter((t: any) => refinementResult.tracksToRemove.includes(t.id))
        .map((t: any) => ({ uri: t.uri }))

      if (tracksToRemoveUris.length > 0) {
        await fetch(
          `https://api.spotify.com/v1/playlists/${playlist.playlist_id_spotify}/tracks`,
          {
            method: 'DELETE',
            headers: {
              Authorization: `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ tracks: tracksToRemoveUris }),
          }
        )
        console.log(`Removed ${tracksToRemoveUris.length} tracks`)
      }
    }

    // Add new tracks
    if (tracksToAdd.length > 0) {
      await spotifyClient.addTracksToPlaylist(
        playlist.playlist_id_spotify,
        tracksToAdd.map(t => t.uri)
      )
      console.log(`Added ${tracksToAdd.length} tracks`)
    }

    // ----------------------------
    // Update Database
    // ----------------------------
    const newTrackCount = currentTracks.length - refinementResult.tracksToRemove.length + tracksToAdd.length

    await supabase
      .from('playlists')
      .update({
        track_count: newTrackCount,
        updated_at: new Date().toISOString(),
      })
      .eq('id', playlistId)

    // ----------------------------
    // Get Updated Playlist
    // ----------------------------
    const updatedPlaylist = await spotifyClient.getPlaylist(playlist.playlist_id_spotify)

    return NextResponse.json({
      success: true,
      reasoning: refinementResult.reasoning,
      changes: {
        tracksAdded: tracksToAdd.length,
        tracksRemoved: refinementResult.tracksToRemove.length,
      },
      playlist: {
        id: updatedPlaylist.id,
        name: updatedPlaylist.name,
        description: updatedPlaylist.description,
        url: updatedPlaylist.external_urls.spotify,
        image: updatedPlaylist.images?.[0]?.url || null,
        trackCount: newTrackCount,
        tracks: updatedPlaylist.tracks.items.map((item: any) => ({
          id: item.track.id,
          name: item.track.name,
          artists: item.track.artists.map((a: any) => a.name).join(', '),
          album: item.track.album.name,
          image: item.track.album.images?.[0]?.url || null,
        })),
      },
    })
  } catch (err) {
    console.error('Error refining playlist:', err)
    return NextResponse.json({ error: 'Failed to refine playlist' }, { status: 500 })
  }
}
