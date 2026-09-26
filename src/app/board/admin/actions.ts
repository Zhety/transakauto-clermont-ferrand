'use server'

import { revalidatePath } from 'next/cache'
import type { UserRole } from '@/lib/leads-board'
import { createAdminClient } from '@/lib/supabase/admin'
import { getSessionContext } from '@/lib/supabase/session'

async function assertAdmin() {
  const { profile } = await getSessionContext()
  if (profile?.role !== 'admin') throw new Error('Accès refusé')
}

export async function createUserAction(input: {
  email: string
  password: string
  fullName: string
  role: UserRole
}): Promise<{ ok?: true; error?: string }> {
  await assertAdmin()
  const admin = createAdminClient()
  if (!admin) return { error: 'Configuration Supabase manquante côté serveur.' }

  const email = input.email.trim().toLowerCase()
  const fullName = input.fullName.trim()
  const role: UserRole = input.role === 'admin' ? 'admin' : 'commercial'

  if (!email || input.password.length < 8) {
    return { error: 'Email requis et mot de passe d’au moins 8 caractères.' }
  }

  const { data, error } = await admin.auth.admin.createUser({
    email,
    password: input.password,
    email_confirm: true,
    user_metadata: { full_name: fullName },
  })
  if (error || !data.user) return { error: error?.message ?? 'Création impossible.' }

  // Le trigger crée le profil (rôle 'commercial' par défaut) : on ajuste rôle + nom.
  await admin.from('profiles').update({ role, full_name: fullName || email }).eq('id', data.user.id)

  revalidatePath('/board/admin')
  return { ok: true }
}

export async function deleteUserAction(userId: string): Promise<{ ok?: true; error?: string }> {
  await assertAdmin()
  const admin = createAdminClient()
  if (!admin) return { error: 'Configuration Supabase manquante côté serveur.' }

  const { profile } = await getSessionContext()
  // Un admin ne peut pas se supprimer lui-même (évite de se verrouiller dehors).
  if (profile?.id === userId) return { error: 'Vous ne pouvez pas supprimer votre propre compte.' }

  const { error } = await admin.auth.admin.deleteUser(userId)
  if (error) return { error: error.message }

  revalidatePath('/board/admin')
  return { ok: true }
}
