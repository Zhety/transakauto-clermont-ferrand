import Link from 'next/link'
import { redirect } from 'next/navigation'
import type { LeadRecord, Profile } from '@/lib/leads-board'
import { createClient } from '@/lib/supabase/server'
import { getSessionContext } from '@/lib/supabase/session'
import { KanbanBoard } from './kanban'
import { SignOutButton } from './sign-out-button'

export const dynamic = 'force-dynamic'

export default async function BoardPage() {
  const { profile, email } = await getSessionContext()
  if (!profile) redirect('/board/login')

  const supabase = await createClient()
  const [{ data: leads }, { data: profiles }] = await Promise.all([
    supabase.from('leads').select('id, created_at, status, assigned_to, data').order('created_at', { ascending: false }),
    supabase.from('profiles').select('id, email, full_name, role').order('full_name', { ascending: true }),
  ])

  return (
    <>
      <header className="sticky top-0 z-20 flex items-center justify-between gap-4 border-b border-line bg-paper/90 px-5 py-4 backdrop-blur">
        <div>
          <h1 className="text-lg font-semibold tracking-tight">Tableau des leads</h1>
          <p className="text-xs text-muted">{email}</p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/board/plaquette"
            className="rounded-full border border-line px-4 py-2 text-sm font-medium text-graphite hover:border-ink hover:text-ink"
          >
            Plaquette PDF
          </Link>
          {profile.role === 'admin' && (
            <Link
              href="/board/admin"
              className="rounded-full border border-line px-4 py-2 text-sm font-medium text-graphite hover:border-ink hover:text-ink"
            >
              Comptes
            </Link>
          )}
          <SignOutButton />
        </div>
      </header>
      <KanbanBoard initialLeads={(leads ?? []) as LeadRecord[]} commerciaux={(profiles ?? []) as Profile[]} />
    </>
  )
}
