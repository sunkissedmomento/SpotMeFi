export interface SpotifyUser {
  id: string
  display_name: string
  email: string
  images: { url: string }[]
}

export interface SpotifyTokenResponse {
  access_token: string
  token_type: string
  scope: string
  expires_in: number
  refresh_token?: string
}

export interface SpotifyTrack {
  id: string
  name: string
  artists: { name: string }[]
  album: {
    name: string
    images: { url: string }[]
  }
  uri: string
}

export interface SpotifyPlaylist {
  id: string
  name: string
  description: string
  external_urls: {
    spotify: string
  }
  images: { url: string }[]
  tracks: {
    total: number
  }
}

export interface SpotifySearchResponse {
  tracks: {
    items: SpotifyTrack[]
  }
}
