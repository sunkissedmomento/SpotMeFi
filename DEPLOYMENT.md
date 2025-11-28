# Deployment Guide

This guide will walk you through deploying SpotMefi to production on Vercel with Supabase.

## Pre-Deployment Checklist

- [ ] Spotify Developer App created
- [ ] Supabase project created and schema deployed
- [ ] Anthropic API key obtained
- [ ] GitHub repository created
- [ ] All environment variables documented

## Step 1: Set Up Supabase

### 1.1 Create Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Click "New Project"
3. Choose organization and enter project details
4. Wait for project to be provisioned

### 1.2 Run Database Schema

1. In Supabase dashboard, go to "SQL Editor"
2. Click "New Query"
3. Copy contents from `supabase/schema.sql`
4. Click "Run" to execute the schema
5. Verify tables are created in "Table Editor"

### 1.3 Get API Keys

1. Go to Settings > API
2. Copy the following:
   - Project URL (e.g., `https://xxxxx.supabase.co`)
   - `anon` `public` key
   - `service_role` `secret` key (keep this secure!)

## Step 2: Set Up Spotify

### 2.1 Create Spotify App

1. Go to [https://developer.spotify.com/dashboard](https://developer.spotify.com/dashboard)
2. Click "Create an App"
3. Enter app name and description
4. Check the terms of service box
5. Click "Create"

### 2.2 Configure App Settings

1. Click "Edit Settings"
2. Add Redirect URIs:
   - Development: `http://localhost:3000/api/auth/callback`
   - Production: `https://your-domain.vercel.app/api/auth/callback` (add after deployment)
3. Save settings
4. Copy Client ID and Client Secret

### 2.3 Verify Scopes

Ensure your app requests these scopes (handled in code):
- `user-read-private`
- `user-read-email`
- `playlist-modify-public`
- `playlist-modify-private`

## Step 3: Get Anthropic API Key

1. Go to [https://console.anthropic.com/](https://console.anthropic.com/)
2. Sign up or log in
3. Go to API Keys section
4. Create a new API key
5. Copy and save it securely

## Step 4: Local Testing

### 4.1 Install Dependencies

```bash
npm install
```

### 4.2 Configure Environment

```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your values:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_publishable_key
SUPABASE_SECRET_KEY=your_secret_key

# Spotify
SPOTIFY_CLIENT_ID=your_client_id
SPOTIFY_CLIENT_SECRET=your_client_secret
NEXT_PUBLIC_REDIRECT_URI=http://localhost:3000/api/auth/callback

# Anthropic
ANTHROPIC_API_KEY=your_api_key

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4.3 Run Development Server

```bash
npm run dev
```

Visit `http://localhost:3000` and test:
- [ ] Sign in with Spotify works
- [ ] User is redirected to dashboard
- [ ] Playlist generation works
- [ ] Playlist appears in Spotify
- [ ] History page shows created playlists
- [ ] Logout works

## Step 5: Prepare for Production

### 5.1 Create GitHub Repository

```bash
git init
git add .
git commit -m "Initial commit: SpotMefi AI Playlist Generator"
git branch -M main
git remote add origin https://github.com/yourusername/spotmefi.git
git push -u origin main
```

### 5.2 Review Code

- [ ] Remove any console.logs or debug code
- [ ] Verify all error handling is in place
- [ ] Check that no secrets are hardcoded
- [ ] Ensure `.env.local` is in `.gitignore`

## Step 6: Deploy to Vercel

### 6.1 Connect Repository

1. Go to [https://vercel.com](https://vercel.com)
2. Click "Add New" > "Project"
3. Import your GitHub repository
4. Select the repository

### 6.2 Configure Project

1. Framework Preset: Next.js (auto-detected)
2. Root Directory: `./` (default)
3. Build Command: `next build` (default)
4. Output Directory: `.next` (default)

### 6.3 Add Environment Variables

Click "Environment Variables" and add all variables:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_publishable_key
SUPABASE_SECRET_KEY=your_secret_key
SPOTIFY_CLIENT_ID=your_client_id
SPOTIFY_CLIENT_SECRET=your_client_secret
NEXT_PUBLIC_REDIRECT_URI=https://your-app.vercel.app/api/auth/callback
ANTHROPIC_API_KEY=your_api_key
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

**Important**: Leave `NEXT_PUBLIC_REDIRECT_URI` and `NEXT_PUBLIC_APP_URL` with placeholder values for now. Update after first deployment.

### 6.4 Deploy

1. Click "Deploy"
2. Wait for deployment to complete
3. Note your production URL (e.g., `https://spotmefi.vercel.app`)

## Step 7: Post-Deployment Configuration

### 7.1 Update Environment Variables

1. In Vercel dashboard, go to Settings > Environment Variables
2. Update these variables with your actual domain:
   - `NEXT_PUBLIC_REDIRECT_URI=https://your-actual-domain.vercel.app/api/auth/callback`
   - `NEXT_PUBLIC_APP_URL=https://your-actual-domain.vercel.app`
3. Redeploy the application

### 7.2 Update Spotify Redirect URI

1. Go to Spotify Developer Dashboard
2. Open your app settings
3. Add production redirect URI:
   - `https://your-actual-domain.vercel.app/api/auth/callback`
4. Save settings

### 7.3 Test Production

Visit your production URL and test:
- [ ] Landing page loads correctly
- [ ] Spotify OAuth works
- [ ] Playlist generation works
- [ ] All features work as in development

## Step 8: Optional - Custom Domain

### 8.1 Add Domain in Vercel

1. Go to your project in Vercel
2. Settings > Domains
3. Add your custom domain
4. Follow DNS configuration instructions

### 8.2 Update Environment Variables

After custom domain is configured:
1. Update `NEXT_PUBLIC_REDIRECT_URI` with custom domain
2. Update `NEXT_PUBLIC_APP_URL` with custom domain
3. Redeploy

### 8.3 Update Spotify Settings

Add custom domain redirect URI to Spotify app settings.

## Monitoring and Maintenance

### Vercel Dashboard

Monitor your application:
- Deployments: View deployment history
- Analytics: Track page views and performance
- Logs: Check runtime logs for errors

### Supabase Dashboard

Monitor your database:
- Table Editor: View user and playlist data
- Logs: Check database queries
- API: Monitor API usage

### Anthropic Console

Monitor API usage:
- Check remaining credits
- View API call statistics
- Set up billing alerts

## Troubleshooting

### Issue: Spotify OAuth Fails

**Solution**:
1. Verify redirect URI in Spotify matches exactly (including `https://`)
2. Check that environment variables are set correctly
3. Ensure Spotify app is not in development mode (if applicable)

### Issue: Database Errors

**Solution**:
1. Verify Supabase connection in dashboard
2. Check that schema was properly deployed
3. Verify service role key is correct
4. Check Supabase logs for specific errors

### Issue: Claude API Errors

**Solution**:
1. Verify API key is correct
2. Check if you have sufficient credits
3. Review Claude API status page
4. Check rate limits

### Issue: Build Fails on Vercel

**Solution**:
1. Check build logs for specific errors
2. Verify all dependencies are in package.json
3. Test build locally: `npm run build`
4. Check Node.js version compatibility

## Security Best Practices

- [ ] Never commit `.env.local` to git
- [ ] Rotate API keys regularly
- [ ] Use Vercel's environment variable encryption
- [ ] Enable Supabase Row Level Security policies
- [ ] Monitor API usage for anomalies
- [ ] Set up Vercel's security headers
- [ ] Use HTTPS only (enforced by Vercel)

## Scaling Considerations

As your app grows:

1. **Database**: Monitor Supabase usage, upgrade plan if needed
2. **API Limits**: Watch Anthropic and Spotify API rate limits
3. **Vercel**: Monitor function execution time and invocations
4. **Caching**: Consider implementing Redis for token caching
5. **CDN**: Vercel's Edge Network handles this automatically

## Backup and Recovery

### Database Backups

1. Supabase provides automatic daily backups
2. To create manual backup: Supabase Dashboard > Database > Backups
3. Export data: Use Supabase CLI or API

### Code Backups

1. GitHub serves as primary code backup
2. Keep main branch protected
3. Use feature branches for development

## Support

If you encounter issues:

1. Check Vercel deployment logs
2. Check Supabase logs
3. Review browser console errors
4. Check this guide's Troubleshooting section
5. Review Next.js documentation
6. Open an issue on GitHub (if applicable)

## Success Checklist

- [ ] Application deployed to Vercel
- [ ] Custom domain configured (optional)
- [ ] All environment variables set
- [ ] Spotify OAuth working in production
- [ ] Database connected and working
- [ ] Playlist generation working
- [ ] History page displaying data
- [ ] Mobile responsive design working
- [ ] No console errors in production
- [ ] Monitoring set up

Congratulations! Your SpotMefi application is now live! 🎉
