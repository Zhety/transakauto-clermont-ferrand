import type { Profile } from '@/lib/leads-board'
import { createClient } from './server'

/** Utilisateur connecté + son profil (rôle). `profile` est null si non connecté. */
export async function getSessionContext(): Promise<{
  userId: string | null
  email: string | null
  profile: Profile | null
}> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { userId: null, email: null, profile: null }

  const { data } = await supabase
    .from('profiles')
    .select('id, email, full_name, role')
    .eq('id', user.id)
    .single()

  return { userId: user.id, email: user.email ?? null, profile: (data as Profile) ?? null }
}
