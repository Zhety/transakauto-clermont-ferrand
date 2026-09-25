import { createBrowserClient } from '@supabase/ssr'

/** Client Supabase côté navigateur (lecture/écriture avec la session de l'utilisateur connecté). */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )
}
