'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  DndContext,
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import { INTENT_LABELS, leadRows } from '@/lib/lead'
import { LEAD_STATUSES, isLeadStatus, type LeadRecord, type LeadStatus } from '@/lib/leads-board'
import { createClient } from '@/lib/supabase/client'

export function KanbanBoard({ initialLeads }: { initialLeads: LeadRecord[] }) {
  const [leads, setLeads] = useState<LeadRecord[]>(initialLeads)
  const [openId, setOpenId] = useState<string | null>(null)
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }))

  // Temps réel : nouveaux leads et changements de statut apparaissent en direct.
  useEffect(() => {
    const supabase = createClient()
    const channel = supabase
      .channel('leads-board')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'leads' }, (payload) => {
        const row = payload.new as LeadRecord
        setLeads((prev) => (prev.some((l) => l.id === row.id) ? prev : [row, ...prev]))
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'leads' }, (payload) => {
        const row = payload.new as LeadRecord
        setLeads((prev) => prev.map((l) => (l.id === row.id ? row : l)))
      })
      .subscribe()
    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  async function onDragEnd(event: DragEndEvent) {
    const id = String(event.active.id)
    const target = event.over?.id
    if (!target || !isLeadStatus(target)) return
    const lead = leads.find((l) => l.id === id)
    if (!lead || lead.status === target) return

    const previous = lead.status
    setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, status: target } : l)))

    const supabase = createClient()
    const { error } = await supabase.from('leads').update({ status: target }).eq('id', id)
    if (error) {
      setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, status: previous } : l)))
    }
  }

  const openLead = openId ? leads.find((l) => l.id === openId) ?? null : null

  return (
    <DndContext sensors={sensors} onDragEnd={onDragEnd}>
      <div className="flex gap-4 overflow-x-auto p-5">
        {LEAD_STATUSES.map((col) => (
          <Column
            key={col.key}
            status={col.key}
            label={col.label}
            leads={leads.filter((l) => l.status === col.key)}
            onOpen={setOpenId}
          />
        ))}
      </div>
      {openLead && <DetailModal lead={openLead} onClose={() => setOpenId(null)} />}
    </DndContext>
  )
}

function Column({
  status,
  label,
  leads,
  onOpen,
}: {
  status: LeadStatus
  label: string
  leads: LeadRecord[]
  onOpen: (id: string) => void
}) {
  const { setNodeRef, isOver } = useDroppable({ id: status })
  return (
    <div className="flex w-80 shrink-0 flex-col">
      <div className="flex items-center justify-between px-1 pb-2.5">
        <h2 className="text-sm font-semibold">{label}</h2>
        <span className="rounded-full bg-card px-2 py-0.5 text-xs font-medium text-muted">{leads.length}</span>
      </div>
      <div
        ref={setNodeRef}
        className={`flex min-h-[60vh] flex-col gap-2 rounded-2xl border p-2.5 transition-colors ${
          isOver ? 'border-accent bg-accent-soft/40' : 'border-line bg-card/40'
        }`}
      >
        {leads.length === 0 && <p className="px-1 py-6 text-center text-xs text-muted">Aucun lead</p>}
        {leads.map((lead) => (
          <LeadCard key={lead.id} lead={lead} onOpen={onOpen} />
        ))}
      </div>
    </div>
  )
}

function LeadCard({ lead, onOpen }: { lead: LeadRecord; onOpen: (id: string) => void }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: lead.id })
  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.4 : 1,
  }
  const d = lead.data

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      onClick={() => onOpen(lead.id)}
      className="cursor-grab touch-none rounded-xl border border-line bg-card p-3 shadow-sm active:cursor-grabbing"
    >
      <div className="flex items-center justify-between gap-2">
        <p className="truncate text-sm font-semibold">
          {d.make} {d.model}
        </p>
        <span className="shrink-0 rounded-full bg-accent-soft px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-accent-ink">
          {d.intent === 'reprise' ? 'Reprise' : 'Estim.'}
        </span>
      </div>
      <a
        href={`tel:${d.phone.replace(/\s/g, '')}`}
        onClick={(e) => e.stopPropagation()}
        onPointerDown={(e) => e.stopPropagation()}
        className="mt-1 inline-block text-sm text-graphite hover:text-accent"
      >
        {d.phone}
      </a>
    </div>
  )
}

function DetailModal({ lead, onClose }: { lead: LeadRecord; onClose: () => void }) {
  const rows = useMemo(() => leadRows(lead.data), [lead])
  const date = useMemo(
    () => new Date(lead.created_at).toLocaleString('fr-FR', { dateStyle: 'medium', timeStyle: 'short' }),
    [lead.created_at],
  )

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="max-h-[85vh] w-full max-w-md overflow-y-auto rounded-2xl border border-line bg-card p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold">
              {lead.data.make} {lead.data.model}
            </h3>
            <p className="text-xs text-muted">
              {INTENT_LABELS[lead.data.intent]} · reçu le {date}
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full border border-line px-3 py-1 text-sm text-muted hover:text-ink"
          >
            Fermer
          </button>
        </div>

        <div className="mt-5 flex gap-2">
          <a
            href={`tel:${lead.data.phone.replace(/\s/g, '')}`}
            className="flex-1 rounded-full bg-ink px-4 py-2 text-center text-sm font-semibold text-white"
          >
            Appeler
          </a>
          <a
            href={`mailto:${lead.data.email}`}
            className="flex-1 rounded-full border border-line px-4 py-2 text-center text-sm font-semibold text-ink"
          >
            Email
          </a>
        </div>

        <dl className="mt-5 divide-y divide-line text-sm">
          {rows.map(([key, value]) => (
            <div key={key} className="flex gap-4 py-2">
              <dt className="w-40 shrink-0 text-muted">{key}</dt>
              <dd className="font-medium">{value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  )
}
