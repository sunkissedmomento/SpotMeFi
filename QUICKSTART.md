# Quick Start Guide

Get SpotMefi running locally in under 10 minutes.

## Prerequisites

- Node.js 18+ installed
- npm or yarn
- Spotify account
- Accounts created at:
  - [Supabase](https://supabase.com) (free tier)
  - [Anthropic](https://console.anthropic.com/) (API access)

## 5-Minute Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Spotify App (2 minutes)

1. Go to [https://developer.spotify.com/dashboard](https://developer.spotify.com/dashboard)
2. Click "Create an App"
3. Name it "SpotMefi Dev"
4. Add redirect URI: `http://localhost:3000/api/auth/callback`
5. Copy Client ID and Client Secret

### 3. Set Up Supabase (2 minutes)

1. Create new project at [https://supabase.com](https://supabase.com)
2. Go to SQL Editor
3. Paste contents from `supabase/schema.sql`
4. Click Run
5. Go to Settings > API and copy:
   - Project URL
   - `anon public` key
   - `service_role secret` key

### 4. Get Anthropic Key (1 minute)

1. Go to [https://console.anthropic.com/](https://console.anthropic.com/)
2. Create API key
3. Copy it

### 5. Configure Environment

```bash
cp .env.local.example .env.local
```

Edit `.env.local` and paste your values:

```env
# Supabase (from step 3)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_publishable_key_here
SUPABASE_SECRET_KEY=your_secret_key_here

# Spotify (from step 2)
SPOTIFY_CLIENT_ID=your_client_id_here
SPOTIFY_CLIENT_SECRET=your_client_secret_here
NEXT_PUBLIC_REDIRECT_URI=http://localhost:3000/api/auth/callback

# Anthropic (from step 4)
ANTHROPIC_API_KEY=your_api_key_here

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 6. Run the App

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## First Test

1. Click "Sign in with Spotify"
2. Authorize the app
3. Enter a prompt like: "chill lofi beats for studying"
4. Click "Generate Playlist"
5. Wait 10-20 seconds
6. Check your Spotify account for the new playlist!

## Troubleshooting

### "Invalid redirect URI"
- Double-check the redirect URI in Spotify exactly matches: `http://localhost:3000/api/auth/callback`

### "Database error"
- Make sure you ran the SQL schema in Supabase
- Verify your Supabase URL and keys are correct

### "Failed to generate playlist"
- Check Anthropic API key is valid
- Verify you have API credits
- Check browser console for detailed error

### Build errors
```bash
rm -rf .next node_modules
npm install
npm run dev
```

## What's Next?

- Read [README.md](README.md) for full documentation
- See [DEPLOYMENT.md](DEPLOYMENT.md) for production deployment
- Customize the UI in `app/` and `components/`
- Modify the AI prompt in `lib/ai/claude.ts`

## Project Structure

```
SpotMefi/
├── app/
│   ├── api/              # API routes
│   ├── dashboard/        # Main app
│   └── page.tsx          # Landing page
├── components/           # React components
├── lib/                  # Core logic
│   ├── ai/              # Claude integration
│   ├── spotify/         # Spotify API
│   └── supabase/        # Database
└── supabase/
    └── schema.sql       # Database schema
```

## Common Commands

```bash
# Development
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

## Tips

- Example prompts:
  - "upbeat indie rock for road trips"
  - "melancholic piano music for rainy days"
  - "90s hip hop for workout sessions"
  - "ambient electronic for deep focus"

- The AI works best with:
  - Mood descriptions (chill, energetic, sad)
  - Genre preferences (jazz, rock, electronic)
  - Use cases (workout, studying, party)
  - Time period (90s, modern, classic)

- Generated playlists contain 20-30 tracks
- Check your Spotify app immediately to see the playlist
- View history on the History page

## Need Help?

1. Check browser console for errors
2. Check terminal output for API errors
3. Verify all environment variables are set
4. Review [README.md](README.md) for detailed docs
5. Open an issue on GitHub

Happy playlist generating! 🎵
