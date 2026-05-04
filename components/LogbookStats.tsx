'use client'

import { LogbookEntry } from '@/lib/types'
import { Clock, Calendar, TrendingUp } from 'lucide-react'

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

  const all = sumBlock(entries)
  const p30 = sumBlock(entries.filter(e => new Date(e.date) >= d30))
  const p90 = sumBlock(entries.filter(e => new Date(e.date) >= d90))

  return (
    <div className="grid grid-cols-3 gap-3">
      <StatCard label="Last 30 days" value={p30} icon={Calendar} />
      <StatCard label="Last 90 days" value={p90} icon={Clock} />
      <StatCard label="All time"     value={all} icon={TrendingUp} highlight />
    </div>
  )
}

function StatCard({
  label, value, icon: Icon, highlight,
}: {
  label: string; value: string; icon: React.ElementType; highlight?: boolean
}) {
  return (
    <div className={`rounded-xl border p-3 sm:p-4 flex flex-col gap-2 ${
      highlight
        ? 'border-blue-500/30 bg-gradient-to-br from-blue-600/10 to-blue-900/10'
        : 'border-slate-800 bg-slate-900/50'
    }`}>
      <div className="flex items-center justify-between">
        <p className="text-xs text-slate-500 font-medium">{label}</p>
        <Icon className={`h-3.5 w-3.5 shrink-0 ${highlight ? 'text-blue-500' : 'text-slate-600'}`} />
      </div>
      <p className={`font-mono font-bold text-lg sm:text-2xl leading-none ${
        highlight ? 'text-blue-300' : 'text-slate-200'
      }`}>
        {value}
        <span className={`text-xs font-sans font-normal ml-1 ${highlight ? 'text-blue-500' : 'text-slate-600'}`}>hrs</span>
      </p>
    </div>
  )
}
