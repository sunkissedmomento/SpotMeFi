# Track Matching Checklist - Quick Reference

## 📋 The 10-Category Checklist

Every song is evaluated across **10 categories** with **40+ individual checks**:

```
┌─────────────────────────────────────────────────────────────────┐
│                    TRACK MATCHING CHECKLIST                      │
└─────────────────────────────────────────────────────────────────┘

1. 🎵 TRACK INFO (25% weight)
   ├── ☐ Track title mentioned in prompt
   ├── ☐ Album name matches
   ├── ☐ Artist is confirmed/detected
   ├── ☐ Featured artist detected (feat.)
   ├── ☐ Version match (Cover/Remix/Live/Acoustic)
   └── ☐ Explicit/Clean label preference

2. 🎸 GENRE / STYLE (15% weight)
   ├── ☐ Main genre matches
   ├── ☐ Sub-genre matches
   ├── ☐ Fusion genre detected
   └── ☐ Era-specific genre (90s rock, 2000s emo)

3. 💭 MOOD / EMOTION / VIBE (15% weight)
   ├── ☐ Emotional tone (happy, sad, romantic)
   ├── ☐ Energy vibe (calm, hype, dreamy)
   └── ☐ Valence match (positive vs negative)

4. 🏃 ACTIVITY / THEME / CONTEXT (10% weight)
   ├── ☐ Activity match (workout, study, driving, party)
   ├── ☐ Setting match (morning, night, festival, road trip)
   └── ☐ Occasion match (holiday, birthday, wedding)

5. 🎛️ AUDIO FEATURES (10% weight) - Uses Spotify API
   ├── ☐ Tempo/BPM match
   ├── ☐ Energy level (0-1)
   ├── ☐ Danceability (0-1)
   ├── ☐ Valence (0-1)
   ├── ☐ Acousticness (acoustic vs electronic)
   ├── ☐ Instrumentalness (vocal vs instrumental)
   ├── ☐ Speechiness (rap vs sung)
   └── ☐ Liveness (live vs studio)

6. 📅 TIME / ERA (10% weight)
   ├── ☐ Release year match
   ├── ☐ Decade match (70s, 80s, 2000s)
   └── ☐ Era descriptor (classic, modern)

7. 📊 POPULARITY / CHARTS (5% weight)
   ├── ☐ Popularity level (trending vs underground)
   ├── ☐ Viral status
   └── ☐ Chart rank

8. 🌍 LANGUAGE / REGION (5% weight)
   ├── ☐ Language preference
   └── ☐ Regional/nationality match

9. 🎹 SOUND / INSTRUMENTATION (5% weight)
   ├── ☐ Instrumentation (guitar, piano, electronic, synth)
   ├── ☐ Sound descriptor (lo-fi, cinematic, ambient, heavy)
   └── ☐ Remix type match
```

---

## 🎯 How Scores Are Calculated

### Category Score
```
Category Score = (✓ Checked Items / Total Items) × 100
```

**Example:**
- Track Info: 4/6 criteria met → **67 points**
- Genre: 3/4 criteria met → **75 points**
- Mood: 2/3 criteria met → **67 points**

### Overall Score
```
Overall Score = Σ(Category Score × Category Weight)
```

**Weights:**
- Track Info: **25%** (highest priority)
- Genre: **15%**
- Mood: **15%**
- Context: **10%**
- Audio Features: **10%**
- Time/Era: **10%**
- Popularity: **5%**
- Language/Region: **5%**
- Sound: **5%**

---

## 📊 Spotify Audio Features Explained

