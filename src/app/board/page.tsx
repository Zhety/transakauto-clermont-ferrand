import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { LeadRecord } from '@/lib/leads-board'
import { KanbanBoard } from './kanban'
import { SignOutButton } from './sign-out-button'

export const dynamic = 'force-dynamic'

export default async function BoardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/board/login')

  const { data: leads } = await supabase
    .from('leads')
    .select('id, created_at, status, data')
    .order('created_at', { ascending: false })

  return (
    <>
      <header className="sticky top-0 z-20 flex items-center justify-between gap-4 border-b border-line bg-paper/90 px-5 py-4 backdrop-blur">
        <div>
          <h1 className="text-lg font-semibold tracking-tight">Tableau des leads</h1>
          <p className="text-xs text-muted">{user.email}</p>
        </div>
        <SignOutButton />
      </header>
      <KanbanBoard initialLeads={(leads ?? []) as LeadRecord[]} />
    </>
  )
}
