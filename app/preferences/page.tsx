'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface LearnedPreferences {
  favorite_genres: Record<string, number>
  favorite_moods: Record<string, number>
  favorite_artists: string[]
  avg_playlist_length: number
}

export default function PreferencesPage() {
  const router = useRouter()
  const [preferences, setPreferences] = useState<LearnedPreferences | null>(null)
  const [loading, setLoading] = useState(true)
  const [resetting, setResetting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchPreferences()
  }, [])

  const fetchPreferences = async () => {
    try {
      const response = await fetch('/api/preferences')
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch preferences')
      }

      setPreferences(data.preferences)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleReset = async () => {
    if (!confirm('Are you sure you want to reset your learned preferences? This cannot be undone.')) {
      return
    }

    setResetting(true)
    setError(null)

    try {
      const response = await fetch('/api/preferences', {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to reset preferences')
      }

      setPreferences(null)
      alert('Preferences reset successfully!')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setResetting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-spotify-green"></div>
      </div>
    )
  }

  const hasPreferences = preferences && (
    Object.keys(preferences.favorite_genres).length > 0 ||
    Object.keys(preferences.favorite_moods).length > 0 ||
    preferences.favorite_artists.length > 0
  )

  // Sort genres and moods by frequency
  const sortedGenres = preferences
    ? Object.entries(preferences.favorite_genres).sort(([, a], [, b]) => b - a)
    : []
  const sortedMoods = preferences
    ? Object.entries(preferences.favorite_moods).sort(([, a], [, b]) => b - a)
    : []

  return (
    <div className="min-h-screen">
      <nav className="border-b border-white/10 bg-black/20 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">
            Spot<span className="text-gradient">Mefi</span>
          </h1>
          <button
            onClick={() => router.push('/dashboard')}
            className="text-gray-400 hover:text-white transition-colors"
          >
            ← Back to Dashboard
          </button>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center space-y-2 mb-12">
          <h2 className="text-4xl font-bold">Your Music Preferences</h2>
          <p className="text-gray-400">
            SpotMefi learns from your playlist requests to make better recommendations
          </p>
        </div>

        {error && (
          <div className="mb-6 glass rounded-lg p-4 border-red-500/50">
            <p className="text-red-400 text-center">{error}</p>
          </div>
        )}

        {!hasPreferences ? (
          <div className="glass rounded-2xl p-12 text-center space-y-4">
            <p className="text-gray-400 text-lg">No preferences learned yet</p>
            <p className="text-gray-500 text-sm">
              Create a few playlists and SpotMefi will start learning your music taste!
            </p>
            <button
              onClick={() => router.push('/dashboard')}
              className="bg-spotify-green hover:bg-spotify-green/90 text-white font-semibold py-3 px-6 rounded-full transition-all duration-200 mt-4"
            >
              Create Your First Playlist
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Favorite Genres */}
            {sortedGenres.length > 0 && (
              <div className="glass rounded-2xl p-6">
                <h3 className="text-xl font-semibold mb-4">Favorite Genres</h3>
                <div className="space-y-3">
                  {sortedGenres.map(([genre, count]) => (
                    <div key={genre} className="flex items-center justify-between">
                      <span className="text-gray-300 capitalize">{genre}</span>
                      <div className="flex items-center gap-3">
                        <div className="w-32 h-2 bg-white/10 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-spotify-green rounded-full"
                            style={{
                              width: `${Math.min((count / Math.max(...sortedGenres.map(([, c]) => c))) * 100, 100)}%`,
                            }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-500 w-16 text-right">
                          {count} {count === 1 ? 'time' : 'times'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Favorite Moods */}
            {sortedMoods.length > 0 && (
              <div className="glass rounded-2xl p-6">
                <h3 className="text-xl font-semibold mb-4">Preferred Moods</h3>
                <div className="space-y-3">
                  {sortedMoods.map(([mood, count]) => (
                    <div key={mood} className="flex items-center justify-between">
                      <span className="text-gray-300 capitalize">{mood}</span>
                      <div className="flex items-center gap-3">
                        <div className="w-32 h-2 bg-white/10 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-spotify-green rounded-full"
                            style={{
                              width: `${Math.min((count / Math.max(...sortedMoods.map(([, c]) => c))) * 100, 100)}%`,
                            }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-500 w-16 text-right">
                          {count} {count === 1 ? 'time' : 'times'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Favorite Artists */}
            {preferences.favorite_artists.length > 0 && (
              <div className="glass rounded-2xl p-6">
                <h3 className="text-xl font-semibold mb-4">Frequently Requested Artists</h3>
                <div className="flex flex-wrap gap-2">
                  {preferences.favorite_artists.map((artist) => (
                    <span
                      key={artist}
                      className="px-4 py-2 bg-white/10 rounded-full text-sm text-gray-300"
                    >
                      {artist}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Average Playlist Length */}
            <div className="glass rounded-2xl p-6">
              <h3 className="text-xl font-semibold mb-4">Typical Playlist Length</h3>
              <p className="text-3xl font-bold text-spotify-green">
                {preferences.avg_playlist_length} tracks
              </p>
            </div>

            {/* Reset Button */}
            <div className="glass rounded-2xl p-6 border-red-500/30">
              <h3 className="text-xl font-semibold mb-2">Reset Preferences</h3>
              <p className="text-gray-400 text-sm mb-4">
                This will clear all learned preferences. SpotMefi will start learning from scratch.
              </p>
              <button
                onClick={handleReset}
                disabled={resetting}
                className="bg-red-500 hover:bg-red-600 disabled:bg-red-500/50 text-white font-semibold py-2 px-6 rounded-full transition-all duration-200"
              >
                {resetting ? 'Resetting...' : 'Reset All Preferences'}
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
