# Getting Started with SpotMefi

Welcome! This guide will help you understand and run SpotMefi.

## What is SpotMefi?

SpotMefi is an AI-powered playlist generator that creates custom Spotify playlists from natural language descriptions.

**Example prompts:**
- "chill synthwave for rainy late nights"
- "energetic 90s house music for a morning workout"
- "sad indie folk for contemplative walks"

The app uses Claude AI to understand your prompt and curate a perfect playlist.

## Quick Links

- **First time setup?** → Read [QUICKSTART.md](QUICKSTART.md)
- **Ready to deploy?** → Read [DEPLOYMENT.md](DEPLOYMENT.md)
- **Want all the details?** → Read [README.md](README.md)
- **Architecture overview?** → Read [PROJECT_SUMMARY.md](PROJECT_SUMMARY.md)

## Prerequisites

Before you start, make sure you have:

- [x] Node.js 18 or higher installed
- [x] A Spotify account
- [x] A code editor (VS Code recommended)

## Setup Process

### Step 1: Get Your API Keys

You'll need accounts and API keys from three services:

1. **Supabase** (Database)
   - Sign up at [supabase.com](https://supabase.com)
   - Free tier is perfect for development
   - Takes 2 minutes to set up

2. **Spotify** (Music API)
   - Go to [developer.spotify.com](https://developer.spotify.com/dashboard)
   - Create a developer app
   - Free and instant

3. **Anthropic** (AI)
   - Sign up at [console.anthropic.com](https://console.anthropic.com/)
   - Get API key
   - You'll need credits ($5 minimum, lasts a long time)

### Step 2: Install and Configure

```bash
# Install dependencies
npm install

# Copy environment template
cp .env.local.example .env.local

# Edit .env.local with your API keys
# (Use your favorite editor)
```

### Step 3: Set Up Database

1. In Supabase dashboard, go to SQL Editor
2. Copy contents from `supabase/schema.sql`
3. Paste and run
4. Done! Your database is ready

### Step 4: Validate Setup

```bash
# Run validation script
npm run validate
```

This will check if all environment variables are configured correctly.

### Step 5: Start Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## First Playlist

1. Click "Sign in with Spotify"
2. Authorize the app
3. Enter a prompt: "upbeat indie rock for road trips"
4. Click "Generate Playlist"
5. Wait 15-20 seconds
6. Check your Spotify app!

## Project Structure

```
SpotMefi/
├── 📱 app/              # Pages and API routes
├── 🎨 components/       # React components
├── 📚 lib/              # Core functionality
│   ├── ai/             # Claude integration
│   ├── spotify/        # Spotify API
│   └── supabase/       # Database
├── 🗄️ supabase/         # Database schema
└── 📖 Documentation     # Guides and README
```

## How It Works

```
User Input
    ↓
"chill lofi beats for studying"
    ↓
Claude AI analyzes the prompt
    ↓
Generates 30 track search queries
    ↓
Searches Spotify for each track
    ↓
Creates playlist in user's Spotify
    ↓
Saves to database
    ↓
Shows result to user
```

## Development Workflow

### Making Changes

1. Edit files in your code editor
2. Changes hot-reload automatically
3. Test in browser
4. Commit when ready

### Key Files to Modify

- **UI/Styling**: `app/` and `components/`
- **AI Prompts**: `lib/ai/claude.ts`
- **API Logic**: `app/api/`
- **Database**: `supabase/schema.sql`

### Customization Ideas

- Change the UI theme in `tailwind.config.ts`
- Adjust AI prompt in `lib/ai/claude.ts`
- Add more example prompts in `components/PromptInput.tsx`
- Modify track count (default: 20-30 tracks)

## Common Commands

```bash
# Development
npm run dev              # Start dev server
npm run validate         # Check environment setup
npm run lint            # Check code quality

# Production
npm run build           # Build for production
npm start              # Start production server
```

## Troubleshooting

### Port 3000 is already in use
```bash
# Kill the process or use a different port
PORT=3001 npm run dev
```

### Environment variables not loading
```bash
# Make sure .env.local exists
ls -la .env.local

# Restart dev server
# (Ctrl+C then npm run dev)
```

### Spotify OAuth fails
- Check redirect URI exactly matches in Spotify dashboard
- Format: `http://localhost:3000/api/auth/callback`
- No trailing slashes!

### Database connection fails
- Verify Supabase URL is correct
- Check both anon and service role keys
- Make sure schema was run in SQL Editor

### Claude API errors
- Verify API key is correct
- Check you have API credits
- Look at terminal logs for details

## Understanding the Code

### Frontend (app/page.tsx, dashboard/page.tsx)
- React components using Next.js App Router
- TypeScript for type safety
- TailwindCSS for styling

### API Routes (app/api/*)
- Next.js API routes handle backend logic
- Server-side code for security
- Integrates with Spotify, Claude, and Supabase

### Database (lib/supabase/*)
- PostgreSQL via Supabase
- Stores users and playlist history
- Secure token storage

### AI (lib/ai/claude.ts)
- Calls Anthropic Claude API
- Sends structured prompts
- Parses JSON responses

### Spotify (lib/spotify/client.ts)
- OAuth authentication
- Playlist creation
- Track searching

## Tips for Success

1. **Start Simple**: Create a few playlists to see how it works
2. **Experiment**: Try different prompt styles
3. **Check Logs**: Terminal shows helpful debug info
4. **Use Examples**: Copy from existing code
5. **Read Docs**: Each major file has comments

## Learning Resources

- **Next.js**: [nextjs.org/docs](https://nextjs.org/docs)
- **React**: [react.dev](https://react.dev)
- **TailwindCSS**: [tailwindcss.com](https://tailwindcss.com)
- **Supabase**: [supabase.com/docs](https://supabase.com/docs)
- **Spotify API**: [developer.spotify.com](https://developer.spotify.com/documentation/web-api)
- **Anthropic**: [docs.anthropic.com](https://docs.anthropic.com)

## Next Steps

### After Local Development Works

1. Test thoroughly with different prompts
2. Customize the UI to your liking
3. Consider additional features
4. Follow [DEPLOYMENT.md](DEPLOYMENT.md) to deploy

### Feature Ideas

- Save favorite prompts
- Share playlists socially
- Edit generated playlists
- Add more AI models
- Collaborative playlists
- Mood-based recommendations

## Getting Help

If you're stuck:

1. Check browser console for errors (F12)
2. Check terminal output for API errors
3. Review the troubleshooting section above
4. Re-read [QUICKSTART.md](QUICKSTART.md)
5. Check environment variables with `npm run validate`
6. Review API key permissions

## Environment Variables Quick Reference

```env
# Supabase (from dashboard)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=eyJh...
SUPABASE_SECRET_KEY=eyJh...

# Spotify (from developer dashboard)
SPOTIFY_CLIENT_ID=abc123...
SPOTIFY_CLIENT_SECRET=def456...
NEXT_PUBLIC_REDIRECT_URI=http://localhost:3000/api/auth/callback

# Anthropic (from console)
ANTHROPIC_API_KEY=sk-ant-...

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Success Checklist

Before moving to deployment, verify:

- [ ] Sign in with Spotify works
- [ ] You're redirected to dashboard after login
- [ ] Prompt input accepts text
- [ ] Playlist generates successfully
- [ ] Playlist appears in your Spotify
- [ ] Track list displays correctly
- [ ] History page shows generated playlists
- [ ] Logout works
- [ ] No console errors
- [ ] Mobile view looks good

## Contributing

Want to improve SpotMefi?

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT - Feel free to use this for learning or building your own projects!

---

**Ready to start?** → Follow [QUICKSTART.md](QUICKSTART.md) for setup

**Questions?** → Check [README.md](README.md) for detailed documentation

**Deploy ready?** → Follow [DEPLOYMENT.md](DEPLOYMENT.md) for production

Happy playlist creating! 🎵✨
