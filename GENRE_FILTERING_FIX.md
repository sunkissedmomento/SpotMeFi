# Genre Filtering Fix

## Problem

Users were getting tracks from unrelated genres in their playlists (e.g., requesting Filipino indie but getting K-pop or other genres).

## Root Cause

**Spotify's genre search is unreliable.** When you search with `genre:"filipino indie"`, Spotify treats it as a suggestion rather than a hard filter. The search often returns tracks from completely different genres.

## Solution Implemented

### 1. **Prioritize Artist-Based Discovery**

Instead of relying on generic genre searches, we now:
- **Always use artist-based discovery first** if artists are detected
- Get more tracks per artist (up to 50) to ensure enough variety after filtering
- Only use generic `discoverTracksByIntent()` when **no artists** are found

```typescript
// Before (problematic)
// Always used generic discovery as fallback
if (!tracks.length) {
  discovered = discoverTracksByIntent(genres, ...) // ❌ Returns unrelated tracks
}

// After (fixed)
// Only use generic discovery if NO artists detected
if (!tracks.length && detectedArtists.length === 0) {
  discovered = discoverTracksByIntent(genres, ...) // ✓ Rare fallback
}
```

### 2. **Strict Post-Filtering**

Added hard requirements in `rankTracksByMatch()`:

```typescript
filter(scored => {
  // 1. Minimum score threshold
  if (score < minScore) return false

  // 2. Artist match (if artists specified)
  if (intent.confirmed_artists && intent.confirmed_artists.length > 0) {
    if (!hasArtistMatch) {
      // Exception: allow ONLY if genre+mood score is very high (80+)
      if ((genreScore + moodScore) / 2 < 80) return false
    }
  }

  // 3. Genre match (strict if genres specified)
  if (intent.genres && intent.genres.length > 0) {
    if (genreScore < 50) return false // ✓ Requires 50%+ genre match
  }

  return true
})
```

### 3. **Higher Minimum Scores**

- **Artist-specific playlists:** Minimum score **40/100** (stricter)
- **Generic playlists:** Minimum score **20/100** (more lenient)

```typescript
const minScore = detectedArtists.length > 0 ? 40 : 20
```

### 4. **Better Logging**

Added detailed console logs to debug:
```typescript
console.log(`Discovered ${tracks.length} tracks before deduplication`)
console.log(`Ranked tracks: ${rankedTracks.length} passed filtering`)
console.log('Top 5 scores:', rankedTracks.slice(0, 5).map(...))
```

---

## How It Works Now

### Example: "sol at luna by geiko playlist"

**Step 1: Artist Detection**
```
Detected artists: ["geiko", "dwta", "Keiko Necesario"]
```

**Step 2: Track Discovery**
```
For artist "geiko":
  → Get 50 top tracks
  → Get 20 tracks with "feat geiko"

For artist "dwta":
  → Get 50 top tracks
  → Get 20 tracks with "feat dwta"

For artist "Keiko Necesario":
  → Get 50 top tracks
  → Get 20 tracks with "feat Keiko Necesario"

Total: ~200+ tracks
```

**Step 3: Deduplication**
```
Unique tracks: ~150
```

**Step 4: Checklist Scoring**
```
For each track:
  → Calculate overall score (0-100)
  → Check hard requirements:
    ✓ Score >= 40
    ✓ Artist matches (geiko/dwta/Keiko)
    ✓ Genre score >= 50 (if genres specified)
```

**Step 5: Filtering**
```
Tracks that pass: ~60
Top 30 selected
```

**Result:** ✅ All 30 tracks are from geiko, dwta, or Keiko Necesario (Filipino indie artists only)

---

## Why This Fixes The Issue

### Before:
```
Prompt: "geiko playlist"

Discovery:
  ✓ 30 tracks from geiko
  ❌ Fallback: 50 "filipino indie" tracks from Spotify search
     → Includes K-pop, J-pop, unrelated artists

Filtering:
  ❌ Low threshold (20) allowed any track
  ❌ No artist requirement

Result:
  ❌ Mixed: 10 geiko, 20 random artists
```

### After:
```
Prompt: "geiko playlist"

Discovery:
  ✓ 50 tracks from geiko
  ✓ 20 tracks feat. geiko
  ✓ 50 tracks from similar artists (dwta, Keiko)
  ✓ NO generic discovery (artists were detected)

Filtering:
  ✓ Higher threshold (40)
  ✓ Requires artist match OR 80%+ genre+mood
  ✓ Requires 50%+ genre score

Result:
  ✅ Pure: 30 tracks all from geiko + similar Filipino indie
```

