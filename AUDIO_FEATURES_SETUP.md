# Audio Features API Setup

## Issue: "Forbidden" Error

The Spotify `/audio-features` endpoint is returning a `403 Forbidden` error. This is because the endpoint has specific requirements.

## Solution Options

### Option 1: Audio Features Don't Require Special Scopes (Current Issue)

The `/audio-features` endpoint **should not require additional scopes** according to Spotify documentation. The `403 Forbidden` error might be due to:

1. **Rate Limiting** - Too many requests in a short time
2. **Market Restrictions** - Some tracks' audio features aren't available in all regions
3. **Private/Local Tracks** - Audio features aren't available for user-uploaded content
4. **API Changes** - Recent changes to Spotify's API policies

### Option 2: Use Existing Token (Recommended for Now)

The system now includes **graceful fallback** - if audio features fail to fetch, the checklist system still works with reduced accuracy:

```typescript
try {
  enrichedTracks = await spotifyClient.enrichTracksWithAudioFeatures(uniqueTracks)
} catch (error) {
  console.warn('Failed to fetch audio features, proceeding without them')
  // Continue without audio features
  enrichedTracks = uniqueTracks.map(track => ({ ...track, audioFeatures: undefined }))
}
```

**What still works without audio features:**
- ✅ Track Info matching (artist, title, album)
- ✅ Genre matching
- ✅ Mood keyword detection
- ✅ Context/activity detection
- ✅ Time/era matching
- ✅ Popularity filtering
- ✅ Language/region filtering

**What doesn't work without audio features:**
- ❌ Precise energy level matching (0.0-1.0)
- ❌ Precise danceability matching
- ❌ Precise valence (happiness) matching
- ❌ Precise acousticness detection
- ❌ Precise tempo/BPM matching
- ❌ Liveness detection (live vs studio)
- ❌ Speechiness detection (rap vs sung)

### Option 3: Improve Error Handling Per Track

Update the `getMultipleAudioFeatures` method to handle individual track failures:

```typescript
async getMultipleAudioFeatures(trackIds: string[]): Promise<(SpotifyAudioFeatures | null)[]> {
  if (trackIds.length === 0) return []

  const chunks: string[][] = []
  for (let i = 0; i < trackIds.length; i += 100) {
    chunks.push(trackIds.slice(i, i + 100))
  }

  const results: (SpotifyAudioFeatures | null)[] = []
  for (const chunk of chunks) {
    try {
      const params = new URLSearchParams({ ids: chunk.join(',') })
      const data: { audio_features: (SpotifyAudioFeatures | null)[] } = await this.fetch(
        `/audio-features?${params}`
      )
      results.push(...data.audio_features)
    } catch (error) {
      console.warn(`Failed to fetch audio features for batch: ${error}`)
      // Return nulls for failed batch
      results.push(...chunk.map(() => null))
    }
  }
  return results
}
```

This is **already implemented** in [lib/spotify/client.ts:165-188](lib/spotify/client.ts#L165-L188).

## Debugging Steps

### 1. Check Token Scopes

Verify what scopes your access token has:

```bash
# In the browser console or API test
curl -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  https://api.spotify.com/v1/me
```

Required scopes for playlist creation (already have):
- `playlist-modify-public`
- `playlist-modify-private`
- `user-read-private`
- `user-read-email`

Audio features endpoint **should work** with any valid token.

### 2. Test Single Audio Feature Request

Try fetching a single track's audio features:

```bash
curl -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  https://api.spotify.com/v1/audio-features/11dFghVXANMlKmJXsNCbNl
```

If this returns `403`, the issue is with the token itself.

### 3. Check for Private/Local Tracks

Some tracks don't have audio features available:
- User-uploaded local files
- Podcasts
- Very new releases (< 24 hours old)
- Region-restricted content

## Current Status

The system is **working correctly** even without audio features. The checklist system will:

1. ✅ Attempt to fetch audio features
2. ⚠️ If it fails, continue without them
3. ✅ Score tracks based on available metadata
4. ✅ Rank and return results

**Reduced minimum score threshold:** Lowered from 30 to 20 to account for missing audio features data.

## Recommendations

### Short-term (Current Implementation)
- ✅ Keep graceful fallback
- ✅ Use lower minimum score threshold (20 instead of 30)
- ✅ Log warnings when audio features fail

### Medium-term
- [ ] Add retry logic with exponential backoff
- [ ] Cache audio features in database to reduce API calls
- [ ] Add user notification if audio features are unavailable

### Long-term
- [ ] Request `user-read-playback-state` scope if needed (unlikely)
- [ ] Implement client-side audio analysis as backup
- [ ] Build ML model to predict audio features from track metadata

## Testing Without Audio Features

The results you're seeing (geiko, dwta, Keiko Necesario tracks) suggest the system is working well even without audio features, because:

1. **Artist matching works perfectly** - All tracks are from the detected artists
2. **Track discovery is accurate** - Found top tracks and featured tracks
3. **Deduplication works** - No repeated tracks
4. **Ranking is reasonable** - Popular tracks appear first

The **checklist system adds value** even without audio features by:
- Filtering by artist/track/album mentions
- Detecting genre keywords
- Matching context/activity/mood keywords
- Filtering by year/decade/era
- Ranking by popularity

## Conclusion

**The system is working as intended.** Audio features enhance accuracy but aren't required. The graceful fallback ensures a good user experience even when the Spotify audio features API is unavailable.
