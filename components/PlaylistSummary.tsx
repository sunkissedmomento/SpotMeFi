'use client'

import Image from 'next/image'

interface Track {
  id: string
  name: string
  artists: string
  album: string
  image: string | null
}

interface Playlist {
  id: string
  name: string
  description: string
  url: string
  image: string | null
  trackCount: number
  tracks: Track[]
}

interface PlaylistSummaryProps {
  playlist: Playlist
  onCreateAnother: () => void
  onRefine?: () => void
}

export default function PlaylistSummary({
  playlist,
  onCreateAnother,
  onRefine,
}: PlaylistSummaryProps) {
  return (
    <div className="w-full max-w-3xl mx-auto space-y-6">
      <div className="glass rounded-2xl p-8 space-y-6">
        <div className="flex items-start gap-6">
          {playlist.image && (
            <div className="relative w-32 h-32 flex-shrink-0 rounded-lg overflow-hidden">
              <Image
                src={playlist.image}
                alt={playlist.name}
                fill
                className="object-cover"
              />
            </div>
          )}
          <div className="flex-1 space-y-2">
            <h2 className="text-3xl font-bold">{playlist.name}</h2>
            <p className="text-gray-400">{playlist.description}</p>
            <p className="text-sm text-gray-500">
              {playlist.trackCount} tracks
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <a
            href={playlist.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 bg-spotify-green hover:bg-spotify-green/90 text-white font-semibold py-3 px-6 rounded-full transition-all duration-200 text-center"
          >
            Open in Spotify
          </a>
          {onRefine && (
            <button
              onClick={onRefine}
              className="flex-1 glass hover:bg-white/10 text-white font-semibold py-3 px-6 rounded-full transition-all duration-200"
            >
              Refine Playlist
            </button>
          )}
          <button
            onClick={onCreateAnother}
            className="flex-1 glass hover:bg-white/10 text-white font-semibold py-3 px-6 rounded-full transition-all duration-200"
          >
            Create Another
          </button>
        </div>
      </div>

      <div className="glass rounded-2xl p-6 space-y-4">
        <h3 className="font-semibold text-lg">Track List</h3>
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {playlist.tracks.map((track, index) => (
            <div
              key={track.id}
              className="flex items-center gap-4 p-3 rounded-lg hover:bg-white/5 transition-colors"
            >
              <span className="text-gray-500 text-sm w-6">{index + 1}</span>
              {track.image && (
                <div className="relative w-12 h-12 flex-shrink-0 rounded overflow-hidden">
                  <Image
                    src={track.image}
                    alt={track.name}
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{track.name}</p>
                <p className="text-sm text-gray-400 truncate">{track.artists}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
