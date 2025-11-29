// app/api/preferences/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getUserLearnedPreferences, resetUserPreferences } from '@/lib/preferences/learner'

export async function GET(req: NextRequest) {
  try {
    const spotifyUserId = req.cookies.get('spotify_user_id')?.value
    if (!spotifyUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SECRET_KEY!
    )

    const { data: user } = await supabase
      .from('users')
      .select('id')
      .eq('spotify_id', spotifyUserId)
      .single()

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const preferences = await getUserLearnedPreferences(user.id)

    return NextResponse.json({ preferences })
  } catch (err) {
    console.error('Error fetching preferences:', err)
    return NextResponse.json({ error: 'Failed to fetch preferences' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const spotifyUserId = req.cookies.get('spotify_user_id')?.value
    if (!spotifyUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SECRET_KEY!
    )

    const { data: user } = await supabase
      .from('users')
      .select('id')
      .eq('spotify_id', spotifyUserId)
      .single()

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    await resetUserPreferences(user.id)

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Error resetting preferences:', err)
    return NextResponse.json({ error: 'Failed to reset preferences' }, { status: 500 })
  }
}
