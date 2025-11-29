'use client'

import { useState } from 'react'

interface PlaylistRefineModalProps {
  isOpen: boolean
  onClose: () => void
  onRefine: (refinementPrompt: string) => Promise<void>
  playlistName: string
}

export default function PlaylistRefineModal({
  isOpen,
  onClose,
  onRefine,
  playlistName,
}: PlaylistRefineModalProps) {
  const [refinementPrompt, setRefinementPrompt] = useState('')
  const [isRefining, setIsRefining] = useState(false)

  const suggestions = [
    'Add more upbeat songs',
    'Remove slow tracks',
    'Make it more energetic',
    'Add 10 similar songs',
    'Remove all ballads',
    'Add more recent tracks',
    'Make it more chill',
    'Add instrumental versions',
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!refinementPrompt.trim() || isRefining) return

    setIsRefining(true)
    try {
      await onRefine(refinementPrompt.trim())
      setRefinementPrompt('')
      onClose()
    } catch (error) {
      console.error('Failed to refine playlist:', error)
    } finally {
      setIsRefining(false)
    }
  }

  const handleSuggestionClick = (suggestion: string) => {
    setRefinementPrompt(suggestion)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="glass rounded-2xl w-full max-w-2xl p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Refine Playlist</h2>
            <p className="text-sm text-gray-400 mt-1">{playlistName}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
            disabled={isRefining}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="refinement" className="block text-sm font-medium mb-2">
              What would you like to change?
            </label>
            <textarea
              id="refinement"
              value={refinementPrompt}
              onChange={(e) => setRefinementPrompt(e.target.value)}
              placeholder="E.g., add more upbeat songs, remove slow tracks, make it more energetic..."
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-spotify-green transition-colors resize-none"
              rows={3}
              disabled={isRefining}
            />
          </div>

          <div>
            <p className="text-sm text-gray-400 mb-3">Suggestions:</p>
            <div className="grid grid-cols-2 gap-2">
              {suggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="text-left text-sm bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg px-3 py-2 transition-colors"
                  disabled={isRefining}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 glass hover:bg-white/10 text-white font-semibold py-3 px-6 rounded-full transition-all duration-200"
              disabled={isRefining}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!refinementPrompt.trim() || isRefining}
              className="flex-1 bg-spotify-green hover:bg-spotify-green/90 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-full transition-all duration-200"
            >
              {isRefining ? 'Refining...' : 'Refine Playlist'}
            </button>
          </div>
        </form>

        <div className="bg-white/5 rounded-lg p-4 text-sm text-gray-400">
          <p className="font-medium text-white mb-1">How it works:</p>
          <ul className="space-y-1 list-disc list-inside">
            <li>AI analyzes your refinement request</li>
            <li>Adds or removes tracks to match your request</li>
            <li>Changes are applied to your Spotify playlist</li>
            <li>Takes about 10-12 seconds</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
