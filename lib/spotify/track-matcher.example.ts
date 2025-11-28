/**
 * Example demonstrating the Track Matching Checklist System
 *
 * This file shows how tracks are evaluated and scored against user prompts.
 */

import { scoreTrackMatch, rankTracksByMatch } from './track-matcher'
import { SpotifyTrackWithFeatures } from './types'
import { PlaylistIntent } from '../ai/claude'

// ============================================
// Example 1: "Energetic workout songs from 2024"
// ============================================

const examplePrompt1 = "Energetic workout songs from 2024"

const exampleIntent1: PlaylistIntent = {
  playlist_title: "Workout Energy 2024",
  playlist_description: "High-energy tracks to power your workout",
  genres: ["pop", "hip-hop", "electronic"],
  moods: ["energetic", "hype"],
  energy_level: "high",
  year_focus: "recent",
  year_range: { start: 2024, end: 2024 },
  include_popular: true,
  include_emerging: false,
  keywords: ["workout", "energy", "2024"],
}

const exampleTrack1: SpotifyTrackWithFeatures = {
  id: "track123",
  name: "Blinding Lights",
  artists: [{ name: "The Weeknd" }],
  album: {
    name: "After Hours",
    images: [{ url: "https://example.com/album.jpg" }],
  },
  uri: "spotify:track:track123",
  popularity: 95,
  audioFeatures: {
    id: "track123",
    acousticness: 0.001,      // Very electronic
    danceability: 0.514,      // Moderately danceable
    energy: 0.730,            // ✅ High energy (matches "high" requirement)
    instrumentalness: 0.000,  // Has vocals
    key: 1,
    liveness: 0.081,          // Studio recording
    loudness: -5.934,
    mode: 1,
    speechiness: 0.059,       // Sung, not rapped
    tempo: 171.029,           // ✅ Fast tempo (good for workout)
    time_signature: 4,
    valence: 0.334,           // Somewhat melancholic
  }
}

// Score the track
const score1 = scoreTrackMatch(exampleTrack1, exampleIntent1, examplePrompt1)

console.log("Example 1: Workout Songs")
console.log("========================")
console.log(`Track: ${score1.track.name} by ${score1.track.artists[0].name}`)
console.log(`Overall Score: ${score1.overallScore}/100`)
console.log("\nCategory Scores:")
console.log(`  Track Info: ${score1.categoryScores.trackInfo}/100`)
console.log(`  Genre: ${score1.categoryScores.genre}/100`)
console.log(`  Mood: ${score1.categoryScores.mood}/100`)
console.log(`  Context: ${score1.categoryScores.context}/100`)
console.log(`  Audio Features: ${score1.categoryScores.audioFeatures}/100`)
console.log(`  Time/Era: ${score1.categoryScores.timeEra}/100`)
console.log(`  Popularity: ${score1.categoryScores.popularity}/100`)
console.log(`  Language/Region: ${score1.categoryScores.languageRegion}/100`)
console.log(`  Sound: ${score1.categoryScores.sound}/100`)
console.log(`\nMatch Reason: ${score1.matchReason}`)
console.log("\nChecklist Breakdown:")
console.log("  ✅ Energy: 0.730 (High - matches requirement)")
console.log("  ✅ Tempo: 171 BPM (Fast - good for workout)")
console.log("  ✅ Popularity: 95 (Very popular - matches preference)")
console.log("  ❌ Year: 2020 (doesn't match 2024 requirement)")

// ============================================
// Example 2: "Sad acoustic songs from the 2000s"
// ============================================

const examplePrompt2 = "Sad acoustic songs from the 2000s"

const exampleIntent2: PlaylistIntent = {
  playlist_title: "Acoustic Melancholy 2000s",
  playlist_description: "Sad acoustic tracks from the 2000s",
  genres: ["acoustic", "indie", "folk"],
  moods: ["sad", "melancholic"],
  energy_level: "low",
  year_focus: "specific",
  year_range: { start: 2000, end: 2009 },
  include_popular: false,
  include_emerging: false,
  keywords: ["acoustic", "sad", "2000s"],
}

const exampleTrack2: SpotifyTrackWithFeatures = {
  id: "track456",
  name: "The Scientist",
  artists: [{ name: "Coldplay" }],
  album: {
    name: "A Rush of Blood to the Head",
    images: [{ url: "https://example.com/album2.jpg" }],
  },
  uri: "spotify:track:track456",
  popularity: 78,
  audioFeatures: {
    id: "track456",
    acousticness: 0.524,      // ✅ Somewhat acoustic
    danceability: 0.443,      // Not very danceable
    energy: 0.362,            // ✅ Low energy (matches requirement)
    instrumentalness: 0.000,  // Has vocals
    key: 9,
    liveness: 0.116,          // Studio recording
    loudness: -7.489,
    mode: 0,                  // ✅ Minor key (matches sad mood)
    speechiness: 0.038,       // Sung
    tempo: 146.441,           // Moderate tempo
    time_signature: 4,
    valence: 0.233,           // ✅ Low valence (sad/melancholic)
  }
}

const score2 = scoreTrackMatch(exampleTrack2, exampleIntent2, examplePrompt2)

console.log("\n\nExample 2: Sad Acoustic 2000s")
console.log("==============================")
console.log(`Track: ${score2.track.name} by ${score2.track.artists[0].name}`)
console.log(`Overall Score: ${score2.overallScore}/100`)
console.log("\nChecklist Breakdown:")
console.log("  ✅ Acousticness: 0.524 (Moderately acoustic)")
console.log("  ✅ Valence: 0.233 (Low - sad mood)")
console.log("  ✅ Energy: 0.362 (Low - calm/mellow)")
console.log("  ✅ Mode: Minor key (matches sad emotion)")
console.log("  ✅ Year: 2002 (within 2000-2009 range)")
console.log(`\nMatch Reason: ${score2.matchReason}`)

