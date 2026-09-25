import { createClient } from '@supabase/supabase-js'

/**
 * Client Supabase avec la clé service_role : contourne la RLS pour permettre au
 * serveur (route /api/lead) d'insérer un lead. À n'utiliser QUE côté serveur.
 * Renvoie null si la clé n'est pas configurée, pour ne jamais bloquer un lead.
 */
export function createAdminClient() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!key || !url) return null

  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}
