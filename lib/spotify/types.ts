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
  popularity: number
  explicit?: boolean
  duration_ms?: number
  preview_url?: string
}

export interface SpotifyAudioFeatures {
  id: string
  acousticness: number        // 0.0 - 1.0
  danceability: number        // 0.0 - 1.0
  energy: number              // 0.0 - 1.0
  instrumentalness: number    // 0.0 - 1.0
  key: number                 // 0 - 11 (pitch class)
  liveness: number            // 0.0 - 1.0
  loudness: number            // -60 - 0 dB
  mode: number                // 0 = minor, 1 = major
  speechiness: number         // 0.0 - 1.0
  tempo: number               // BPM
  time_signature: number      // 3 - 7
  valence: number             // 0.0 - 1.0 (musical positiveness)
}

export interface SpotifyTrackWithFeatures extends SpotifyTrack {
  audioFeatures?: SpotifyAudioFeatures
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
