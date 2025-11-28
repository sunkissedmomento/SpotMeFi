# Track Matching Checklist System

## Overview

The track matching checklist system evaluates how well each song fits the user's prompt across **10 comprehensive categories**. Each track receives a score (0-100) based on how many checklist criteria it matches.

## How It Works

### 1. Track Evaluation Process

```
User Prompt → AI Intent Extraction → Track Discovery → Audio Features Enrichment → Checklist Scoring → Ranked Results
```

1. **User submits a prompt** (e.g., "energetic workout songs from 2024")
2. **AI extracts intent** (genres, moods, energy level, year, etc.)
3. **Tracks are discovered** via Spotify search
4. **Audio features are fetched** for each track (tempo, energy, danceability, etc.)
5. **Each track is scored** using the comprehensive checklist
6. **Tracks are ranked** by score and the top matches are selected

### 2. Checklist Categories (10 Total)

Each track is evaluated across these categories:

#### 🎵 1. Track Info (Weight: 25%)
- ✓ Track title mentioned in prompt
- ✓ Album name matches
- ✓ Artist is confirmed/detected
- ✓ Featured artist detected (feat.)
- ✓ Version match (Cover/Remix/Live/Acoustic)
- ✓ Explicit/Clean label preference

#### 🎸 2. Genre / Style (Weight: 15%)
- ✓ Main genre matches
- ✓ Sub-genre matches
- ✓ Fusion genre detected
- ✓ Era-specific genre (90s rock, 2000s emo)

#### 💭 3. Mood / Emotion / Vibe (Weight: 15%)
- ✓ Emotional tone (happy, sad, romantic)
- ✓ Energy vibe (calm, hype, dreamy)
- ✓ Valence match (positive vs negative)

#### 🏃 4. Activity / Theme / Context (Weight: 10%)
- ✓ Activity match (workout, study, driving, party)
- ✓ Setting match (morning, night, festival)
- ✓ Occasion match (holiday, birthday, wedding)

#### 🎛️ 5. Audio Features (Weight: 10%)
Uses **Spotify Audio Features API** for precise matching:
- ✓ Tempo/BPM match
- ✓ Energy level (0-1)
- ✓ Danceability (0-1)
- ✓ Valence (0-1)
- ✓ Acousticness (acoustic vs electronic)
- ✓ Instrumentalness (vocal vs instrumental)
- ✓ Speechiness (rap vs sung)
- ✓ Liveness (live vs studio)

#### 📅 6. Time / Era (Weight: 10%)
- ✓ Release year match
- ✓ Decade match (70s, 80s, 2000s)
- ✓ Era descriptor (classic, modern)

#### 📊 7. Popularity / Charts (Weight: 5%)
- ✓ Popularity level (trending vs underground)
- ✓ Viral status
- ✓ Chart rank

#### 🌍 8. Language / Region (Weight: 5%)
- ✓ Language preference
- ✓ Regional/nationality match

#### 🎹 9. Instrumentation / Sound (Weight: 5%)
- ✓ Instrumentation (guitar, piano, electronic)
- ✓ Sound descriptor (lo-fi, cinematic, heavy)
- ✓ Remix type match

### 3. Scoring System

**Overall Score Formula:**
```
Overall Score =
  (Track Info × 25%) +
  (Genre × 15%) +
  (Mood × 15%) +
  (Context × 10%) +
  (Audio Features × 10%) +
  (Time/Era × 10%) +
  (Popularity × 5%) +
  (Language/Region × 5%) +
  (Sound × 5%)
```

**Category Score Calculation:**
```
Category Score = (Matched Criteria / Total Criteria) × 100
```

**Example:**
- Track Info: 4/6 criteria met = 67 points
- Genre: 3/4 criteria met = 75 points
- Mood: 2/3 criteria met = 67 points
- ... and so on

Final weighted score might be: **72/100**

### 4. Match Reasons

Each scored track includes a human-readable explanation:

Examples:
- "strong track/artist match and genre alignment"
- "mood match, audio features fit, and era match"
- "partial match"

## Example Usage

### Example 1: Specific Artist Request

**Prompt:** "Taylor Swift songs for driving"

**Checklist Highlights:**
- ✅ Track Info: High score (artist match)
- ✅ Context: Activity = driving
- ✅ Audio Features: Medium-high energy
- ✅ Popularity: Trending tracks prioritized

**Result:** Taylor Swift's popular upbeat tracks ranked by driving suitability

---

### Example 2: Mood-Based Request

**Prompt:** "sad acoustic songs from the 2000s"

**Checklist Highlights:**
- ✅ Mood: Sad emotional tone
- ✅ Audio Features:
  - Valence < 0.4 (negative sentiment)
  - Acousticness > 0.5
- ✅ Time/Era: Decade = 2000s
- ✅ Sound: Acoustic instrumentation

**Result:** Melancholic acoustic tracks from 2000-2009, ranked by sadness + acousticness

---

### Example 3: Activity + Energy Request

**Prompt:** "high energy workout playlist 2024"

**Checklist Highlights:**
- ✅ Context: Activity = workout
- ✅ Mood: Energy vibe = hype
- ✅ Audio Features:
  - Energy > 0.7
  - Danceability > 0.6
  - Tempo > 120 BPM
