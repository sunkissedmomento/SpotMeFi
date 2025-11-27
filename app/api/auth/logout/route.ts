import { NextResponse } from 'next/server'

export async function POST() {
  const response = NextResponse.redirect(process.env.NEXT_PUBLIC_APP_URL!)
  response.cookies.delete('spotify_user_id')
  return response
}
