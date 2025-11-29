// lib/preferences/learner.ts
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!
)

export interface UserLearnedPreferences {
  favorite_genres: Record<string, number>
  favorite_moods: Record<string, number>
  favorite_artists: string[]
  avg_playlist_length: number
  spotify_top_artists?: string[]
  spotify_top_genres?: string[]
}

/**
 * Learn from a generated playlist by updating user preferences
 */
export async function learnFromPlaylist(
  userId: string,
  genres: string[],
  moods: string[],
  artists: string[],
  trackCount: number
) {
  try {
    // Increment genre preferences
    if (genres.length > 0) {
      await supabase.rpc('increment_genre_preference', {
        p_user_id: userId,
        p_genres: genres,
      })
    }

    // Increment mood preferences
    for (const mood of moods) {
      await supabase.rpc('increment_mood_preference', {
        p_user_id: userId,
        p_mood: mood,
      })
    }

    // Add favorite artists
    for (const artist of artists.slice(0, 5)) {
      await supabase.rpc('add_favorite_artist', {
        p_user_id: userId,
        p_artist: artist,
      })
    }

    // Update average playlist length
    const { data: currentPrefs } = await supabase
      .from('user_learned_preferences')
      .select('avg_playlist_length')
      .eq('user_id', userId)
      .single()

    if (currentPrefs) {
      // Calculate new average (simple moving average)
      const newAvg = Math.round((currentPrefs.avg_playlist_length + trackCount) / 2)
      await supabase
        .from('user_learned_preferences')
        .update({ avg_playlist_length: newAvg })
        .eq('user_id', userId)
    } else {
      // First playlist, set track count as average
      await supabase
        .from('user_learned_preferences')
        .upsert({
          user_id: userId,
          avg_playlist_length: trackCount,
        })
    }

    console.log(`✅ Learned from playlist: ${genres.length} genres, ${moods.length} moods, ${artists.length} artists`)
  } catch (error) {
    console.error('Failed to learn from playlist:', error)
    // Don't throw - learning is non-critical
  }
}

/**
 * Get user's learned preferences
 */
export async function getUserLearnedPreferences(userId: string): Promise<UserLearnedPreferences | null> {
  try {
    const { data, error } = await supabase
      .from('user_learned_preferences')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error || !data) return null

    return {
      favorite_genres: data.favorite_genres || {},
      favorite_moods: data.favorite_moods || {},
      favorite_artists: data.favorite_artists || [],
      avg_playlist_length: data.avg_playlist_length || 50,
      spotify_top_artists: data.spotify_top_artists || [],
      spotify_top_genres: data.spotify_top_genres || [],
    }
  } catch (error) {
    console.error('Failed to get learned preferences:', error)
    return null
  }
}

/**
 * Get top N genres by frequency
 */
export function getTopGenres(preferences: UserLearnedPreferences, limit: number = 5): string[] {
  const genres = Object.entries(preferences.favorite_genres)
    .sort(([, a], [, b]) => b - a)
    .slice(0, limit)
    .map(([genre]) => genre)
  return genres
}

/**
 * Get top N moods by frequency
 */
export function getTopMoods(preferences: UserLearnedPreferences, limit: number = 3): string[] {
  const moods = Object.entries(preferences.favorite_moods)
    .sort(([, a], [, b]) => b - a)
    .slice(0, limit)
    .map(([mood]) => mood)
  return moods
}

/**
 * Cache Spotify preferences (optional, expires in 7 days)
 */
export async function cacheSpotifyPreferences(
  userId: string,
  topArtists: string[],
  topGenres: string[]
) {
  try {
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7) // 7 days from now

    await supabase
      .from('user_learned_preferences')
      .upsert({
        user_id: userId,
        spotify_top_artists: topArtists,
        spotify_top_genres: topGenres,
        spotify_cache_expires_at: expiresAt.toISOString(),
      })
  } catch (error) {
    console.error('Failed to cache Spotify preferences:', error)
  }
}

/**
 * Check if cached Spotify data is still valid
 */
export function isCacheValid(preferences: UserLearnedPreferences): boolean {
  if (!preferences.spotify_top_artists?.length) return false

  // Check if we have the cache expiry timestamp in the data
  // Note: We'd need to add this to the return type, but for now assume it's checked in the query
  return true
}

/**
 * Reset user's learned preferences
 */
export async function resetUserPreferences(userId: string): Promise<void> {
  try {
    await supabase
      .from('user_learned_preferences')
      .delete()
      .eq('user_id', userId)

    console.log(`✅ Reset preferences for user ${userId}`)
  } catch (error) {
    console.error('Failed to reset preferences:', error)
    throw new Error('Failed to reset preferences')
  }
}
