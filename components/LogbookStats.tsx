'use client'

import { LogbookEntry } from '@/lib/types'

function parseMinutes(t: string | null): number {
  if (!t) return 0
  const [h, m] = t.substring(0, 5).split(':').map(Number)
  return (h || 0) * 60 + (m || 0)
}

function fmtHours(mins: number): string {
  const h = Math.floor(mins / 60)
  const m = mins % 60
  return `${h}:${String(m).padStart(2, '0')}`
}

function sumBlock(entries: LogbookEntry[]): string {
  return fmtHours(entries.reduce((acc, e) => acc + parseMinutes(e.total_time), 0))
}

function daysAgo(n: number): Date {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d
}

export function LogbookStats({ entries }: { entries: LogbookEntry[] }) {
  const d30 = daysAgo(30)
  const d90 = daysAgo(90)

  const all  = sumBlock(entries)
  const p30  = sumBlock(entries.filter(e => new Date(e.date) >= d30))
  const p90  = sumBlock(entries.filter(e => new Date(e.date) >= d90))

  return (
    <div className="flex gap-2 sm:gap-4">
      <Stat label="30 days"  value={p30} />
      <Stat label="90 days"  value={p90} />
      <Stat label="All time" value={all} highlight />
    </div>
  )
}

function Stat({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={`text-right px-3 py-2 rounded-lg border ${
      highlight ? 'border-blue-500/30 bg-blue-500/10' : 'border-slate-800 bg-slate-900/50'
    }`}>
      <p className="text-xs text-slate-500 whitespace-nowrap">{label}</p>
      <p className={`font-mono font-bold text-base sm:text-lg ${highlight ? 'text-blue-300' : 'text-slate-200'}`}>
        {value}
      </p>
    </div>
  )
}
