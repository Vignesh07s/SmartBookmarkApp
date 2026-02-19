// app/auth/signout/route.ts
import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    await supabase.auth.signOut()
  }

  // Get the URL of your site (localhost or production)
  const url = new URL(request.url)
  
  // Redirect back to the homepage of YOUR app
  return NextResponse.redirect(new URL('/', url.origin), {
    status: 302,
  })
}