| Feature | Range | What It Means | Examples |
|---------|-------|---------------|----------|
| **Acousticness** | 0.0 - 1.0 | How acoustic vs electronic | 0.9 = folk guitar, 0.1 = EDM |
| **Danceability** | 0.0 - 1.0 | Suitability for dancing | 0.9 = club hit, 0.2 = slow ballad |
| **Energy** | 0.0 - 1.0 | Intensity and activity | 0.9 = metal, 0.2 = ambient |
| **Instrumentalness** | 0.0 - 1.0 | Vocal vs instrumental | 0.9 = classical, 0.0 = pop vocal |
| **Liveness** | 0.0 - 1.0 | Live performance presence | 0.9 = concert, 0.1 = studio |
| **Speechiness** | 0.0 - 1.0 | Spoken words vs singing | 0.9 = podcast, 0.6 = rap, 0.1 = instrumental |
| **Tempo** | BPM | Beats per minute | 180 = fast dance, 60 = slow ballad |
| **Valence** | 0.0 - 1.0 | Musical positiveness | 0.9 = happy/upbeat, 0.1 = sad/dark |

---

## 🔍 Real-World Examples

### Example 1: "Energetic workout songs from 2024"

**Top Scoring Track:**
```
Track: "Upbeat Dance Hit 2024"
Overall Score: 87/100

✅ High Scores:
  • Track Info: 50/100 (no specific artist mentioned)
  • Genre: 100/100 (pop/electronic match)
  • Mood: 100/100 (energetic mood detected)
  • Context: 100/100 (workout activity detected)
  • Audio Features: 100/100
    - Energy: 0.85 ✓ (>0.7 for "high")
    - Tempo: 145 BPM ✓ (fast)
    - Danceability: 0.78 ✓
  • Time/Era: 100/100 (2024 release)

Match Reason: "genre alignment, mood match, audio features fit, and era match"
```

**Low Scoring Track:**
```
Track: "Classical Symphony from 1800s"
Overall Score: 12/100

❌ Low Scores:
  • Track Info: 0/100
  • Genre: 0/100 (classical ≠ pop/electronic)
  • Mood: 0/100 (calm ≠ energetic)
  • Context: 0/100 (concert hall ≠ workout)
  • Audio Features: 0/100
    - Energy: 0.18 ✗ (need >0.7)
    - Tempo: 72 BPM ✗ (too slow)
    - Danceability: 0.12 ✗
  • Time/Era: 0/100 (1800s ≠ 2024)

Result: FILTERED OUT (below 30 minimum threshold)
```

---

### Example 2: "Sad acoustic songs from the 2000s"

**Top Scoring Track:**
```
Track: "The Scientist - Coldplay (2002)"
Overall Score: 78/100

✅ High Scores:
  • Genre: 75/100 (indie/rock match)
  • Mood: 100/100 (sad mood perfect match)
  • Audio Features: 88/100
    - Acousticness: 0.52 ✓ (moderately acoustic)
    - Valence: 0.23 ✓ (<0.4 for "sad")
    - Energy: 0.36 ✓ (<0.4 for "low")
    - Mode: Minor key ✓ (sad emotion)
  • Time/Era: 100/100 (2002 within 2000-2009)

Match Reason: "mood match, audio features fit, and era match"
```

---

### Example 3: "Taylor Swift songs for driving"

**Checklist Processing:**
```
Step 1: Intent Extraction
  ✓ Confirmed Artist: "Taylor Swift"
  ✓ Activity: "driving"
  ✓ Track Limit: 30

Step 2: Track Discovery
  ✓ Fetch Taylor Swift top tracks
  ✓ Fetch "feat Taylor Swift" tracks

Step 3: Audio Features Enrichment
  ✓ Fetched audio features for all tracks

Step 4: Checklist Scoring
  Track: "Shake It Off"
    Track Info: 83/100 (artist match ✓)
    Context: 67/100 (driving context detected)
    Audio Features: 75/100 (upbeat, medium-high energy)
    → Overall: 76/100

  Track: "All Too Well (10 Minute Version)"
    Track Info: 83/100 (artist match ✓)
    Context: 33/100 (too long/slow for driving)
    Audio Features: 45/100 (low energy, slow tempo)
    → Overall: 62/100

Step 5: Ranking
  1. "Shake It Off" - 76/100
  2. "Style" - 74/100
  3. "Blank Space" - 72/100
  ...
  15. "All Too Well (10 Min)" - 62/100
```

