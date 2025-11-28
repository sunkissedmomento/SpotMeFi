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

  async searchArtistTracks(artistName: string, limit: number = 50): Promise<SpotifyTrack[]> {
    // First, search for the artist
    const artistParams = new URLSearchParams({
      q: artistName,
      type: 'artist',
      limit: '1',
    })

    const artistData: any = await this.fetch(`/search?${artistParams}`)

    if (!artistData.artists || artistData.artists.items.length === 0) {
      throw new Error(`Artist "${artistName}" not found on Spotify`)
    }

    const artist = artistData.artists.items[0]
    const artistId = artist.id
    const artistNameLower = artist.name.toLowerCase()
    console.log(`Found artist: ${artist.name} (ID: ${artistId})`)

    const tracks: SpotifyTrack[] = []

    // Strategy 1: Get artist's top tracks
    const topTracks: any = await this.fetch(`/artists/${artistId}/top-tracks?market=US`)
    tracks.push(...topTracks.tracks)

    // Strategy 2: Get tracks from artist's albums
    const albumsData: any = await this.fetch(`/artists/${artistId}/albums?limit=20&market=US&include_groups=album,single,appears_on`)

    for (const album of albumsData.items.slice(0, 15)) {
      try {
        const albumData: any = await this.fetch(`/albums/${album.id}`)

        // Add full track info with album data
        const albumTracks = albumData.tracks.items.map((track: any) => ({
          ...track,
          album: {
            id: albumData.id,
            name: albumData.name,
            images: albumData.images,
            release_date: albumData.release_date,
            total_tracks: albumData.total_tracks,
            uri: albumData.uri,
            external_urls: albumData.external_urls,
          },
          popularity: track.popularity || albumData.popularity || 50,
        }))

        tracks.push(...albumTracks)
      } catch (error) {
        console.error(`Failed to fetch album ${album.id}:`, error)
      }
    }

    // Strategy 3: Search for tracks featuring the artist
    try {
      const featureParams = new URLSearchParams({
        q: `artist:${artistName}`,
        type: 'track',
        limit: '50',
      })

      const featureData: SpotifySearchResponse = await this.fetch(`/search?${featureParams}`)
      const featureTracks = featureData.tracks.items.filter(track =>
        track.artists.some((a: any) => a.id === artistId || a.name.toLowerCase().includes(artistNameLower))
      )
      tracks.push(...featureTracks)
      console.log(`Found ${featureTracks.length} tracks via search (including features)`)
    } catch (error) {
      console.error('Failed to search for featured tracks:', error)
    }

    // Remove duplicates, filter to only include tracks with the artist, and return
    const uniqueTracks = tracks
      .filter((track, index, self) =>
        self.findIndex(t => t.id === track.id) === index
      )
      // Ensure the track actually has the artist (either main or featured)
      .filter(track =>
        track.artists && track.artists.some((a: any) =>
          a.id === artistId || a.name.toLowerCase().includes(artistNameLower)
        )
      )
      .slice(0, limit)

    console.log(`Total unique tracks found: ${uniqueTracks.length}`)
    return uniqueTracks
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

    // Add year filter FIRST for better relevance
    if (yearStart && yearEnd && yearStart === yearEnd) {
      // For single year (like 2025), search for that specific year
      queryParts.push(`year:${yearStart}`)
    } else if (yearStart && yearEnd) {
      queryParts.push(`year:${yearStart}-${yearEnd}`)
    } else if (yearStart) {
      queryParts.push(`year:${yearStart}`)
    }

    // Add genre filters (limited to 2 for better results)
    if (genres.length > 0) {
      queryParts.push(...genres.slice(0, 2).map(g => `genre:"${g}"`))
    }

    // Add keywords (filter out generic terms, limit to most relevant)
    const relevantKeywords = keywords
      .filter(k => !['song', 'music', 'track', 'songs', 'tracks'].includes(k.toLowerCase()))
      .slice(0, 2)

    if (relevantKeywords.length > 0) {
      queryParts.push(...relevantKeywords)
    }

    // If no specific query parts, search for current year
    const query = queryParts.length > 0 ? queryParts.join(' ') : 'year:2025'

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
    // Spotify has specific genre seeds - normalize common genres
    const genreMapping: Record<string, string> = {
      'hip-hop': 'hip-hop',
      'hiphop': 'hip-hop',
      'rap': 'hip-hop',
      'r&b': 'r-n-b',
      'rnb': 'r-n-b',
      'edm': 'dance',
      'electronic': 'dance',
      'indie': 'indie',
      'alternative': 'alternative',
      'rock': 'rock',
      'pop': 'pop',
      'country': 'country',
      'jazz': 'jazz',
      'classical': 'classical',
      'metal': 'metal',
      'punk': 'punk',
      'reggae': 'reggae',
      'blues': 'blues',
      'soul': 'soul',
      'funk': 'funk',
      'disco': 'disco',
      'house': 'house',
      'techno': 'techno',
      'ambient': 'ambient',
    }

    // Normalize and validate genres
    const validGenres = seedGenres
      .map(g => genreMapping[g.toLowerCase()] || g.toLowerCase().replace(/\s+/g, '-'))
      .slice(0, 5)

    if (validGenres.length === 0) {
      validGenres.push('pop') // Default fallback
    }

    const params = new URLSearchParams({
      seed_genres: validGenres.join(','),
      limit: limit.toString(),
      market: 'US',
    })

    try {
      const data = await this.fetch(`/recommendations?${params}`)
      return data.tracks || []
    } catch (error) {
      // If recommendations fail, return empty array
      console.error('Recommendations API error:', error)
      return []
    }
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

        // Map album tracks to full track objects with album info
        const albumTracks = albumData.tracks.items.slice(0, 2).map((track: any) => ({
          ...track,
          album: {
            id: albumData.id,
            name: albumData.name,
            images: albumData.images,
            release_date: albumData.release_date,
            total_tracks: albumData.total_tracks,
            uri: albumData.uri,
            external_urls: albumData.external_urls,
          },
          popularity: albumData.popularity || 50, // Use album popularity as fallback
        }))

        tracks.push(...albumTracks)
      } catch (error) {
        console.error(`Failed to fetch album ${album.id}:`, error)
      }
    }

    return tracks.filter(t => t !== undefined && t.album !== undefined)
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
