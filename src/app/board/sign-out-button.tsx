'use client'

import { createClient } from '@/lib/supabase/client'

export function SignOutButton() {
  async function signOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    const isLeadsHost = window.location.hostname.startsWith('leads.')
    window.location.assign(isLeadsHost ? '/login' : '/board/login')
  }

  return (
    <button
      onClick={signOut}
      className="rounded-full border border-line px-4 py-2 text-sm font-medium text-graphite transition-colors hover:border-ink hover:text-ink"
    >
      Se déconnecter
    </button>
  )
}
