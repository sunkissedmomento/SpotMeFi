export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          spotify_id: string
          email: string | null
          display_name: string | null
          profile_image: string | null
          access_token: string | null
          refresh_token: string | null
          token_expires_at: number | null
          created_at: string
          last_login: string
        }
        Insert: {
          id?: string
          spotify_id: string
          email?: string | null
          display_name?: string | null
          profile_image?: string | null
          access_token?: string | null
          refresh_token?: string | null
          token_expires_at?: number | null
          created_at?: string
          last_login?: string
        }
        Update: {
          id?: string
          spotify_id?: string
          email?: string | null
          display_name?: string | null
          profile_image?: string | null
          access_token?: string | null
          refresh_token?: string | null
          token_expires_at?: number | null
          created_at?: string
          last_login?: string
        }
      }
      playlists: {
        Row: {
          id: string
          user_id: string
          prompt: string
          playlist_name: string
          playlist_description: string | null
          playlist_id_spotify: string
          track_count: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          prompt: string
          playlist_name: string
          playlist_description?: string | null
          playlist_id_spotify: string
          track_count?: number
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          prompt?: string
          playlist_name?: string
          playlist_description?: string | null
          playlist_id_spotify?: string
          track_count?: number
          created_at?: string
        }
      }
    }
  }
}
