import type { LeadInput } from './lead'

/** Les 4 colonnes du tableau, dans l'ordre d'affichage. */
export const LEAD_STATUSES = [
  { key: 'a_traiter', label: 'À traiter' },
  { key: 'ne_repond_pas', label: 'Ne répond pas' },
  { key: 'non_rdv', label: 'Non RDV' },
  { key: 'oui_rdv', label: 'Oui RDV' },
] as const

export type LeadStatus = (typeof LEAD_STATUSES)[number]['key']

export const LEAD_STATUS_KEYS = LEAD_STATUSES.map((s) => s.key) as LeadStatus[]

export function isLeadStatus(value: unknown): value is LeadStatus {
  return typeof value === 'string' && (LEAD_STATUS_KEYS as string[]).includes(value)
}

/** Une ligne de la table `leads` telle que renvoyée par Supabase. */
export interface LeadRecord {
  id: string
  created_at: string
  status: LeadStatus
  assigned_to: string | null
  data: LeadInput
}

export type UserRole = 'admin' | 'commercial'

/** Un commercial / utilisateur du tableau. */
export interface Profile {
  id: string
  email: string | null
  full_name: string | null
  role: UserRole
}

/** Nom lisible d'un commercial (nom complet sinon email). */
export function profileName(p: Profile | undefined | null): string {
  if (!p) return '—'
  return p.full_name?.trim() || p.email || '—'
}

/** Initiales pour le badge de la carte. */
export function profileInitials(p: Profile | undefined | null): string {
  const name = profileName(p)
  if (name === '—') return '?'
  const parts = name.split(/[\s@.]+/).filter(Boolean)
  return (parts[0]?.[0] ?? '').concat(parts[1]?.[0] ?? '').toUpperCase() || name[0].toUpperCase()
}
