'use client'

import { createClient } from '@/utils/supabase/client'

export default function AuthButton() {
  const supabase = createClient()

  const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        // This tells Google where to send the user after login
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
  }

  return (
    <button 
      onClick={handleLogin}
      className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition"
    >
      Login with Google
    </button>
  )
}