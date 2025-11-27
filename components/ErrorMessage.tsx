'use client'

interface ErrorMessageProps {
  message: string
  onDismiss?: () => void
}

export default function ErrorMessage({ message, onDismiss }: ErrorMessageProps) {
  return (
    <div className="w-full max-w-3xl mx-auto mb-6">
      <div className="glass rounded-lg p-4 border border-red-500/50 flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <span className="text-red-400 text-xl">⚠️</span>
          <div className="space-y-1">
            <p className="text-red-400 font-medium">Error</p>
            <p className="text-gray-300 text-sm">{message}</p>
          </div>
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="text-gray-500 hover:text-white transition-colors"
            aria-label="Dismiss"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  )
}
