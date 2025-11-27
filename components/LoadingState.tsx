'use client'

import { useEffect, useState } from 'react'

const loadingSteps = [
  'Analyzing your prompt with AI...',
  'Searching for the perfect tracks...',
  'Creating your playlist...',
  'Adding tracks to Spotify...',
]

export default function LoadingState() {
  const [step, setStep] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setStep((prev) => (prev < loadingSteps.length - 1 ? prev + 1 : prev))
    }, 2000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="w-full max-w-md mx-auto space-y-8">
      <div className="flex justify-center">
        <div className="relative">
          <div className="w-24 h-24 border-4 border-spotify-green/20 rounded-full"></div>
          <div className="w-24 h-24 border-4 border-spotify-green border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
        </div>
      </div>

      <div className="space-y-4">
        {loadingSteps.map((text, index) => (
          <div
            key={index}
            className={`text-center transition-all duration-500 ${
              index === step
                ? 'text-white font-medium'
                : index < step
                ? 'text-gray-600'
                : 'text-gray-700'
            }`}
          >
            {index < step && '✓ '}
            {text}
          </div>
        ))}
      </div>
    </div>
  )
}
