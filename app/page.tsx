'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const bugMessages = [
  "🧪 We're still teaching the AI the difference between jazz and jazzercise. Results may vary. Bugs included at no extra charge! 🎷🐞",
  "⚠️ Beta Mode Active: This app is currently being tested in the wild. Bugs may appear like unexpected collaborators on your playlist. 🎵🐛",
  "🔬 Testing in Production: Because that's where all the best bugs live. Your playlists might have a few surprise features! 🎸🪲",
  "🎪 Caution: AI Under Construction: May occasionally confuse death metal with lullabies. Sleep tight! 🤘😴",
  "🚧 Work in Progress: Sometimes our AI thinks every song is by The Beatles. We're working on it! 🪲🎼",
  "🎲 Rolling the Dice: This playlist generator has a mind of its own. Bugs are just bonus tracks! 🎰🐜"
]

export default function Home() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [bugMessage] = useState(() => bugMessages[Math.floor(Math.random() * bugMessages.length)])

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const errorParam = params.get('error')

    if (errorParam) {
      setError('Authentication failed. Please try again.')
    }

    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (data.user) {
          router.push('/dashboard')
        }
      })
  }, [router])

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="max-w-2xl w-full text-center space-y-8">
        <div className="space-y-4">
          <h1 className="text-6xl md:text-7xl font-bold tracking-tight">
            Spot<span className="text-gradient">Mefi</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-400 font-light">
            Create perfect playlists from your thoughts
          </p>
        </div>

        <div className="glass rounded-lg p-4 border-yellow-500/30 bg-yellow-500/5 max-w-xl mx-auto">
          <p className="text-yellow-400 text-sm">
            {bugMessage}
          </p>
        </div>

        <div className="glass rounded-2xl p-8 md:p-12 space-y-6">
          <p className="text-gray-300 leading-relaxed">
            Describe the vibe, mood, or theme you want—our AI will craft a
            personalized Spotify playlist just for you.
          </p>

          <div className="space-y-3">
            <Link
              href="/api/auth/login"
              className="block w-full bg-spotify-green hover:bg-spotify-green/90 text-white font-semibold py-4 px-8 rounded-full transition-all duration-200 transform hover:scale-105"
            >
              Sign in with Spotify
            </Link>

            {error && (
              <p className="text-red-400 text-sm">{error}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8">
          <div className="space-y-2">
            <div className="text-4xl">🎵</div>
            <h3 className="font-semibold">Describe Your Mood</h3>
            <p className="text-sm text-gray-400">
              Use natural language to express what you want to hear
            </p>
          </div>
          <div className="space-y-2">
            <div className="text-4xl">✨</div>
            <h3 className="font-semibold">AI Magic</h3>
            <p className="text-sm text-gray-400">
              Claude interprets your prompt and finds the perfect tracks
            </p>
          </div>
          <div className="space-y-2">
            <div className="text-4xl">🎧</div>
            <h3 className="font-semibold">Instant Playlist</h3>
            <p className="text-sm text-gray-400">
              Your playlist is created and ready in your Spotify account
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}