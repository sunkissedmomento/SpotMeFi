'use client'

import { useState } from 'react'

interface PromptInputProps {
  onSubmit: (prompt: string) => void
  isLoading: boolean
}

export default function PromptInput({ onSubmit, isLoading }: PromptInputProps) {
  const [prompt, setPrompt] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (prompt.trim() && !isLoading) {
      onSubmit(prompt.trim())
    }
  }

  const examplePrompts = [
    'chill synthwave for rainy late nights',
    'energetic 90s house music for a morning workout',
    'sad indie folk for contemplative walks',
    'upbeat jazz for Sunday brunch',
  ]

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="glass rounded-2xl p-2">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe the playlist you want to create..."
            className="w-full bg-transparent border-none outline-none text-white placeholder-gray-500 resize-none p-6 text-lg"
            rows={3}
            disabled={isLoading}
          />
        </div>

        <button
          type="submit"
          disabled={!prompt.trim() || isLoading}
          className="w-full bg-spotify-green hover:bg-spotify-green/90 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-semibold py-4 px-8 rounded-full transition-all duration-200 transform hover:scale-105 disabled:transform-none"
        >
          {isLoading ? 'Creating Your Playlist...' : 'Generate Playlist'}
        </button>
      </form>

      {!isLoading && (
        <div className="space-y-3">
          <p className="text-sm text-gray-500 text-center">Try these examples:</p>
          <div className="flex flex-wrap gap-2 justify-center">
            {examplePrompts.map((example, index) => (
              <button
                key={index}
                onClick={() => setPrompt(example)}
                className="text-xs bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white px-3 py-2 rounded-full transition-colors"
              >
                {example}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