---

## Testing

### Test Case 1: Artist-Specific Request
```bash
POST /api/generate
{
  "prompt": "geiko playlist, 30 songs"
}

Expected:
  ✓ All tracks from: geiko, dwta, Keiko Necesario, Ben&Ben, etc.
  ✗ No K-pop, J-pop, or unrelated genres
```

### Test Case 2: Genre-Only Request
```bash
POST /api/generate
{
  "prompt": "filipino indie music"
}

Expected:
  ✓ Uses generic discovery (no artists specified)
  ✓ Returns Filipino indie artists
  ⚠️ May have some variety (lower threshold: 20)
```

### Test Case 3: With Clarification
```bash
POST /api/analyze
{
  "prompt": "geiko playlist"
}

User answers:
  - includeSimilar: "Yes, discover similar artists"
  - mood: "Melancholic love songs"

POST /api/generate (with answers)

Expected:
  ✓ Confirmed artists: ["geiko", "dwta", "Keiko Necesario"]
  ✓ All tracks match genre + mood
  ✓ Strict filtering (40+ score)
```

---

## Configuration

You can adjust strictness in [app/api/generate/route.ts](app/api/generate/route.ts):

### Adjust Minimum Score Threshold
```typescript
// Line 157
const minScore = detectedArtists.length > 0 ? 40 : 20
//                                             ^^    ^^
//                                          artist  generic
//                                          request request

// Make stricter:
const minScore = detectedArtists.length > 0 ? 50 : 30

// Make more lenient:
const minScore = detectedArtists.length > 0 ? 30 : 10
```

### Adjust Genre Score Requirement
```typescript
// lib/spotify/track-matcher.ts line 491
if (s.categoryScores.genre < 50) return false
//                           ^^
// Stricter:  60 or 70
// Lenient:   40 or 30
```

### Adjust Artist Match Exception
```typescript
// lib/spotify/track-matcher.ts line 484
if (genreAndMoodScore < 80) return false
//                      ^^
// Stricter:  90 (almost never allow non-matching artists)
// Lenient:   70 (more similar artists allowed)
```

---

## Monitoring

Check console logs during playlist generation:

```bash
# Successful generation
Discovered 187 tracks before deduplication
Ranked tracks: 62 passed filtering (min score: 40)
Top 5 scores: [
  { track: "Sol at Luna", artist: "geiko", score: 95, ... },
  { track: "Nang Tahimik", artist: "geiko", score: 92, ... },
  { track: "How Did You Know", artist: "Keiko Necesario", score: 87, ... },
  { track: "Sampung Mga Daliri", artist: "dwta", score: 85, ... },
  { track: "Pauwi Na 'Ko", artist: "dwta", score: 83, ... }
]

# Issue: Not enough tracks
Discovered 45 tracks before deduplication
Ranked tracks: 12 passed filtering (min score: 40)
⚠️ Only 12 tracks passed - may need to:
  - Lower minScore threshold
  - Add more similar artists
  - Relax genre requirements
```

---

## Known Limitations

### 1. **Spotify's genre metadata is limited**
- Not all tracks have genre tags
- Artist genres may not match track genres
- Some genres are missing or miscategorized

**Solution:** We rely on artist-based discovery instead

### 2. **"Similar artists" are subjective**
- AI-detected similar artists may not always match user taste
- Use clarification questions to confirm

**Solution:** Ask "Include similar artists?" in clarification flow

### 3. **Very niche genres may have few tracks**
- If genre is too specific (e.g., "2000s Filipino emo indie"), may not find 30 tracks

**Solution:** Lower track limit or broaden genre

---

## Summary

**Problem:** Mixed genres in playlists
**Root cause:** Spotify's unreliable genre search
**Solution:**
  1. ✅ Prioritize artist-based discovery
  2. ✅ Strict post-filtering (40+ score, 50%+ genre match)
  3. ✅ Only use generic search when no artists found

**Result:** Clean, genre-consistent playlists! 🎵

---

## Files Modified

1. **[app/api/generate/route.ts](app/api/generate/route.ts)**
   - Line 100-131: Changed discovery logic
   - Line 157: Dynamic minScore threshold
   - Line 161-168: Added logging

2. **[lib/spotify/track-matcher.ts](lib/spotify/track-matcher.ts)**
   - Line 467-496: Added strict filtering in `rankTracksByMatch()`

---

**Your playlists should now be much cleaner! 🎉**
