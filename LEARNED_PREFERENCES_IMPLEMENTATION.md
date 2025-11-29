# Learned Preferences Implementation

## Overview
SpotMefi now learns from your playlist generation patterns to make better recommendations over time. The system tracks your most requested genres, moods, and artists from your SpotMefi usage (not your raw Spotify data).

## Key Features

### 1. **Privacy-First Design**
- ✅ Only learns from SpotMefi playlist requests (intentional choices)
- ✅ Does NOT store raw Spotify listening history
- ✅ Users can view and reset their learned preferences anytime

### 2. **What Gets Learned**
- **Favorite Genres**: Tracks which genres you request most often (e.g., {"indie": 5, "hip-hop": 3})
- **Preferred Moods**: Tracks which moods you prefer (e.g., {"chill": 4, "energetic": 2})
- **Favorite Artists**: List of artists you frequently request (limit: 20)
- **Average Playlist Length**: Your typical track count preference

### 3. **How It Works**
1. User creates a playlist with prompt "chill indie music"
2. AI extracts genres: ["indie"], moods: ["chill"]
3. System increments "indie" count by 1, "chill" count by 1
4. Next time user says "something chill", AI knows to prioritize indie genre

### 4. **Dual Preference System**
SpotMefi now uses TWO types of preferences:
- **Spotify Preferences** (fetched temporarily): Top artists/tracks from Spotify listening history
- **Learned Preferences** (stored): Patterns from SpotMefi playlist requests

The AI uses BOTH to make better recommendations!

## Files Created/Modified

### New Files
1. **`/lib/preferences/learner.ts`** - Core learning logic
   - `learnFromPlaylist()` - Updates preferences after each playlist
   - `getUserLearnedPreferences()` - Retrieves stored preferences
   - `getTopGenres()` / `getTopMoods()` - Extracts top preferences
   - `resetUserPreferences()` - Clears all learned data

2. **`/app/preferences/page.tsx`** - User preferences dashboard
   - View favorite genres with frequency bars
   - View preferred moods with visual indicators
   - View frequently requested artists
   - Reset preferences button

3. **`/app/api/preferences/route.ts`** - Preferences API
   - GET endpoint to fetch user preferences
   - DELETE endpoint to reset preferences

4. **`/tmp/user_preferences_migration.sql`** - Database schema
   - `user_learned_preferences` table
   - PostgreSQL functions for incrementing preferences

### Modified Files
1. **`/lib/ai/claude.ts`**
   - Added `learnedPreferences` parameter to `generatePlaylistIntent()`
   - AI now considers both Spotify and learned preferences

2. **`/app/api/generate/route.ts`**
   - Fetches learned preferences before generation
   - Passes learned preferences to AI
   - Learns from playlist after creation

3. **`/app/dashboard/page.tsx`**
   - Added "Preferences" link to navigation

## Database Setup

### Step 1: Apply SQL Migration

You need to apply the SQL migration to your Supabase database. You have two options:

#### Option A: Using Supabase Dashboard (Recommended)
1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Open the file `/tmp/user_preferences_migration.sql`
4. Copy the entire SQL content
5. Paste into Supabase SQL Editor
6. Click **Run**

#### Option B: Using Supabase CLI
```bash
# If you have Supabase CLI installed
supabase db push
```

### Step 2: Verify Migration
After applying the migration, verify it worked:

```sql
-- Check if table exists
SELECT * FROM user_learned_preferences LIMIT 1;

-- Check if functions exist
SELECT routine_name
FROM information_schema.routines
WHERE routine_name IN ('increment_genre_preference', 'increment_mood_preference', 'add_favorite_artist');
```

## How to Use

### For Users
1. Create playlists normally in SpotMefi
2. SpotMefi learns automatically in the background
3. View learned preferences: Click **Preferences** in dashboard nav
4. Reset preferences: Click **Reset All Preferences** button

### For Developers
```typescript
// Learn from a playlist (happens automatically after generation)
await learnFromPlaylist(
  userId,
  ['indie', 'pop'],        // genres
  ['chill', 'happy'],      // moods
  ['Billie Eilish'],       // artists
  50                        // track count
)

// Get learned preferences
const prefs = await getUserLearnedPreferences(userId)
console.log(prefs.favorite_genres)  // {"indie": 5, "pop": 3}

// Reset preferences
await resetUserPreferences(userId)
```

## Example Flow

### First Playlist Request
```
User: "chill indie music"
→ AI extracts: genres=["indie"], moods=["chill"]
→ System learns: indie +1, chill +1
→ Learned preferences: {"genres": {"indie": 1}, "moods": {"chill": 1}}
```

### Second Playlist Request
```
User: "happy indie vibes"
→ AI extracts: genres=["indie"], moods=["happy"]
→ System learns: indie +1, happy +1
→ Learned preferences: {"genres": {"indie": 2}, "moods": {"chill": 1, "happy": 1}}
```

### Third Playlist Request (Vague)
```
User: "something chill"
→ AI sees learned preferences: indie is most requested genre with "chill" mood
→ AI recommends: chill indie music (prioritizing learned patterns)
```

## Privacy Notes

### What IS Stored
- ✅ Genres/moods/artists from YOUR SpotMefi requests
- ✅ Your playlist length preferences
- ✅ Frequency counts (how many times you requested each genre/mood)

### What is NOT Stored
- ❌ Raw Spotify listening history
- ❌ Individual track preferences
- ❌ Playlist contents
- ❌ Third-party data

### GDPR Compliance
- Users can view all stored preferences (`/preferences`)
- Users can delete all preferences (Reset button)
- Data is minimal and purpose-specific
- No sharing with third parties

## Cost Analysis

### Development Cost
- Time: ~2 hours (COMPLETED ✅)
- Complexity: Medium
- Runtime cost: ₱0 (uses existing database)

### Benefits
- ✅ Better recommendations over time
- ✅ Privacy-friendly (only learns from intentional choices)
- ✅ No additional API costs
- ✅ User control (view/reset)
- ✅ Improves with usage

### Trade-offs
- Requires database migration
- Adds slight complexity to generation flow
- Learning is gradual (needs 3-5 playlists to be effective)

## Next Steps

1. **Apply the database migration** (see Database Setup above)
2. **Test the flow**:
   - Create 2-3 playlists
   - Visit `/preferences` to see learned data
   - Create a vague prompt like "something chill" and see if AI uses learned preferences
3. **Monitor logs** for "✅ Learned from playlist" messages
4. **Optional**: Add analytics to track preference learning effectiveness

## Troubleshooting

### Migration fails with "relation already exists"
- Table already exists, safe to ignore
- Or drop table first: `DROP TABLE user_learned_preferences CASCADE;`

### Preferences not showing in UI
- Check if table has data: `SELECT * FROM user_learned_preferences;`
- Check browser console for API errors
- Verify user is authenticated

### AI not using learned preferences
- Check logs for "User's SpotMefi patterns" in AI prompt
- Create more playlists (needs 2-3 to learn patterns)
- Use vague prompts like "chill music" to test

### Reset not working
- Check user permissions in Supabase
- Verify user_id matches between users and user_learned_preferences tables

## Future Enhancements

### Potential Improvements
1. **Collaborative filtering**: Learn from similar users
2. **Time-based weighting**: Recent preferences weighted higher
3. **Negative learning**: Track genres/moods user dislikes
4. **Export preferences**: Download as JSON
5. **Import preferences**: Upload from previous account

### Already Implemented ✅
- ✅ Privacy-first architecture
- ✅ View learned preferences
- ✅ Reset preferences
- ✅ Dual preference system (Spotify + Learned)
- ✅ Incremental learning from each playlist
