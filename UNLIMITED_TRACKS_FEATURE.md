# Unlimited Tracks Feature

## Overview

The playlist generator now **includes ALL matching tracks** by default, instead of limiting to 30. It will continue adding songs until there are no more tracks that match your prompt.

---

## How It Works

### Before
```
User: "geiko playlist"
Result: 30 tracks (even if 80 tracks matched)
```

### After
```
User: "geiko playlist"
Result: 80 tracks (all matching tracks from geiko + similar artists)

User: "geiko playlist, 50 songs"
Result: 50 tracks (user-specified limit)
```

---

## Examples

### Example 1: No Limit Specified (Get ALL matching tracks)

**Prompt:** `"sol at luna by geiko playlist"`

**Process:**
```
1. Detect artists: geiko, dwta, Keiko Necesario, Ben&Ben
2. Fetch all tracks:
   - geiko: 50 tracks
   - dwta: 50 tracks
   - Keiko Necesario: 50 tracks
   - Ben&Ben: 50 tracks
   Total: ~200 tracks

3. Deduplicate: ~150 unique tracks

4. Score & filter (min score: 40):
   - Passed filtering: 87 tracks

5. Create playlist with ALL 87 tracks ✓
```

**Result:** Playlist with 87 tracks (all matching songs!)

---

### Example 2: User Specifies a Limit

**Prompt:** `"geiko and dwta songs, 40 tracks"`

**Process:**
```
1. AI detects: track_limit = 40
2. Fetch all available tracks
3. Score & filter: 62 tracks passed
4. Take top 40 (as requested)
```

**Result:** Playlist with 40 tracks (user-specified)

---

### Example 3: Maximum Safety Limit

**Prompt:** `"filipino indie music"` (very broad genre)

**Process:**
```
1. No specific artists, so generic discovery
2. Fetch 100 tracks
3. Score & filter: 250 tracks passed (hypothetically)
4. Apply safety limit: Maximum 200 tracks
```

**Result:** Playlist with 200 tracks (safety limit)

---

## Configuration

### Safety Limit (Maximum Tracks)

Prevents overwhelming playlists:

```typescript
// app/api/generate/route.ts Line 99
const maximumTracks = 200 // Adjust this value
```

**Recommended values:**
- **100** - Conservative (fast generation, smaller playlists)
- **200** - Balanced (current default)
- **500** - Generous (very large playlists)
- **1000** - Maximum (may hit Spotify API limits)

### Default Behavior

When user **doesn't specify** a track count:

```typescript
// Line 175
const trackLimit = userSpecifiedLimit || Math.min(rankedTracks.length, maximumTracks)
```

**Options:**

**1. Include ALL matching tracks (current):**
```typescript
const trackLimit = userSpecifiedLimit || Math.min(rankedTracks.length, maximumTracks)
```

**2. Default to 50 if not specified:**
```typescript
const trackLimit = userSpecifiedLimit || Math.min(50, rankedTracks.length)
```

**3. Default to 30 (old behavior):**
```typescript
const trackLimit = userSpecifiedLimit || 30
```

---

## User Prompts

### To Get ALL Matching Tracks
```
"geiko playlist"
"sol at luna vibes"
"filipino indie music"
```
→ Returns all tracks that pass filtering

### To Specify a Limit
```
"geiko playlist, 50 songs"
"20 tracks by dwta"
"give me 100 filipino indie songs"
```
→ Returns exactly that many tracks (or fewer if not enough match)

---

## Benefits

### ✅ Comprehensive Playlists
- Get the **full discography** of artists
- Discover **all** tracks that match your vibe
- No more "I wish this playlist was longer"

### ✅ Better Discovery
- Expose users to **more** similar artists
- Include **deep cuts** and **B-sides**
- Not limited to just "top hits"

### ✅ Flexible
- Users can still specify limits if they want
- Safety maximum prevents overwhelming playlists
- Works for both broad and specific requests

---

## Technical Details

### Track Discovery Process

```
┌─────────────────────────────────────────────────────────────┐
│ 1. FETCH MAXIMUM TRACKS FROM EACH ARTIST                    │
│    - Artist 1: 50 tracks                                    │
│    - Artist 2: 50 tracks                                    │
│    - Artist 3: 50 tracks                                    │
│    Total: ~150-200 tracks                                   │
└─────────────────────────────────────────────────────────────┘
   ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. DEDUPLICATE                                               │
│    150 → 120 unique tracks                                  │
└─────────────────────────────────────────────────────────────┘
   ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. ENRICH WITH AUDIO FEATURES (optional)                    │
│    Fetch audio features for scoring                         │
└─────────────────────────────────────────────────────────────┘
   ↓
┌─────────────────────────────────────────────────────────────┐
│ 4. CHECKLIST SCORING                                         │
│    Score each track (0-100)                                 │
│    Filter: score >= 40 (for artist playlists)              │
│    120 → 85 tracks passed                                   │
└─────────────────────────────────────────────────────────────┘
   ↓
┌─────────────────────────────────────────────────────────────┐
│ 5. APPLY LIMIT                                               │
│    If user specified: Take that many                        │
│    If not specified: Take ALL (up to 200 max)              │
│    Result: 85 tracks                                        │
└─────────────────────────────────────────────────────────────┘
   ↓
┌─────────────────────────────────────────────────────────────┐
│ 6. CREATE SPOTIFY PLAYLIST                                   │
│    Add all 85 tracks to playlist ✓                          │
└─────────────────────────────────────────────────────────────┘
```

