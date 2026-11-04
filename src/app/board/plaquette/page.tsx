import { redirect } from 'next/navigation'
import { PlaquetteForm } from '@/components/board/plaquette-form'
import { profileName } from '@/lib/leads-board'
import { listPlaquetteRequests } from '@/lib/plaquette/queue-server'
import { getSessionContext } from '@/lib/supabase/session'

export const dynamic = 'force-dynamic'

export default async function BoardPlaquettePage() {
  const { profile } = await getSessionContext()
  if (!profile) redirect('/board/login')

  const queue = await listPlaquetteRequests()

  return (
    <PlaquetteForm
      userName={profileName(profile)}
      initialQueue={queue}
      mytransakConfigured={Boolean(process.env.MYTRANSAK_EMAIL && process.env.MYTRANSAK_PASSWORD)}
    />
  )
}
