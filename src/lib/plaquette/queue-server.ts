import { createAdminClient } from '@/lib/supabase/admin'
import type { PlaquetteQueueState, PlaquetteRequest, PlaquetteStatus } from './queue'

/** Les 30 dernières demandes, avec un lien signé pour celles qui sont prêtes. Serveur uniquement. */
export async function listPlaquetteRequests(): Promise<PlaquetteQueueState> {
  const admin = createAdminClient()
  if (!admin) return { requests: [], workerSeenAt: null, error: 'Supabase non configuré' }

  const [{ data: rows, error }, { data: profiles }, { data: worker }] = await Promise.all([
    admin
      .from('plaquettes')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(30),
    admin.from('profiles').select('id, email, full_name'),
    admin.from('plaquette_worker').select('seen_at').eq('id', 'mac').maybeSingle(),
  ])

  if (error) {
    const missing = /relation .*plaquettes|schema cache/i.test(error.message)
    return {
      requests: [],
      workerSeenAt: null,
      error: missing
        ? 'La file d’attente n’existe pas encore : exécutez supabase/plaquettes.sql dans Supabase → SQL Editor.'
        : error.message,
    }
  }

  const names = new Map(
    (profiles ?? []).map((profile) => [
      profile.id as string,
      ((profile.full_name as string | null)?.trim() || (profile.email as string | null)) ?? '',
    ]),
  )

  const requests: PlaquetteRequest[] = await Promise.all(
    (rows ?? []).map(async (row) => {
      let downloadUrl: string | null = null
      if (row.status === 'prete' && row.pdf_path) {
        const { data } = await admin.storage
          .from('plaquettes')
          .createSignedUrl(row.pdf_path as string, 3600, { download: (row.pdf_filename as string | null) ?? undefined })
        downloadUrl = data?.signedUrl ?? null
      }
      return {
        id: row.id as string,
        created_at: row.created_at as string,
        status: row.status as PlaquetteStatus,
        url: row.url as string,
        road_fees_eur: (row.road_fees_eur as number | null | undefined) ?? null,
        ref: (row.ref as string | null) ?? null,
        title: (row.title as string | null) ?? null,
        agent: (row.agent as string | null) ?? null,
        note: (row.note as string | null) ?? null,
        error: (row.error as string | null) ?? null,
        pdf_filename: (row.pdf_filename as string | null) ?? null,
        download_url: downloadUrl,
        requested_by_name: row.requested_by ? (names.get(row.requested_by as string) || null) : null,
        started_at: (row.started_at as string | null) ?? null,
        finished_at: (row.finished_at as string | null) ?? null,
      }
    }),
  )

  return { requests, workerSeenAt: (worker?.seen_at as string | undefined) ?? null, error: null }
}