// ============================================
// Example 3: Ranking Multiple Tracks
// ============================================

const exampleTracks: SpotifyTrackWithFeatures[] = [
  exampleTrack1,
  exampleTrack2,
  // More tracks would be added here...
]

const rankedTracks = rankTracksByMatch(
  exampleTracks,
  exampleIntent1,
  examplePrompt1,
  30 // minimum score threshold
)

console.log("\n\nExample 3: Ranked Track List")
console.log("=============================")
rankedTracks.forEach((scored, index) => {
  console.log(`${index + 1}. ${scored.track.name} - Score: ${scored.overallScore}/100`)
  console.log(`   Reason: ${scored.matchReason}`)
})

// ============================================
// Example 4: Understanding Checklist Categories
// ============================================

console.log("\n\nExample 4: Checklist Category Details")
console.log("======================================")
console.log("\n1. TRACK INFO (Weight: 25%)")
console.log("   - Track title mentioned in prompt")
console.log("   - Album name matches")
console.log("   - Artist is confirmed")
console.log("   - Featured artist detected")
console.log("   - Version match (Cover/Remix/Live)")
console.log("   - Explicit/Clean preference")

console.log("\n2. GENRE / STYLE (Weight: 15%)")
console.log("   - Main genre matches")
console.log("   - Sub-genre matches")
console.log("   - Fusion genre detected")
console.log("   - Era-specific genre (90s rock, 2000s emo)")

console.log("\n3. MOOD / EMOTION (Weight: 15%)")
console.log("   - Emotional tone (happy, sad, romantic)")
console.log("   - Energy vibe (calm, hype, dreamy)")
console.log("   - Valence match (positive vs negative)")

console.log("\n4. ACTIVITY / CONTEXT (Weight: 10%)")
console.log("   - Activity (workout, study, driving, party)")
console.log("   - Setting (morning, night, festival)")
console.log("   - Occasion (holiday, birthday, wedding)")

console.log("\n5. AUDIO FEATURES (Weight: 10%)")
console.log("   - Tempo/BPM match")
console.log("   - Energy level (0-1)")
console.log("   - Danceability (0-1)")
console.log("   - Valence (0-1)")
console.log("   - Acousticness")
console.log("   - Instrumentalness")
console.log("   - Speechiness")
console.log("   - Liveness")

console.log("\n6. TIME / ERA (Weight: 10%)")
console.log("   - Release year match")
console.log("   - Decade match")
console.log("   - Era descriptor (classic, modern)")

console.log("\n7. POPULARITY (Weight: 5%)")
console.log("   - Popularity level")
console.log("   - Viral status")
console.log("   - Chart rank")

console.log("\n8. LANGUAGE / REGION (Weight: 5%)")
console.log("   - Language preference")
console.log("   - Regional/nationality match")

console.log("\n9. SOUND / INSTRUMENTATION (Weight: 5%)")
console.log("   - Instrumentation (guitar, piano, electronic)")
console.log("   - Sound descriptor (lo-fi, cinematic, heavy)")
console.log("   - Remix type match")

// ============================================
// Example 5: Debugging a Low Score
// ============================================

console.log("\n\nExample 5: Why Did a Track Score Low?")
console.log("======================================")

const lowScoringTrack: SpotifyTrackWithFeatures = {
  id: "track789",
  name: "Classical Symphony",
  artists: [{ name: "Mozart" }],
  album: {
    name: "Classical Collection",
    images: [{ url: "https://example.com/classical.jpg" }],
  },
  uri: "spotify:track:track789",
  popularity: 45,
  audioFeatures: {
    id: "track789",
    acousticness: 0.990,      // ❌ Too acoustic for "energetic workout"
    danceability: 0.123,      // ❌ Not danceable
    energy: 0.180,            // ❌ Very low energy
    instrumentalness: 0.950,  // ❌ Instrumental (no vocals)
    key: 5,
    liveness: 0.100,
    loudness: -18.234,        // ❌ Very quiet
    mode: 1,
    speechiness: 0.040,
    tempo: 72.500,            // ❌ Very slow tempo
    time_signature: 4,
    valence: 0.456,
  }
}

const lowScore = scoreTrackMatch(lowScoringTrack, exampleIntent1, examplePrompt1)

console.log(`Track: ${lowScore.track.name}`)
console.log(`Prompt: "${examplePrompt1}"`)
console.log(`Overall Score: ${lowScore.overallScore}/100 ❌ TOO LOW`)
console.log("\nWhy it scored low:")
console.log("  ❌ Energy: 0.180 (Need >0.7 for 'high energy')")
console.log("  ❌ Tempo: 72.5 BPM (Too slow for workout)")
console.log("  ❌ Genre: Classical (doesn't match pop/hip-hop/electronic)")
console.log("  ❌ Danceability: 0.123 (Not suitable for movement)")
console.log("  ❌ Instrumentalness: 0.950 (No vocals to sing along to)")
console.log(`\nThis track would be filtered out (score < 30 threshold)`)

export {
  examplePrompt1,
  exampleIntent1,
  exampleTrack1,
  score1,
  examplePrompt2,
  exampleIntent2,
  exampleTrack2,
  score2,
}
