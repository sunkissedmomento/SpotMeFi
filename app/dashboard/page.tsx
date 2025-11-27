'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import PromptInput from '@/components/PromptInput'
import LoadingState from '@/components/LoadingState'
import PlaylistSummary from '@/components/PlaylistSummary'

interface User {
  id: string
  display_name: string
  profile_image: string | null
}

interface Playlist {
  id: string
  name: string
  description: string
  url: string
  image: string | null
  trackCount: number
  tracks: Array<{
    id: string
    name: string
    artists: string
    album: string
    image: string | null
  }>
}

interface PlaylistHistory {
  id: string
  prompt: string
  playlist_name: string
  playlist_id_spotify: string
  track_count: number
  created_at: string
}

type ViewState = 'prompt' | 'loading' | 'result' | 'history'

export default function Dashboard() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [viewState, setViewState] = useState<ViewState>('prompt')
  const [generatedPlaylist, setGeneratedPlaylist] = useState<Playlist | null>(
    null
  )
  const [history, setHistory] = useState<PlaylistHistory[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (!data.user) {
          router.push('/')
        } else {
          setUser(data.user)
        }
      })

    fetch('/api/playlists')
      .then((res) => res.json())
      .then((data) => {
        if (data.playlists) {
          setHistory(data.playlists)
        }
      })
  }, [router])

  const handleGeneratePlaylist = async (prompt: string) => {
    setViewState('loading')
    setError(null)

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate playlist')
      }

      setGeneratedPlaylist(data.playlist)
      setViewState('result')

      fetch('/api/playlists')
        .then((res) => res.json())
        .then((data) => {
          if (data.playlists) {
            setHistory(data.playlists)
          }
        })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      setViewState('prompt')
    }
  }

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/')
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen">
      <nav className="border-b border-white/10 bg-black/20 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">
            Spot<span className="text-gradient">Mefi</span>
          </h1>

          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                setViewState('history')
                setGeneratedPlaylist(null)
              }}
              className="text-gray-400 hover:text-white transition-colors"
            >
              History
            </button>
            <button
              onClick={() => {
                setViewState('prompt')
                setGeneratedPlaylist(null)
              }}
              className="text-gray-400 hover:text-white transition-colors"
            >
              New Playlist
            </button>
            <div className="h-6 w-px bg-white/10"></div>
            <span className="text-sm text-gray-400">{user.display_name}</span>
            <button
              onClick={handleLogout}
              className="text-sm text-gray-400 hover:text-white transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-12">
        {error && (
          <div className="max-w-3xl mx-auto mb-6 glass rounded-lg p-4 border-red-500/50">
            <p className="text-red-400 text-center">{error}</p>
          </div>
        )}

        {viewState === 'prompt' && (
          <div className="space-y-12">
            <div className="text-center space-y-2">
              <h2 className="text-4xl font-bold">Create a Playlist</h2>
              <p className="text-gray-400">
                Describe what you want to hear and let AI do the rest
              </p>
            </div>
            <PromptInput
              onSubmit={handleGeneratePlaylist}
              isLoading={false}
            />
          </div>
        )}

        {viewState === 'loading' && (
          <div className="py-12">
            <LoadingState />
          </div>
        )}

        {viewState === 'result' && generatedPlaylist && (
          <div className="space-y-8">
            <div className="text-center space-y-2">
              <h2 className="text-4xl font-bold">Your Playlist is Ready!</h2>
              <p className="text-gray-400">
                Created and added to your Spotify account
              </p>
            </div>
            <PlaylistSummary
              playlist={generatedPlaylist}
              onCreateAnother={() => {
                setViewState('prompt')
                setGeneratedPlaylist(null)
              }}
            />
          </div>
        )}

        {viewState === 'history' && (
          <div className="space-y-8">
            <div className="text-center space-y-2">
              <h2 className="text-4xl font-bold">Your Playlists</h2>
              <p className="text-gray-400">
                View all your AI-generated playlists
              </p>
            </div>

            {history.length === 0 ? (
              <div className="glass rounded-2xl p-12 text-center space-y-4">
                <p className="text-gray-400">No playlists yet</p>
                <button
                  onClick={() => setViewState('prompt')}
                  className="bg-spotify-green hover:bg-spotify-green/90 text-white font-semibold py-3 px-6 rounded-full transition-all duration-200"
                >
                  Create Your First Playlist
                </button>
              </div>
            ) : (
              <div className="max-w-3xl mx-auto space-y-4">
                {history.map((item) => (
                  <div
                    key={item.id}
                    className="glass rounded-lg p-6 hover:bg-white/10 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-2">
                        <h3 className="font-semibold text-lg">
                          {item.playlist_name}
                        </h3>
                        <p className="text-sm text-gray-400">
                          Prompt: {item.prompt}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span>{item.track_count} tracks</span>
                          <span>
                            {new Date(item.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <a
                        href={`https://open.spotify.com/playlist/${item.playlist_id_spotify}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-spotify-green hover:bg-spotify-green/90 text-white text-sm font-semibold py-2 px-4 rounded-full transition-all duration-200"
                      >
                        Open
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