- ✅ Time/Era: Year = 2024

**Result:** Fast, energetic, danceable tracks from 2024

---

### Example 4: Complex Multi-Criteria Request

**Prompt:** "lo-fi instrumental hip-hop for studying at night"

**Checklist Highlights:**
- ✅ Genre: Hip-hop
- ✅ Context:
  - Activity = studying
  - Setting = night
- ✅ Audio Features:
  - Instrumentalness > 0.5
  - Energy < 0.4 (calm)
  - Speechiness < 0.33 (minimal vocals)
- ✅ Sound:
  - Lo-fi descriptor
  - Ambient/chill vibe

**Result:** Calm, instrumental lo-fi hip-hop beats perfect for focus

## Benefits of the Checklist System

### ✅ **Precise Matching**
- Uses actual audio features data (not just metadata)
- Evaluates 40+ individual criteria per track
- Weighted scoring prioritizes important factors

### ✅ **Transparent Decision-Making**
- Each track has a clear checklist breakdown
- Match reasons explain why tracks were chosen
- Easy to debug or adjust scoring logic

### ✅ **Flexible & Extensible**
- Add new criteria easily
- Adjust category weights based on preferences
- Support for complex multi-dimensional queries

### ✅ **Better User Experience**
- More accurate playlist generation
- Higher relevance to user intent
- Consistent quality across diverse prompts

## Technical Implementation

### Key Files

1. **[lib/spotify/track-matcher.ts](lib/spotify/track-matcher.ts)**
   - `TrackMatchChecklist` interface (10 categories)
   - `scoreTrackMatch()` function
   - `rankTracksByMatch()` function

2. **[lib/spotify/types.ts](lib/spotify/types.ts)**
   - `SpotifyAudioFeatures` interface
   - `SpotifyTrackWithFeatures` interface

3. **[lib/spotify/client.ts](lib/spotify/client.ts)**
   - `getAudioFeatures()` method
   - `getMultipleAudioFeatures()` method
   - `enrichTracksWithAudioFeatures()` method

4. **[app/api/generate/route.ts](app/api/generate/route.ts)**
   - Integration of checklist scoring
   - Audio features enrichment
   - Track ranking and selection

### Workflow in Code

```typescript
// 1. Discover tracks
const tracks = await spotifyClient.discoverTracksByIntent(...)

// 2. Enrich with audio features
const enrichedTracks = await spotifyClient.enrichTracksWithAudioFeatures(tracks)

// 3. Score and rank by checklist
const rankedTracks = rankTracksByMatch(enrichedTracks, intent, prompt, minScore=30)

// 4. Select top tracks
const finalTracks = rankedTracks.slice(0, trackLimit)
```

## Audio Features Reference

Spotify provides these audio features for advanced matching:

| Feature | Range | Description |
|---------|-------|-------------|
| **Acousticness** | 0.0 - 1.0 | Acoustic vs electronic |
| **Danceability** | 0.0 - 1.0 | How suitable for dancing |
| **Energy** | 0.0 - 1.0 | Intensity and activity level |
| **Instrumentalness** | 0.0 - 1.0 | Vocal vs instrumental |
| **Liveness** | 0.0 - 1.0 | Live performance vs studio |
| **Loudness** | -60 - 0 dB | Overall loudness |
| **Speechiness** | 0.0 - 1.0 | Spoken word vs music |
| **Tempo** | BPM | Beats per minute |
| **Valence** | 0.0 - 1.0 | Musical positiveness (happy vs sad) |
| **Key** | 0 - 11 | Pitch class notation |
| **Mode** | 0 or 1 | Major (1) or Minor (0) |

## Customization

### Adjusting Category Weights

Edit [lib/spotify/track-matcher.ts](lib/spotify/track-matcher.ts):

```typescript
const weights = {
  trackInfo: 0.25,      // Increase for more artist/track name priority
  genre: 0.15,
  mood: 0.15,
  context: 0.10,
  audioFeatures: 0.10,  // Increase for more audio-based matching
  timeEra: 0.10,
  popularity: 0.05,
  languageRegion: 0.05,
  sound: 0.05,
}
```

### Changing Minimum Score Threshold

In [app/api/generate/route.ts](app/api/generate/route.ts):

```typescript
// Current: minimum score of 30/100
const rankedTracks = rankTracksByMatch(enrichedTracks, intent, prompt, 30)

// Stricter: minimum score of 50/100
const rankedTracks = rankTracksByMatch(enrichedTracks, intent, prompt, 50)
```

### Adding New Criteria

1. Add to `TrackMatchChecklist` interface
2. Implement detection function
3. Add to checklist initialization in `scoreTrackMatch()`
4. Update `generateMatchReason()` if needed

## Performance Considerations

- **Audio features are fetched in batches** (max 100 per request)
- **Minimum score threshold** (default: 30) filters out poor matches early
- **Category weights** allow prioritizing expensive checks
- **Caching** could be added for repeated track evaluations

## Future Enhancements

- [ ] Add user feedback loop (thumbs up/down on track selections)
- [ ] Machine learning to optimize category weights per user
- [ ] A/B testing different scoring formulas
- [ ] Export checklist results to user for transparency
- [ ] Real-time debugging UI showing checklist breakdown
