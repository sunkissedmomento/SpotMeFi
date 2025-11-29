# SpotMefi Product Roadmap

## Current Status: MVP Complete ✅

SpotMefi has a working MVP with:
- AI-powered playlist generation from natural language
- 10-category track matching system (87% accuracy)
- Spotify OAuth integration
- Playlist history (limited to 5)
- Beautiful UI with branding

---

## What to Add Next

### 🔥 PHASE 1: Essential Features (High Priority)

#### 1. **Clarification Flow UI**
**Status:** API ready, frontend not connected
**Impact:** +29% accuracy improvement

**What to build:**
```
Frontend components:
- ClarificationModal.tsx - Shows AI-generated questions
- QuestionCard.tsx - Single question with answer input
- AnswerSummary.tsx - Review answers before generation

Flow:
User enters prompt → Click "Generate" →
  If confidence = low/medium:
    → Show clarification modal with 2-4 questions
    → User answers
    → Pass to /api/generate with answers
  Else:
    → Generate directly
```

**Files to modify:**
- `app/dashboard/page.tsx` - Add clarification step
- `components/ClarificationModal.tsx` (NEW)
- Update `PromptInput` to handle multi-step flow

**Effort:** 1-2 days

---

#### 2. **Playlist Management**
**Status:** Missing - users can't edit/delete playlists
**Impact:** Huge UX improvement

**What to build:**
```
Features:
- Delete playlist (removes from history + optionally from Spotify)
- Edit playlist name/description
- Regenerate playlist with same/modified prompt
- Add/remove individual tracks

API endpoints needed:
- DELETE /api/playlists/{id}
- PATCH /api/playlists/{id}
- POST /api/playlists/{id}/regenerate
- POST /api/playlists/{id}/tracks (add)
- DELETE /api/playlists/{id}/tracks/{trackId} (remove)

Frontend:
- PlaylistCard actions menu (3-dot menu)
- Edit modal
- Regenerate button with prompt pre-filled
- Track removal UI in PlaylistSummary
```

**Files to create/modify:**
- `app/api/playlists/[id]/route.ts` (NEW)
- `app/api/playlists/[id]/regenerate/route.ts` (NEW)
- `components/PlaylistActions.tsx` (NEW)
- `components/EditPlaylistModal.tsx` (NEW)

**Effort:** 3-4 days

---

#### 3. **Remove/Increase 5-Playlist Limit**
**Status:** Hardcoded limit at 5 playlists
**Impact:** Users hit limit quickly

**Options:**

**Option A - Remove limit entirely:**
```typescript
// app/api/generate/route.ts line 36
// DELETE this check:
const existingPlaylists = await supabase
  .from('playlists')
  .select('id')
  .eq('user_id', user.id)

if (existingPlaylists.data && existingPlaylists.data.length >= 5) {
  return NextResponse.json(
    { error: 'Maximum 5 playlists reached. Delete old playlists to create new ones.' },
    { status: 403 }
  )
}
```

**Option B - Increase to 50:**
```typescript
if (existingPlaylists.data && existingPlaylists.data.length >= 50) {
```

**Option C - Add pagination to history:**
```typescript
// Remove limit, add pagination to /api/playlists
// Show 20 per page with load more button
```

**Recommendation:** Option C (remove limit + add pagination)

**Effort:** 2-3 hours

---

#### 4. **Track Preview Player**
**Status:** Missing - users can't preview tracks
**Impact:** Better evaluation before committing

**What to build:**
```
Features:
- Play 30-second preview from Spotify
- Show audio features (tempo, energy, danceability)
- Visual audio feature bars
- Play/pause button on each track

Components:
- AudioPreview.tsx - Preview player with controls
- AudioFeatureBar.tsx - Visual bars for features
- Update TrackItem to show play button

Integration:
- Use track.preview_url from Spotify
- Add HTML5 audio element
- Show "No preview available" for tracks without preview_url
```

**Files to create/modify:**
- `components/AudioPreview.tsx` (NEW)
- `components/AudioFeatureBar.tsx` (NEW)
- `components/PlaylistSummary.tsx` - Add preview UI

**Effort:** 2-3 days

