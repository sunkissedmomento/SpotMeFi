// lib/spotify/client.ts
import {
  SpotifyUser,
  SpotifyTokenResponse,
  SpotifyTrack,
  SpotifyPlaylist,
  SpotifySearchResponse,
  SpotifyAudioFeatures,
  SpotifyTrackWithFeatures,
} from './types'

const SPOTIFY_API_BASE = 'https://api.spotify.com/v1'
const SPOTIFY_ACCOUNTS_BASE = 'https://accounts.spotify.com'

export class SpotifyClient {
  private accessToken: string

  constructor(accessToken: string) {
    this.accessToken = accessToken
  }

  private async fetch(endpoint: string, options: RequestInit = {}) {
    const res = await fetch(`${SPOTIFY_API_BASE}${endpoint}`, {
      ...options,
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    })

    if (!res.ok) throw new Error(`Spotify API error: ${res.statusText}`)
    return res.json()
  }

  // ----------------------------
  // Search Artists
  // ----------------------------
  async searchArtists(query: string, limit: number = 5) {
    const params = new URLSearchParams({
      q: query,
      type: 'artist',
      limit: limit.toString(),
    })
    const data: any = await this.fetch(`/search?${params}`)
    return data.artists.items
  }

  // ----------------------------
  // Search Tracks by Artist
  // ----------------------------
  async searchArtistTracksExact(artistName: string, limit: number = 30): Promise<SpotifyTrack[]> {
    const artists = await this.searchArtists(artistName, 1)
    if (!artists.length) return []

    const artistId = artists[0].id
    const topTracksData: any = await this.fetch(`/artists/${artistId}/top-tracks?market=US`)
    return topTracksData.tracks.slice(0, limit)
  }

  async searchTrack(query: string, limit: number = 10): Promise<SpotifyTrack[]> {
    const params = new URLSearchParams({
      q: query,
      type: 'track',
      limit: limit.toString(),
    })
    const data: SpotifySearchResponse = await this.fetch(`/search?${params}`)
    return data.tracks.items
  }

  // ----------------------------
  // Discover Tracks Using Full Keyword List
  // ----------------------------
  async discoverTracksByIntent(
    genres: string[] = [],
    keywords: string[] = [],
    yearStart?: number,
    yearEnd?: number,
    limit: number = 50,
    moods: string[] = [],
    energy?: 'low' | 'medium' | 'high',
    language?: string,
    popularity?: 'popular' | 'emerging'
  ): Promise<SpotifyTrack[]> {
    const queryParts: string[] = []

    // Time / Era
    if (yearStart && yearEnd && yearStart === yearEnd) queryParts.push(`year:${yearStart}`)
    else if (yearStart && yearEnd) queryParts.push(`year:${yearStart}-${yearEnd}`)
    else if (yearStart) queryParts.push(`year:${yearStart}`)

    // Genre / Style
    if (genres.length > 0) queryParts.push(...genres.slice(0, 3).map(g => `genre:"${g}"`))

    // Mood / Emotion / Energy
    const moodMap: Record<string, string> = {
      happy: 'valence>0.6',
      sad: 'valence<0.4',
      energetic: 'energy>0.7',
      calm: 'energy<0.4',
      chill: 'energy<0.5',
      hype: 'energy>0.8',
    }
    moods.forEach(m => moodMap[m] && queryParts.push(moodMap[m]))
    if (energy) {
      if (energy === 'high') queryParts.push('energy>0.7')
      else if (energy === 'medium') queryParts.push('energy:0.4-0.7')
      else queryParts.push('energy<0.4')
    }

    // Keywords / Instrumentation / Remix
    if (keywords.length) queryParts.push(...keywords.slice(0, 5))

    // Language / Region
    if (language) queryParts.push(`lang:${language}`)

    // Popularity
    if (popularity === 'popular') queryParts.push('popularity>60')
    else if (popularity === 'emerging') queryParts.push('popularity<40')

    const query = queryParts.length ? queryParts.join(' ') : 'year:2025'
    const params = new URLSearchParams({
      q: query,
      type: 'track',
      limit: limit.toString(),
    })

    const data: SpotifySearchResponse = await this.fetch(`/search?${params}`)
    return data.tracks.items
  }

  // ----------------------------
  // Playlist Management
  // ----------------------------
  async createPlaylist(userId: string, name: string, description: string): Promise<SpotifyPlaylist> {
    return this.fetch(`/users/${userId}/playlists`, {
      method: 'POST',
      body: JSON.stringify({ name, description, public: true }),
    })
  }

  async addTracksToPlaylist(playlistId: string, trackUris: string[]): Promise<void> {
    await this.fetch(`/playlists/${playlistId}/tracks`, {
      method: 'POST',
      body: JSON.stringify({ uris: trackUris }),
    })
  }

  async getPlaylist(playlistId: string): Promise<SpotifyPlaylist> {
    return this.fetch(`/playlists/${playlistId}`)
  }

  // ----------------------------
  // Audio Features
  // ----------------------------
  async getAudioFeatures(trackId: string): Promise<SpotifyAudioFeatures | null> {
    try {
      return await this.fetch(`/audio-features/${trackId}`)
    } catch (error) {
      console.error(`Failed to fetch audio features for track ${trackId}:`, error)
      return null
    }
  }

  async getMultipleAudioFeatures(trackIds: string[]): Promise<(SpotifyAudioFeatures | null)[]> {
    if (trackIds.length === 0) return []

    // Spotify API allows max 100 IDs per request
    const chunks: string[][] = []
    for (let i = 0; i < trackIds.length; i += 100) {
      chunks.push(trackIds.slice(i, i + 100))
    }

    const results: (SpotifyAudioFeatures | null)[] = []
    for (const chunk of chunks) {
      try {
        const params = new URLSearchParams({ ids: chunk.join(',') })
        const data: { audio_features: (SpotifyAudioFeatures | null)[] } = await this.fetch(
          `/audio-features?${params}`
        )
        results.push(...data.audio_features)
      } catch (error) {
        console.error('Failed to fetch audio features batch:', error)
        results.push(...chunk.map(() => null))
      }
    }
    return results
  }

  async enrichTracksWithAudioFeatures(tracks: SpotifyTrack[]): Promise<SpotifyTrackWithFeatures[]> {
    const trackIds = tracks.map(t => t.id)
    const audioFeatures = await this.getMultipleAudioFeatures(trackIds)

    return tracks.map((track, index) => ({
      ...track,
      audioFeatures: audioFeatures[index] || undefined,
    }))
  }
}

// ----------------------------
// OAuth Helpers
// ----------------------------
export async function refreshAccessToken(refreshToken: string): Promise<SpotifyTokenResponse> {
  const params = new URLSearchParams({
    grant_type: 'refresh_token',
    refresh_token: refreshToken,
  })

  const res = await fetch(`${SPOTIFY_ACCOUNTS_BASE}/api/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${Buffer.from(
        `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
      ).toString('base64')}`,
    },
    body: params.toString(),
  })

  if (!res.ok) throw new Error('Failed to refresh access token')
  return res.json()
}
