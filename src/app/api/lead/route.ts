import { appendFile } from 'node:fs/promises'
import path from 'node:path'
import { NextResponse } from 'next/server'
import { leadSchema, type LeadInput } from '@/lib/lead'
import { sendLeadEmails } from '@/lib/mail'
import { createAdminClient } from '@/lib/supabase/admin'

export const runtime = 'nodejs'

/**
 * Enregistre le lead en base pour qu'il apparaisse sur le tableau (Kanban), en
 * plus de l'email. Ne lève jamais : un échec base ne doit pas perdre un lead.
 */
async function saveToDb(lead: LeadInput): Promise<{ saved: boolean; error?: string }> {
  const admin = createAdminClient()
  if (!admin) return { saved: false, error: 'supabase-not-configured' }
  const { error } = await admin.from('leads').insert({ status: 'a_traiter', data: lead })
  if (error) {
    console.error('[lead] enregistrement base échoué', error.message)
    return { saved: false, error: error.message }
  }
  return { saved: true }
}

/**
 * Filet de sécurité : chaque demande est aussi écrite sur disque, pour qu'un
 * SMTP en panne ne fasse jamais perdre un lead. En lecture seule sur Vercel,
 * l'écriture échoue silencieusement — l'email reste le canal principal.
 */
async function archive(payload: unknown, meta: Record<string, unknown>) {
  try {
    const line = JSON.stringify({ at: new Date().toISOString(), ...meta, payload }) + '\n'
    await appendFile(path.join(process.cwd(), '.leads.jsonl'), line, 'utf8')
  } catch {
    /* système de fichiers non inscriptible : on ignore */
  }
}

export async function POST(request: Request) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ ok: false, errors: ['Requête invalide'] }, { status: 400 })
  }

  const parsed = leadSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, errors: parsed.error.issues.map((issue) => issue.message) },
      { status: 422 },
    )
  }

  const lead = parsed.data

  // Robot : on répond « ok » pour ne pas lui indiquer ce qui l'a démasqué.
  if (lead.website) {
    return NextResponse.json({ ok: true })
  }

  const [{ sent, error }, { saved }] = await Promise.all([sendLeadEmails(lead), saveToDb(lead)])
  await archive(lead, { emailSent: sent, emailError: error, dbSaved: saved })

  return NextResponse.json({ ok: true })
}
