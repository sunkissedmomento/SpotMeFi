# SpotMefi - AI Playlist Generator

A minimalist, AI-powered web application that creates Spotify playlists from natural language prompts. Built with Next.js, Supabase, and Anthropic Claude.

## Features

- **Natural Language Input**: Describe your ideal playlist in plain English
- **AI-Powered Curation**: Claude AI interprets your mood and finds perfect tracks
- **Instant Creation**: Playlists are created directly in your Spotify account
- **Beautiful UI**: Clean, minimal interface with smooth animations
- **Playlist History**: View all your previously generated playlists
- **Mobile Responsive**: Works seamlessly on all devices

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React, TypeScript, TailwindCSS
- **Backend**: Next.js API Routes, Server Actions
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Spotify OAuth via Supabase
- **AI**: Anthropic Claude API
- **Deployment**: Vercel

## Setup Instructions

### Prerequisites

- Node.js 18+ and npm
- Spotify Developer Account
- Supabase Account
- Anthropic API Key

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd SpotMefi
npm install
```

### 2. Spotify Setup

1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Create a new app
3. Add redirect URI: `http://localhost:3000/api/auth/callback`
4. Note your Client ID and Client Secret

### 3. Supabase Setup

1. Create a new project at [Supabase](https://supabase.com)
2. Go to SQL Editor and run the schema from `supabase/schema.sql`
3. Get your project URL and keys from Settings > API

### 4. Anthropic Setup

1. Get your API key from [Anthropic Console](https://console.anthropic.com/)

### 5. Environment Variables

Create `.env.local` file:

```bash
cp .env.local.example .env.local
```

Fill in all the values:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Spotify OAuth
SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
NEXT_PUBLIC_REDIRECT_URI=http://localhost:3000/api/auth/callback

# Anthropic Claude
ANTHROPIC_API_KEY=your_anthropic_api_key

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 6. Run Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## Deployment to Vercel

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin <your-github-repo-url>
git push -u origin main
```

### 2. Deploy to Vercel

1. Go to [Vercel](https://vercel.com)
2. Import your GitHub repository
3. Configure environment variables (same as `.env.local`)
4. Update Spotify redirect URI to include production URL:
   - `https://your-domain.vercel.app/api/auth/callback`
5. Deploy

### 3. Update Environment Variables

In Vercel dashboard, add all environment variables from `.env.local` and update:

```env
NEXT_PUBLIC_REDIRECT_URI=https://your-domain.vercel.app/api/auth/callback
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
```

### 4. Update Spotify App Settings

In Spotify Developer Dashboard, add production redirect URI:
- `https://your-domain.vercel.app/api/auth/callback`

## Project Structure

```
SpotMefi/
├── app/
│   ├── api/
│   │   ├── auth/          # Authentication endpoints
│   │   ├── generate/      # Playlist generation
│   │   └── playlists/     # Playlist history
│   ├── dashboard/         # Main app interface
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Landing page
├── components/
│   ├── LoadingState.tsx   # Loading animations
│   ├── PlaylistSummary.tsx # Playlist display
│   └── PromptInput.tsx    # Main input component
├── lib/
│   ├── ai/
│   │   └── claude.ts      # Claude AI integration
│   ├── spotify/
│   │   ├── client.ts      # Spotify API client
│   │   └── types.ts       # Spotify types
│   └── supabase/
│       ├── client.ts      # Client-side Supabase
│       ├── server.ts      # Server-side Supabase
│       └── types.ts       # Database types
├── supabase/
│   └── schema.sql         # Database schema
└── package.json
```

## How It Works

### Hybrid AI + Spotify Approach

The app uses a cost-optimized hybrid approach:

1. **User Input**: Natural language prompt (e.g., "latest viral pop hits")
2. **Claude 3.5 Haiku**: Analyzes intent and extracts:
   - Genres, moods, energy level
   - Year preferences (recent/classic/specific)
   - Keywords for search
3. **Spotify Discovery**: Uses multiple strategies:
   - Smart search with genre + year filters
   - Recommendations API based on genres
   - New Releases API for trending tracks
4. **Result**: Real, current tracks from Spotify (updated daily/weekly)

### API Cost Optimization

- **Cost per playlist**: ~$0.0004-0.0006 (0.04-0.06 cents)
- **With $5 budget**: ~10,000 playlists or 2,000 users (5 playlists each)
- **Prompt caching**: 90% cost reduction on repeated requests
- **Spotify API**: Free (all track discovery)

This approach is **9× cheaper** than using GPT-4o while providing more current, accurate results.

## User Flow

1. **Landing Page**: User clicks "Sign in with Spotify"
2. **OAuth**: Spotify authentication flow
3. **Dashboard**: Main interface with prompt input
4. **Generation**:
   - User enters natural language prompt
   - Claude 3.5 Haiku analyzes intent
   - Spotify API discovers real, current tracks
   - Playlist created in user's account
5. **Result**: Display playlist with tracks and link
6. **History**: View all previously created playlists

## API Endpoints

- `GET /api/auth/login` - Initiate Spotify OAuth
- `GET /api/auth/callback` - Handle OAuth callback
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user
- `POST /api/generate` - Generate playlist from prompt
- `GET /api/playlists` - Get user's playlist history

## Database Schema

### users
- `id` - UUID primary key
- `spotify_id` - Spotify user ID (unique)
- `email` - User email
- `display_name` - Display name
- `profile_image` - Profile image URL
- `access_token` - Spotify access token
- `refresh_token` - Spotify refresh token
- `token_expires_at` - Token expiration timestamp
- `created_at` - Account creation timestamp
- `last_login` - Last login timestamp

### playlists
- `id` - UUID primary key
- `user_id` - Foreign key to users
- `prompt` - Original user prompt
- `playlist_name` - Generated playlist name
- `playlist_description` - Generated description
- `playlist_id_spotify` - Spotify playlist ID
- `track_count` - Number of tracks
- `created_at` - Creation timestamp

## Troubleshooting

### Authentication Issues
- Verify Spotify redirect URIs match exactly
- Check that all environment variables are set
- Ensure Spotify app has correct scopes

### Token Expiration
- App automatically refreshes tokens
- If issues persist, logout and login again

### Playlist Generation Fails
- Check Anthropic API key is valid
- Verify Claude API has sufficient credits
- Check browser console for detailed errors

## Future Enhancements

- Add more AI models for variety
- Support for collaborative playlists
- Playlist editing and regeneration
- Social sharing features
- Advanced filtering options
- Analytics dashboard

## License

MIT

## Support

For issues and questions, please open an issue on GitHub.
# SpotMeFi
