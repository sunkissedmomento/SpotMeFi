'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import PromptInput from '@/components/PromptInput'
import LoadingState from '@/components/LoadingState'
import PlaylistSummary from '@/components/PlaylistSummary'
import PlaylistRefineModal from '@/components/PlaylistRefineModal'

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

const bugMessages = [
  "🧪 We're still teaching the AI the difference between jazz and jazzercise. Results may vary. Bugs included at no extra charge! 🎷🐞",
  "⚠️ Beta Mode Active: This app is currently being tested in the wild. Bugs may appear like unexpected collaborators on your playlist. 🎵🐛",
  "🔬 Testing in Production: Because that's where all the best bugs live. Your playlists might have a few surprise features! 🎸🪲",
  "🎪 Caution: AI Under Construction: May occasionally confuse death metal with lullabies. Sleep tight! 🤘😴",
  "🚧 Work in Progress: Sometimes our AI thinks every song is by The Beatles. We're working on it! 🪲🎼",
  "🎲 Rolling the Dice: This playlist generator has a mind of its own. Bugs are just bonus tracks! 🎰🐜",
  "🎭 Experimental Phase: Our AI is still learning. It once made a 'chill vibes' playlist with only screamo. Good times! 🧘‍♂️🔊",
  "🌈 Beta Version: Where bugs aren't mistakes, they're Easter eggs! Enjoy the surprises! 🥚🐛",
  "🎯 Almost Perfect: 60% of the time, it works every time. The other 40%? Pure chaos and magic! ✨🎪",
  "🎨 Creative Mode: Sometimes the AI gets a little too creative. Last week it invented a new genre. We're still not sure what it is. 🎵❓",
  "🔮 Fortune Telling: Will your playlist be fire or will it be... interesting? Only one way to find out! 🔥🎲",
  "🎸 Rock & Debug: This app rocks, but sometimes it bugs. It's all part of the experience! 🪨🐞",
  "🎺 Jazz Hands Mode: Smooth like jazz, unpredictable like jazz. Bugs sold separately (just kidding, they're free)! 🎷😎",
  "🎤 Mic Check 1-2: Is this thing on? Testing, testing... bugs, bugs, bugs! 🎙️🐜",
  "🎹 Beta Symphony: Each bug plays its own unique note in the chaos orchestra. Enjoy the show! 🎼🦗"
]

export default function Dashboard() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [viewState, setViewState] = useState<ViewState>('prompt')
  const [generatedPlaylist, setGeneratedPlaylist] = useState<Playlist | null>(
    null
  )
  const [history, setHistory] = useState<PlaylistHistory[]>([])
  const [error, setError] = useState<string | null>(null)
  const [bugMessage] = useState(() => bugMessages[Math.floor(Math.random() * bugMessages.length)])
  const [isRefineModalOpen, setIsRefineModalOpen] = useState(false)
  const [currentPlaylistId, setCurrentPlaylistId] = useState<string | null>(null)

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

  const handleRefinePlaylist = async (refinementPrompt: string) => {
    if (!currentPlaylistId) return

    setError(null)

    try {
      const response = await fetch(`/api/playlists/${currentPlaylistId}/refine`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refinementPrompt }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to refine playlist')
      }

      // Update the generated playlist with refined version
      setGeneratedPlaylist(data.playlist)

      // Refresh history
      fetch('/api/playlists')
        .then((res) => res.json())
        .then((data) => {
          if (data.playlists) {
            setHistory(data.playlists)
          }
        })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
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
            <div className="text-sm">
              <span className="text-gray-500">Playlists: </span>
              <span className={history.length >= 5 ? "text-red-400 font-semibold" : "text-spotify-green font-semibold"}>
                {history.length}/5
              </span>
            </div>
            <div className="h-6 w-px bg-white/10"></div>
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
            <button
              onClick={() => router.push('/preferences')}
              className="text-gray-400 hover:text-white transition-colors"
            >
              Preferences
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
        <div className="max-w-3xl mx-auto mb-6 glass rounded-lg p-4 border-yellow-500/30 bg-yellow-500/5">
          <p className="text-yellow-400 text-center text-sm">
            {bugMessage}
          </p>
        </div>

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
              onRefine={() => {
                setCurrentPlaylistId(generatedPlaylist.id)
                setIsRefineModalOpen(true)
              }}
            />
            <PlaylistRefineModal
              isOpen={isRefineModalOpen}
              onClose={() => setIsRefineModalOpen(false)}
              onRefine={handleRefinePlaylist}
              playlistName={generatedPlaylist.name}
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