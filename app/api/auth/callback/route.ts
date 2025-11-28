import { NextRequest, NextResponse } from 'next/server'
import { exchangeCodeForToken } from '@/lib/spotify/client'
import { SpotifyClient } from '@/lib/spotify/client'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get('code')
  const error = searchParams.get('error')

  if (error || !code) {
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/?error=auth_failed`
    )
  }

  try {
    const tokenResponse = await exchangeCodeForToken(code)
    const spotifyClient = new SpotifyClient(tokenResponse.access_token)
    const spotifyUser = await spotifyClient.getCurrentUser()

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SECRET_KEY!
    )

    const expiresAt = Date.now() + tokenResponse.expires_in * 1000

    const { error: dbError } = await supabase.from('users').upsert(
      {
        spotify_id: spotifyUser.id,
        email: spotifyUser.email,
        display_name: spotifyUser.display_name,
        profile_image: spotifyUser.images[0]?.url || null,
        access_token: tokenResponse.access_token,
        refresh_token: tokenResponse.refresh_token || null,
        token_expires_at: expiresAt,
        last_login: new Date().toISOString(),
      },
      {
        onConflict: 'spotify_id',
      }
    )

    if (dbError) {
      console.error('Database error:', dbError)
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/?error=db_error`
      )
    }

    const response = NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`
    )

    response.cookies.set('spotify_user_id', spotifyUser.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30,
    })

    return response
  } catch (error) {
    console.error('Auth callback error:', error)
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      code,
      redirectUri: process.env.NEXT_PUBLIC_REDIRECT_URI,
      appUrl: process.env.NEXT_PUBLIC_APP_URL,
    })
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/?error=auth_failed`
    )
  }
}
