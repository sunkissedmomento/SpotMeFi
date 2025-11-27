# Authentication Troubleshooting Guide

## If Users Are Getting "Authentication Failed" Errors

### STEP 1: Check Spotify Developer Dashboard Settings

**CRITICAL**: Go to https://developer.spotify.com/dashboard/applications

1. Click on your app (SpotMefi)
2. Click "Edit Settings"
3. Under "Redirect URIs", you **MUST** have these **exact** URLs:

For local development:
```
http://127.0.0.1:3000/api/auth/callback
```

⚠️ **DO NOT USE**:
- `http://localhost:3000/api/auth/callback` ❌ (Spotify no longer accepts localhost)
- Any URL without `/api/auth/callback` ❌

For production (if deployed to Vercel):
```
https://your-app-name.vercel.app/api/auth/callback
```

4. Click "Save" at the bottom

---

### STEP 2: Users Must Access the Correct URL

**Tell your users to access**:
```
http://127.0.0.1:3000
```

⚠️ **NOT**:
- `http://localhost:3000` ❌
- Any other IP address ❌

---

### STEP 3: Check Server Logs

When a user tries to login and gets "Authentication failed", check the terminal/server logs.

Look for:
```
Auth callback error: Error: Failed to exchange code for token
```

This means the redirect URI doesn't match what's in Spotify settings.

---

### STEP 4: Common Issues & Solutions

| Issue | Cause | Fix |
|-------|-------|-----|
| "Illegal redirect_uri" | Redirect URI not in Spotify Dashboard | Add `http://127.0.0.1:3000/api/auth/callback` to Spotify settings |
| "Invalid client" | Wrong SPOTIFY_CLIENT_ID or SECRET | Check `.env.local` matches Spotify Dashboard |
| "Authentication failed" loop | User accessing via localhost | Tell users to use `127.0.0.1:3000` instead |
| Works for you but not others | They're using a different URL | Share the exact URL: `http://127.0.0.1:3000` |

---

### STEP 5: Test Authentication Flow

1. Open incognito/private browser window
2. Go to `http://127.0.0.1:3000`
3. Click "Login with Spotify"
4. You should be redirected to Spotify login
5. After login, you should land on `/dashboard`

If step 5 fails, check server terminal for error details.

---

### STEP 6: Production Deployment (Vercel)

When you deploy to production:

1. **Add environment variables** in Vercel:
   - `NEXT_PUBLIC_REDIRECT_URI` → `https://your-app.vercel.app/api/auth/callback`
   - `NEXT_PUBLIC_APP_URL` → `https://your-app.vercel.app`
   - All other env vars from `.env.local`

2. **Update Spotify Dashboard**:
   - Add production redirect URI: `https://your-app.vercel.app/api/auth/callback`

3. **Redeploy** after adding env vars

---

## Quick Debug

Run this in your terminal to verify environment variables:

```bash
echo "Redirect URI: $NEXT_PUBLIC_REDIRECT_URI"
echo "App URL: $NEXT_PUBLIC_APP_URL"
echo "Spotify Client ID: $SPOTIFY_CLIENT_ID"
```

Should output:
```
Redirect URI: http://127.0.0.1:3000/api/auth/callback
App URL: http://127.0.0.1:3000
Spotify Client ID: c8acf106ef914903a9ff75acbb6b5d50
```