---

### 🚀 PHASE 2: Enhanced Experience (Medium Priority)

#### 5. **User Preferences & Defaults**
**Status:** Missing - users must provide full context each time

**What to build:**
```
Database:
CREATE TABLE user_preferences (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  favorite_genres TEXT[],
  favorite_artists TEXT[],
  default_mood TEXT,
  default_energy TEXT,
  preferred_language TEXT,
  exclude_explicit BOOLEAN DEFAULT false,
  default_track_limit INTEGER,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

API:
- GET /api/users/preferences
- PATCH /api/users/preferences

Frontend:
- New page: /preferences
- Genres multi-select
- Artists autocomplete
- Mood/energy sliders
- Explicit content toggle
```

**Benefits:**
- AI uses preferences as context
- Faster generation for repeat users
- More personalized results

**Effort:** 3-4 days

---

#### 6. **Playlist Search & Filters**
**Status:** Missing - no way to find playlists in history

**What to build:**
```
Features:
- Search by prompt text
- Filter by date created
- Filter by track count
- Sort by: newest, oldest, most tracks, least tracks

Frontend:
- SearchBar component in history
- FilterDropdown component
- Results count display

API updates:
- Add query params to /api/playlists:
  ?search=text&sortBy=created_at&order=desc&minTracks=30
```

**Effort:** 1-2 days

---

#### 7. **Playlist Tags & Organization**
**Status:** Missing - playlists just pile up

**What to build:**
```
Database:
CREATE TABLE playlist_tags (
  id UUID PRIMARY KEY,
  playlist_id UUID REFERENCES playlists(id) ON DELETE CASCADE,
  tag_name TEXT NOT NULL,
  created_at TIMESTAMP
);

Features:
- Add tags to playlists (workout, chill, study, party, etc.)
- Filter history by tag
- Tag suggestions based on AI-detected mood
- Multiple tags per playlist

Frontend:
- Tag input in playlist card
- Tag filter chips
- Tag autocomplete
```

**Effort:** 2-3 days

---

#### 8. **Playlist Analytics Dashboard**
**Status:** Missing - no insights into usage

**What to build:**
```
New page: /analytics

Metrics to show:
- Total playlists created
- Total tracks added to Spotify
- Most used genres
- Most used moods
- Average playlist length
- Most frequent prompts
- Best performing playlists (highest scores)

Charts:
- Playlists over time (line chart)
- Genre distribution (pie chart)
- Mood distribution (bar chart)
- Track count distribution (histogram)

Integration:
- Query Supabase for aggregates
- Use recharts or chart.js
- Add export to CSV
```

**Effort:** 4-5 days

---

### 🎨 PHASE 3: Social & Community (Lower Priority)

#### 9. **Playlist Sharing**
**Status:** Missing - playlists are private only

**What to build:**
```
Database:
ALTER TABLE playlists ADD COLUMN is_public BOOLEAN DEFAULT false;
ALTER TABLE playlists ADD COLUMN share_token TEXT UNIQUE;

CREATE TABLE playlist_likes (
  id UUID PRIMARY KEY,
  playlist_id UUID REFERENCES playlists(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP,
  UNIQUE(playlist_id, user_id)
);

Features:
- Toggle playlist public/private
- Generate shareable link
- Public playlist gallery page
- Like/unlike playlists
- View count tracking

API:
- POST /api/playlists/{id}/share
- GET /api/playlists/public
- POST /api/playlists/{id}/like
- GET /api/playlists/shared/{token}

Frontend:
- Share button with copy link
- Public gallery page /explore
- Like button on playlist cards
```

**Effort:** 5-7 days

---

#### 10. **Collaborative Playlists**
**Status:** Missing - single-user only

**What to build:**
```
Database:
CREATE TABLE playlist_collaborators (
  id UUID PRIMARY KEY,
  playlist_id UUID REFERENCES playlists(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  role TEXT CHECK (role IN ('owner', 'editor', 'viewer')),
  created_at TIMESTAMP,
  UNIQUE(playlist_id, user_id)
);

Features:
- Invite collaborators by email/Spotify ID
- Editor role: add/remove tracks
- Viewer role: see playlist only
- Activity log for changes

API:
- POST /api/playlists/{id}/collaborators
- DELETE /api/playlists/{id}/collaborators/{userId}
- GET /api/playlists/{id}/activity

Frontend:
- Invite modal
- Collaborator list
- Activity feed
```

