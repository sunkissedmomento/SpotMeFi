import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
  const spotifyUserId = request.cookies.get('spotify_user_id')?.value

  if (!spotifyUserId) {
    return NextResponse.json({ user: null }, { status: 401 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!
  )

  const { data: user, error } = await supabase
    .from('users')
    .select('id, spotify_id, email, display_name, profile_image, created_at')
    .eq('spotify_id', spotifyUserId)
    .single()

  if (error || !user) {
    return NextResponse.json({ user: null }, { status: 401 })
  }

  return NextResponse.json({ user })
}