---

## 🎨 Visual Scoring Example

```
Prompt: "lo-fi instrumental hip-hop for studying at night"

Track: "Midnight Study Beats"
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Category Scores:
  Track Info      [████████░░] 80/100  (genre keywords match)
  Genre           [██████████] 100/100 (hip-hop detected)
  Mood            [███████░░░] 70/100  (chill vibe)
  Context         [██████████] 100/100 (study + night detected)
  Audio Features  [█████████░] 90/100  (perfect instrumental/energy)
  Time/Era        [█████░░░░░] 50/100  (no year specified)
  Popularity      [█████░░░░░] 50/100  (moderate popularity)
  Language/Region [█████░░░░░] 50/100  (no preference)
  Sound           [██████████] 100/100 (lo-fi descriptor match)

Overall Score: 82/100 ⭐⭐⭐⭐

Match Reason: "genre alignment, mood match, and audio features fit"

Audio Features Detail:
  ✓ Instrumentalness: 0.92 (almost fully instrumental)
  ✓ Energy: 0.28 (low/calm - perfect for studying)
  ✓ Speechiness: 0.05 (no distracting vocals)
  ✓ Tempo: 85 BPM (relaxed pace)
  ✓ Acousticness: 0.15 (electronic production)
```

---

## 💡 Tips for Better Matches

### Be Specific
❌ "Good songs" → vague, hard to match
✅ "Upbeat pop songs for morning workout" → specific, easy to match

### Include Context
❌ "Rock music"
✅ "Classic rock for road trip"

### Mention Audio Qualities
❌ "Relaxing songs"
✅ "Slow acoustic instrumental songs for sleep"

### Specify Time Period
❌ "Indie music"
✅ "Modern indie from 2020-2024"

### Combine Multiple Criteria
✅ "Fast-tempo electronic dance music with high energy and no vocals for running"
  → Triggers multiple checklist categories:
     - Context: running
     - Audio: tempo (fast), energy (high), instrumentalness
     - Genre: electronic, dance

---

## 🔧 Technical Implementation

### Files to Explore

1. **Checklist Logic:** [lib/spotify/track-matcher.ts](lib/spotify/track-matcher.ts)
2. **Type Definitions:** [lib/spotify/types.ts](lib/spotify/types.ts)
3. **Spotify Client:** [lib/spotify/client.ts](lib/spotify/client.ts)
4. **Integration:** [app/api/generate/route.ts](app/api/generate/route.ts)
5. **Examples:** [lib/spotify/track-matcher.example.ts](lib/spotify/track-matcher.example.ts)
6. **Full Guide:** [TRACK_MATCHING_GUIDE.md](TRACK_MATCHING_GUIDE.md)

### Key Functions

```typescript
// Score a single track
scoreTrackMatch(track, intent, prompt): TrackMatchScore

// Rank multiple tracks
rankTracksByMatch(tracks, intent, prompt, minScore): TrackMatchScore[]

// Enrich tracks with audio features
enrichTracksWithAudioFeatures(tracks): SpotifyTrackWithFeatures[]
```

---

## 📈 Performance Metrics

- **Tracks evaluated:** 50-200 per request
- **Audio features fetched:** Batched (100 per API call)
- **Scoring time:** ~5ms per track
- **Minimum score threshold:** 30/100 (configurable)
- **Average top track score:** 65-85/100

---

## 🎯 Success Indicators

**High-Quality Match (70-100 score):**
- Multiple categories scoring >70%
- Strong audio features alignment
- Clear match reason

**Medium-Quality Match (40-69 score):**
- Some categories match well
- Partial audio features fit
- Acceptable for diverse playlists

**Low-Quality Match (<40 score):**
- Few or no category matches
- Poor audio features alignment
- Should be filtered out

---

## 📚 Further Reading

For comprehensive documentation, see [TRACK_MATCHING_GUIDE.md](TRACK_MATCHING_GUIDE.md)