**Effort:** 7-10 days

---

#### 11. **Community Features**
**Status:** Missing - no social aspect

**What to build:**
```
Features:
- Featured playlists (admin curated)
- Trending playlists (most liked this week)
- User profiles (public playlists, stats)
- Follow users
- Comments on public playlists
- Playlist collections (albums of playlists)

Pages:
- /explore - Discover public playlists
- /users/{id} - User profile
- /trending - Trending playlists

Database tables:
- featured_playlists
- user_follows
- playlist_comments
- playlist_collections
```

**Effort:** 15-20 days (large feature)

---

### 🤖 PHASE 4: Advanced AI Features

#### 12. **Multi-Turn Conversations**
**Status:** One-shot generation only

**What to build:**
```
Features:
- Chat interface for playlist building
- AI asks follow-up questions
- User can refine prompt iteratively
- "Add more tracks like X"
- "Remove all Y genre tracks"
- "Make it more energetic"

Database:
CREATE TABLE ai_conversations (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  playlist_id UUID REFERENCES playlists(id) ON DELETE SET NULL,
  messages JSONB[], -- [{role, content, timestamp}]
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

API:
- POST /api/chat/message
- GET /api/chat/conversations
- POST /api/chat/apply (apply conversation to playlist)

Frontend:
- Chat interface component
- Message bubbles
- Typing indicator
```

**Effort:** 10-12 days

---

#### 13. **Smart Recommendations**
**Status:** No recommendation engine

**What to build:**
```
Features:
- "Similar to this playlist" button
- AI-suggested prompts based on history
- "You might like" section
- Genre/mood recommendations
- Trending prompts

Implementation:
- Analyze user's playlist history
- Extract common patterns (genres, moods, artists)
- Use AI to generate suggested prompts
- Show 3-5 suggestions on dashboard

API:
- GET /api/recommendations
- POST /api/recommendations/feedback (like/dislike)
```

**Effort:** 5-7 days

---

#### 14. **Mood Detection from Text**
**Status:** Manual mood input only

**What to build:**
```
Features:
- User writes how they're feeling (free text)
- AI detects mood/emotions/energy
- Generates playlist from emotion
- Support multiple languages

Examples:
"I'm feeling stressed and need to relax"
→ AI: calm, low energy, peaceful playlist

"Just got a promotion, feeling pumped!"
→ AI: happy, high energy, celebratory playlist

Integration:
- Update Claude prompt to handle emotion detection
- Add emotion → music mood mapping
- Show detected mood in UI
```

**Effort:** 2-3 days

---

### 📱 PHASE 5: Mobile & Performance

#### 15. **Progressive Web App (PWA)**
**Status:** Web-only, no mobile app

**What to build:**
```
Features:
- Install as app on mobile
- Offline support (cached playlists)
- Push notifications for new features
- Home screen icon
- Native-like UI

Files to add:
- public/manifest.json
- public/service-worker.js
- public/icons/ (various sizes)

Next.js config:
- Add next-pwa plugin
- Configure caching strategy
```

**Effort:** 3-4 days

---

#### 16. **Performance Optimizations**
**Status:** Works well but can be faster

**What to optimize:**
```
1. Caching:
   - Cache AI intents (same prompt = cached result)
   - Cache Spotify artist searches
   - Cache audio features
   - Use Redis or Vercel KV

2. Database:
   - Add more indexes
   - Use database connection pooling
   - Implement query caching

3. API:
   - Batch Spotify requests better
   - Parallel API calls where possible
   - Reduce over-fetching

4. Frontend:
   - Lazy load components
   - Image optimization
   - Code splitting
   - Virtualized lists for large playlists

Implementation:
- Add Redis/Vercel KV
- Optimize Spotify client batch calls
- Add React.lazy for heavy components
```

**Effort:** 5-7 days

---

