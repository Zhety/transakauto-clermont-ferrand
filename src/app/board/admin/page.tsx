import Link from 'next/link'
import { redirect } from 'next/navigation'
import type { Profile } from '@/lib/leads-board'
import { createClient } from '@/lib/supabase/server'
import { getSessionContext } from '@/lib/supabase/session'
import { AdminPanel } from './admin-panel'

export const dynamic = 'force-dynamic'

export default async function AdminPage() {
  const { profile } = await getSessionContext()
  if (!profile) redirect('/board/login')
  if (profile.role !== 'admin') redirect('/board')

  const supabase = await createClient()
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, email, full_name, role')
    .order('created_at', { ascending: true })

  return (
    <>
      <header className="sticky top-0 z-20 flex items-center justify-between gap-4 border-b border-line bg-paper/90 px-5 py-4 backdrop-blur">
        <div>
          <h1 className="text-lg font-semibold tracking-tight">Comptes</h1>
          <p className="text-xs text-muted">Gestion des accès</p>
        </div>
        <Link
          href="/board"
          className="rounded-full border border-line px-4 py-2 text-sm font-medium text-graphite hover:border-ink hover:text-ink"
        >
          ← Tableau
        </Link>
      </header>
      <AdminPanel profiles={(profiles ?? []) as Profile[]} currentId={profile.id} />
    </>
  )
}
