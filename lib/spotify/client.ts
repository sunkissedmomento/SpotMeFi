import {
  SpotifyUser,
  SpotifyTokenResponse,
  SpotifyTrack,
  SpotifyPlaylist,
  SpotifySearchResponse,
} from './types'

const SPOTIFY_API_BASE = 'https://api.spotify.com/v1'
const SPOTIFY_ACCOUNTS_BASE = 'https://accounts.spotify.com'

export class SpotifyClient {
  private accessToken: string

  constructor(accessToken: string) {
    this.accessToken = accessToken
  }

  private async fetch(endpoint: string, options: RequestInit = {}) {
    const response = await fetch(`${SPOTIFY_API_BASE}${endpoint}`, {
      ...options,
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    })

    if (!response.ok) {
      throw new Error(`Spotify API error: ${response.statusText}`)
    }

    return response.json()
  }

  async getCurrentUser(): Promise<SpotifyUser> {
    return this.fetch('/me')
  }

  async searchTrack(query: string): Promise<SpotifyTrack[]> {
    const params = new URLSearchParams({
      q: query,
      type: 'track',
      limit: '3',
    })

    const data: SpotifySearchResponse = await this.fetch(`/search?${params}`)
    return data.tracks.items
  }

  async discoverTracksByIntent(
    genres: string[],
    keywords: string[],
    yearStart?: number,
    yearEnd?: number,
    limit: number = 50
  ): Promise<SpotifyTrack[]> {
    // Build search query
    const queryParts: string[] = []

    // Add genre filters
    if (genres.length > 0) {
      queryParts.push(...genres.map(g => `genre:"${g}"`))
    }

    // Add keywords
    if (keywords.length > 0) {
      queryParts.push(...keywords)
    }

    // Add year filter
    if (yearStart && yearEnd) {
      queryParts.push(`year:${yearStart}-${yearEnd}`)
    } else if (yearStart) {
      queryParts.push(`year:${yearStart}`)
    }

    // If no specific query parts, search for popular tracks
    const query = queryParts.length > 0 ? queryParts.join(' ') : 'year:2024-2025'

    const params = new URLSearchParams({
      q: query,
      type: 'track',
      limit: limit.toString(),
    })

    const data: SpotifySearchResponse = await this.fetch(`/search?${params}`)

    // Sort by popularity
    return data.tracks.items.sort((a, b) => b.popularity - a.popularity)
  }

  async getRecommendations(
    seedGenres: string[],
    limit: number = 30
  ): Promise<SpotifyTrack[]> {
    // Spotify allows max 5 seed values
    const genres = seedGenres.slice(0, 5)

    if (genres.length === 0) {
      genres.push('pop') // Default fallback
    }

    const params = new URLSearchParams({
      seed_genres: genres.join(','),
      limit: limit.toString(),
      market: 'US',
    })

    const data = await this.fetch(`/recommendations?${params}`)
    return data.tracks || []
  }

  async getNewReleases(limit: number = 50): Promise<SpotifyTrack[]> {
    const params = new URLSearchParams({
      limit: limit.toString(),
      country: 'US',
    })

    const data = await this.fetch(`/browse/new-releases?${params}`)

    // Extract tracks from albums
    const tracks: SpotifyTrack[] = []

    for (const album of data.albums.items.slice(0, 20)) {
      try {
        const albumData = await this.fetch(`/albums/${album.id}`)
        tracks.push(...albumData.tracks.items.slice(0, 2))
      } catch (error) {
        console.error(`Failed to fetch album ${album.id}:`, error)
      }
    }

    return tracks.filter(t => t !== undefined)
  }

  async createPlaylist(
    userId: string,
    name: string,
    description: string
  ): Promise<SpotifyPlaylist> {
    return this.fetch(`/users/${userId}/playlists`, {
      method: 'POST',
      body: JSON.stringify({
        name,
        description,
        public: true,
      }),
    })
  }

  async addTracksToPlaylist(
    playlistId: string,
    trackUris: string[]
  ): Promise<void> {
    await this.fetch(`/playlists/${playlistId}/tracks`, {
      method: 'POST',
      body: JSON.stringify({
        uris: trackUris,
      }),
    })
  }

  async getPlaylist(playlistId: string): Promise<SpotifyPlaylist> {
    return this.fetch(`/playlists/${playlistId}`)
  }
}

export async function exchangeCodeForToken(
  code: string
): Promise<SpotifyTokenResponse> {
  const params = new URLSearchParams({
    grant_type: 'authorization_code',
    code,
    redirect_uri: process.env.NEXT_PUBLIC_REDIRECT_URI!,
  })

  const response = await fetch(`${SPOTIFY_ACCOUNTS_BASE}/api/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${Buffer.from(
        `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
      ).toString('base64')}`,
    },
    body: params.toString(),
  })

  if (!response.ok) {
    throw new Error('Failed to exchange code for token')
  }

  return response.json()
}

export async function refreshAccessToken(
  refreshToken: string
): Promise<SpotifyTokenResponse> {
  const params = new URLSearchParams({
    grant_type: 'refresh_token',
    refresh_token: refreshToken,
  })

  const response = await fetch(`${SPOTIFY_ACCOUNTS_BASE}/api/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${Buffer.from(
        `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
      ).toString('base64')}`,
    },
    body: params.toString(),
  })

  if (!response.ok) {
    throw new Error('Failed to refresh access token')
  }

  return response.json()
}

export function getAuthorizationUrl(): string {
  const scopes = [
    'user-read-private',
    'user-read-email',
    'playlist-modify-public',
    'playlist-modify-private',
  ]

  const params = new URLSearchParams({
    client_id: process.env.SPOTIFY_CLIENT_ID!,
    response_type: 'code',
    redirect_uri: process.env.NEXT_PUBLIC_REDIRECT_URI!,
    scope: scopes.join(' '),
  })

  return `${SPOTIFY_ACCOUNTS_BASE}/authorize?${params.toString()}`
}