### 💰 PHASE 6: Monetization (Optional)

#### 17. **Subscription Tiers**
**Status:** Free for all

**What to build:**
```
Tiers:
1. Free:
   - 5 playlists max
   - 50 tracks per playlist
   - Basic matching

2. Pro ($4.99/month):
   - Unlimited playlists
   - 200 tracks per playlist
   - Advanced matching
   - Playlist analytics
   - Priority support

3. Team ($14.99/month):
   - Everything in Pro
   - Collaborative playlists
   - Team management
   - Shared quota

Integration:
- Stripe for payments
- Subscription management
- Webhook handling
- Feature gating
```

**Effort:** 10-15 days

---

## Priority Order Recommendation

### Week 1-2: Essential UX
1. ✅ Connect clarification flow UI
2. ✅ Add playlist delete/edit
3. ✅ Remove 5-playlist limit + pagination
4. ✅ Add track preview player

### Week 3-4: User Customization
5. ✅ User preferences page
6. ✅ Playlist search & filters
7. ✅ Playlist tags
8. ✅ Better error messages

### Week 5-6: Analytics & Insights
9. ✅ Analytics dashboard
10. ✅ Smart recommendations
11. ✅ Performance optimizations
12. ✅ PWA support

### Week 7+: Social Features (if desired)
13. Playlist sharing
14. Community gallery
15. Collaborative playlists
16. User profiles

### Future: Advanced Features
17. Multi-turn AI conversations
18. Subscription tiers
19. Mobile app (native)
20. API for third-party developers

---

## Technical Debt to Address

### Current Issues:
1. ⚠️ No unit tests
2. ⚠️ No API rate limiting
3. ⚠️ No request validation middleware
4. ⚠️ Audio features fallback not logged
5. ⚠️ No caching anywhere
6. ⚠️ Error messages could be more specific
7. ⚠️ No monitoring/logging service

### Recommended Fixes:
```
1. Testing:
   - Add Jest + React Testing Library
   - Test critical flows (auth, generation)
   - Add E2E tests with Playwright

2. API Security:
   - Add rate limiting (10 req/min per user)
   - Add request validation with Zod
   - Add CORS restrictions
   - Add audit logging

3. Monitoring:
   - Add Sentry for error tracking
   - Add Vercel Analytics
   - Add custom event logging
   - Set up alerts for errors

4. Performance:
   - Add Redis caching
   - Optimize database queries
   - Add CDN for static assets
   - Implement lazy loading
```

---

## Success Metrics to Track

### User Engagement:
- Playlists created per user
- Average tracks per playlist
- Clarification question answer rate
- Regeneration rate
- User retention (7-day, 30-day)

### Quality Metrics:
- Average track matching score
- Genre consistency rate
- User satisfaction (ratings)
- Playlist completion rate (tracks added vs generated)

### Technical Metrics:
- API response times
- Error rates
- Spotify API rate limit usage
- Database query performance

---

## Final Recommendation: Focus Areas

**For Solo Developer (You):**
1. **Phase 1** first - Essential UX improvements
2. **Phase 2** second - Enhanced experience
3. Skip social features initially (Phase 3)
4. Add AI improvements (Phase 4) based on user feedback

**For Team of 2-3:**
1. Split: One on Phase 1, one on Phase 2
2. Add social features (Phase 3) if product-market fit found
3. Consider monetization (Phase 6) after user base grows

**For Growth/Scale:**
1. All of Phase 1 + 2
2. Social features (Phase 3) for virality
3. Advanced AI (Phase 4) for differentiation
4. Monetization (Phase 6) for sustainability

---

## Next Immediate Steps

1. **Today:** Remove 5-playlist limit
2. **This Week:** Connect clarification UI
3. **Next Week:** Add playlist management
4. **Month 1:** Complete Phase 1 + 2
5. **Month 2:** Add analytics, optimization
6. **Month 3:** Decide on social vs monetization

---

**Current State:** MVP with core features working
**Target State:** Full-featured playlist generator with community
**Estimated Time to Full Product:** 3-4 months (solo dev)

**Your SpotMefi is already impressive! These additions will make it world-class.** 🎵
