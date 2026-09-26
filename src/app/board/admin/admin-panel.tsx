'use client'

import { useState, useTransition } from 'react'
import { profileName, type Profile, type UserRole } from '@/lib/leads-board'
import { createUserAction, deleteUserAction } from './actions'

export function AdminPanel({ profiles, currentId }: { profiles: Profile[]; currentId: string }) {
  const [email, setEmail] = useState('')
  const [fullName, setFullName] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<UserRole>('commercial')
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null)
  const [pending, startTransition] = useTransition()

  function onCreate(e: React.FormEvent) {
    e.preventDefault()
    setMessage(null)
    startTransition(async () => {
      const res = await createUserAction({ email, password, fullName, role })
      if (res.error) {
        setMessage({ ok: false, text: res.error })
      } else {
        setMessage({ ok: true, text: `Compte créé pour ${email}.` })
        setEmail('')
        setFullName('')
        setPassword('')
        setRole('commercial')
      }
    })
  }

  function onDelete(id: string, name: string) {
    if (!confirm(`Supprimer le compte de ${name} ? Cette action est définitive.`)) return
    startTransition(async () => {
      const res = await deleteUserAction(id)
      if (res.error) setMessage({ ok: false, text: res.error })
    })
  }

  return (
    <div className="mx-auto max-w-3xl px-5 py-8">
      {/* Création */}
      <section className="rounded-2xl border border-line bg-card p-6">
        <h2 className="text-base font-semibold">Créer un compte</h2>
        <form onSubmit={onCreate} className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="text-sm">
            Nom complet
            <input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="mt-1 w-full rounded-lg border border-line bg-paper px-3 py-2 text-sm outline-none focus:border-ink"
            />
          </label>
          <label className="text-sm">
            Email
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-lg border border-line bg-paper px-3 py-2 text-sm outline-none focus:border-ink"
            />
          </label>
          <label className="text-sm">
            Mot de passe (8 car. min.)
            <input
              type="text"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-lg border border-line bg-paper px-3 py-2 text-sm outline-none focus:border-ink"
            />
          </label>
          <label className="text-sm">
            Rôle
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
              className="mt-1 w-full rounded-lg border border-line bg-paper px-3 py-2 text-sm outline-none focus:border-ink"
            >
              <option value="commercial">Commercial</option>
              <option value="admin">Admin</option>
            </select>
          </label>
          <div className="sm:col-span-2">
            <button
              type="submit"
              disabled={pending}
              className="rounded-full bg-accent px-6 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
            >
              {pending ? 'En cours…' : 'Créer le compte'}
            </button>
          </div>
        </form>
        {message && (
          <p className={`mt-3 text-sm ${message.ok ? 'text-green-600' : 'text-red-600'}`}>{message.text}</p>
        )}
      </section>

      {/* Liste */}
      <section className="mt-6 rounded-2xl border border-line bg-card p-6">
        <h2 className="text-base font-semibold">Comptes ({profiles.length})</h2>
        <ul className="mt-4 divide-y divide-line">
          {profiles.map((p) => (
            <li key={p.id} className="flex items-center justify-between gap-4 py-3">
              <div>
                <p className="text-sm font-medium">
                  {profileName(p)}
                  {p.id === currentId && <span className="ml-2 text-xs text-muted">(vous)</span>}
                </p>
                <p className="text-xs text-muted">
                  {p.email} · {p.role === 'admin' ? 'Admin' : 'Commercial'}
                </p>
              </div>
              {p.id !== currentId && (
                <button
                  onClick={() => onDelete(p.id, profileName(p))}
                  disabled={pending}
                  className="rounded-full border border-line px-3 py-1.5 text-sm text-red-600 hover:border-red-300 disabled:opacity-60"
                >
                  Supprimer
                </button>
              )}
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