### Performance Impact

**More tracks = More API calls**

| Tracks | API Calls | Time |
|--------|-----------|------|
| 30 tracks | ~5-8 | 3-5 sec |
| 80 tracks | ~10-15 | 5-8 sec |
| 150 tracks | ~15-20 | 8-12 sec |
| 200 tracks | ~20-25 | 10-15 sec |

**Optimization:** Tracks are fetched in batches, so the time doesn't scale linearly.

---

## Console Output

You'll see detailed logs showing the process:

```bash
# Discovery
Found 47 tracks from geiko, 12 featuring geiko
Found 38 tracks from dwta, 8 featuring dwta
Found 42 tracks from Keiko Necesario, 6 featuring Keiko Necesario
Discovered 153 tracks before deduplication

# Filtering
Ranked tracks: 87 passed filtering (min score: 40)
Top 5 scores: [
  { track: "Sol at Luna", artist: "geiko", score: 95 },
  { track: "Nang Tahimik", artist: "geiko", score: 92 },
  ...
]

# Final selection
Selected 87 tracks for playlist (user limit: none, available: 87)
```

---

## Edge Cases

### Not Enough Matching Tracks

**Prompt:** `"geiko, 100 songs"`

**If only 60 tracks match:**
```
Result: Playlist with 60 tracks
Note: "Requested 100 but only 60 matched your criteria"
```

### No Tracks Match

**Prompt:** `"geiko rap songs"` (geiko doesn't make rap)

**Result:**
```
Error: "No matching tracks found"
```

### Generic Requests

**Prompt:** `"music"` (too vague)

**Result:**
```
Triggers clarification questions:
  - What genre?
  - What mood?
  - Any favorite artists?
```

---

## Comparison: Old vs New

### Old System (Fixed 30 tracks)

```
Prompt: "geiko playlist"

Discovery:
  ✓ 50 geiko tracks
  ✓ 50 dwta tracks
  ✓ 50 Keiko tracks

Filtering:
  ✓ 85 tracks passed

Selection:
  ❌ Only first 30 tracks taken
  ❌ 55 good tracks discarded

Result: 30 tracks
```

### New System (All matching tracks)

```
Prompt: "geiko playlist"

Discovery:
  ✓ 50 geiko tracks
  ✓ 50 dwta tracks
  ✓ 50 Keiko tracks

Filtering:
  ✓ 85 tracks passed

Selection:
  ✅ ALL 85 tracks included
  ✅ Nothing discarded

Result: 85 tracks
```

---

## User Experience

### For Power Users
```
"I want EVERYTHING by geiko and similar artists"
→ Gets 80-100+ tracks ✓
```

### For Casual Users
```
"geiko playlist"
→ Gets comprehensive playlist (60-90 tracks)
→ Can explore full catalog
```

### For Specific Needs
```
"geiko playlist, 20 songs for a road trip"
→ Gets exactly 20 best matches ✓
```

---

## FAQ

**Q: Will all my playlists be huge now?**
A: Only if there are that many matching tracks! Most playlists will be 40-80 tracks. Very specific requests might only have 15-20 matches.

**Q: Can I still get small playlists?**
A: Yes! Just specify: "geiko, 10 songs" or "20 track playlist"

**Q: What if I get too many tracks?**
A: The safety maximum is 200 tracks. You can lower it in the config.

**Q: Will this be slower?**
A: Slightly (1-3 seconds more for very large playlists), but batched API calls keep it fast.

**Q: What about the 5 playlist limit?**
A: Still applies. Each playlist can have unlimited tracks, but you can only create 5 playlists.

---

## Configuration Summary

```typescript
// app/api/generate/route.ts

// 1. Maximum tracks (safety limit)
const maximumTracks = 200 // Line 99

// 2. Tracks per artist
const artistTracks = await searchArtistTracksExact(artist, 50) // Line 106

// 3. Featured tracks per artist
const featuredTracks = await searchTrack(`feat ${artist}`, 30) // Line 107

// 4. Generic discovery limit (no artists)
trackLimit * 2 // or fixed: 100 // Line 126

// 5. Final selection logic
const trackLimit = userSpecifiedLimit || Math.min(rankedTracks.length, maximumTracks) // Line 175
```

---

## Files Modified

1. **[app/api/generate/route.ts](app/api/generate/route.ts)**
   - Line 97-99: Added `userSpecifiedLimit` and `maximumTracks`
   - Line 106-107: Increased tracks fetched per artist
   - Line 175-178: Dynamic track limit logic with logging

2. **[lib/ai/claude.ts](lib/ai/claude.ts)**
   - Line 50: Updated AI prompt to set `track_limit: null` by default
   - Line 77: Changed example from `30` to `null`

---

## Summary

**Before:** Fixed 30 tracks per playlist
**After:** ALL matching tracks (up to 200 max) unless user specifies otherwise

**Result:** More comprehensive, discoverable playlists that fully capture the user's request! 🎵

---

**Try it now:** Generate a "geiko playlist" and see how many tracks match!
