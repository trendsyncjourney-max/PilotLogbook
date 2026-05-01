'use client'

import { useEffect, useRef, useState } from 'react'
import { LogbookEntry } from '@/lib/types'
import { formatTime } from '@/lib/utils'
import { APP_VERSION } from '@/lib/version'
import { format } from 'date-fns'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Download, Pencil, Columns3, Check } from 'lucide-react'
import Link from 'next/link'

// ── Column definitions ────────────────────────────────────────────────────────

const COLUMNS = [
  { key: 'flight_number',  label: 'Flight No',          default: true  },
  { key: 'aircraft',       label: 'Aircraft',            default: true  },
  { key: 'route',          label: 'Route',               default: true  },
  { key: 'captain',        label: 'Captain (CN)',         default: true  },
  { key: 'first_officer',  label: 'First Officer (FO)',   default: true  },
  { key: 'pilot_flying',   label: 'Pilot Flying (PF)',    default: true  },
  { key: 'takeoff_pilot',  label: 'Takeoff PF',          default: true  },
  { key: 'landing_pilot',  label: 'Landing PF',          default: true  },
  { key: 'remarks',        label: 'Remarks',             default: true  },
  { key: 'out',            label: 'Out (Off Block)',      default: true  },
  { key: 'off',            label: 'Off (Takeoff)',        default: true  },
  { key: 'on',             label: 'On (Landing)',         default: true  },
  { key: 'in',             label: 'In (On Block)',        default: true  },
  { key: 'block',          label: 'Block Time',          default: true  },
] as const

type ColKey = typeof COLUMNS[number]['key']

const STORAGE_KEY = 'pilot-logbook-columns'

function loadVisible(): Set<ColKey> {
  if (typeof window === 'undefined') return new Set(COLUMNS.map(c => c.key))
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return new Set(JSON.parse(raw) as ColKey[])
  } catch {}
  return new Set(COLUMNS.filter(c => c.default).map(c => c.key))
}

function saveVisible(cols: Set<ColKey>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...cols]))
}

// ── Export helpers ────────────────────────────────────────────────────────────

function exportCSV(entries: LogbookEntry[]) {
  const headers = [
    'Date','Flight No','Aircraft','Type','From','To',
    'Captain (CN)','First Officer (FO)','Pilot Flying','Pilot Monitoring',
    'Takeoff PF','Landing PF','Remarks',
    'Off Block','Takeoff','Landing','On Block','Total Time',
  ]
  const rows = entries.map(e => [
    e.date, e.flight_number ?? '', e.aircraft_callsign, e.aircraft_type ?? '',
    e.departure_airport, e.arrival_airport,
    e.captain ?? '', e.first_officer ?? '', e.pilot_flying, e.pilot_monitoring,
    e.takeoff_pilot ?? '', e.landing_pilot ?? '', e.remarks ?? '',
    formatTime(e.off_block_time), formatTime(e.takeoff_time),
    formatTime(e.landing_time), formatTime(e.on_block_time),
    e.total_time ? e.total_time.substring(0, 5) : '',
  ])
  download(
    [headers, ...rows].map(r => r.map(v => `"${v}"`).join(',')).join('\n'),
    'text/csv',
    'pilot-logbook.csv',
  )
}

function exportBackup(entries: LogbookEntry[]) {
  const payload = {
    app: 'Pilot AI Logbook',
    version: APP_VERSION,
    exported_at: new Date().toISOString(),
    total_entries: entries.length,
    entries,
  }
  download(
    JSON.stringify(payload, null, 2),
    'application/json',
    `pilot-logbook-backup-${new Date().toISOString().split('T')[0]}.json`,
  )
}

function download(content: string, type: string, filename: string) {
  const url = URL.createObjectURL(new Blob([content], { type }))
  const a = Object.assign(document.createElement('a'), { href: url, download: filename })
  a.click()
  URL.revokeObjectURL(url)
}

// ── Component ─────────────────────────────────────────────────────────────────

export function LogbookTable({ entries }: { entries: LogbookEntry[] }) {
  // Start with all columns to match SSR, then apply localStorage preference after mount
  const [visible, setVisible] = useState<Set<ColKey>>(() => new Set(COLUMNS.map(c => c.key)))
  const [pickerOpen, setPickerOpen] = useState(false)
  const pickerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setVisible(loadVisible())
  }, [])

  // Close picker on outside click
  useEffect(() => {
    if (!pickerOpen) return
    function onDown(e: MouseEvent) {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setPickerOpen(false)
      }
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [pickerOpen])

  function toggleCol(key: ColKey) {
    setVisible(prev => {
      const next = new Set(prev)
      next.has(key) ? next.delete(key) : next.add(key)
      saveVisible(next)
      return next
    })
  }

  const show = (key: ColKey) => visible.has(key)

  if (entries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center space-y-3">
        <div className="text-4xl">✈️</div>
        <p className="text-slate-300 font-medium">No flights logged yet</p>
        <p className="text-slate-500 text-sm">
          Click <strong className="text-slate-400">New Entry</strong> to add your first flight
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">

      {/* Toolbar */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <p className="text-xs text-slate-500">
          {visible.size} of {COLUMNS.length} columns visible
        </p>
        <div className="flex items-center gap-2">

          {/* Column picker */}
          <div className="relative" ref={pickerRef}>
            <Button
              size="sm"
              variant="outline"
              className="border-slate-700 text-slate-300 hover:bg-slate-800 gap-1.5"
              onClick={() => setPickerOpen(o => !o)}
            >
              <Columns3 className="h-4 w-4" />
              Columns
            </Button>

            {pickerOpen && (
              <div className="absolute right-0 top-9 z-20 w-56 rounded-xl border border-slate-700 bg-slate-900 shadow-xl shadow-black/40 flex flex-col" style={{ maxHeight: 'min(400px, 70vh)' }}>
                <p className="px-3 pt-2 pb-1 text-xs font-semibold text-slate-500 uppercase tracking-wider shrink-0">
                  Show / Hide Columns
                </p>
                <div className="overflow-y-auto flex-1 min-h-0">
                  {COLUMNS.map(col => (
                    <button
                      key={col.key}
                      onClick={() => toggleCol(col.key)}
                      className="w-full flex items-center justify-between px-3 py-2 text-sm hover:bg-slate-800 transition-colors"
                    >
                      <span className={visible.has(col.key) ? 'text-white' : 'text-slate-500'}>
                        {col.label}
                      </span>
                      {visible.has(col.key) && (
                        <Check className="h-3.5 w-3.5 text-blue-400 shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
                <div className="border-t border-slate-800 px-3 py-2 flex gap-2 shrink-0">
                  <button
                    onClick={() => { const all = new Set(COLUMNS.map(c => c.key)); setVisible(all); saveVisible(all) }}
                    className="text-xs text-blue-400 hover:text-blue-300"
                  >
                    Show all
                  </button>
                  <span className="text-slate-700">·</span>
                  <button
                    onClick={() => { const none = new Set<ColKey>(); setVisible(none); saveVisible(none) }}
                    className="text-xs text-slate-500 hover:text-slate-400"
                  >
                    Hide all
                  </button>
                </div>
              </div>
            )}
          </div>

          <Button
            size="sm"
            variant="outline"
            onClick={() => exportCSV(entries)}
            className="border-slate-700 text-slate-300 hover:bg-slate-800 gap-1.5"
          >
            <Download className="h-4 w-4" />
            CSV
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={() => exportBackup(entries)}
            className="border-slate-700 text-slate-300 hover:bg-slate-800 gap-1.5"
          >
            <Download className="h-4 w-4" />
            Backup
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-900 border-b border-slate-800">
                {/* Date always visible */}
                <Th>Date</Th>
                {show('flight_number')  && <Th>Flight No</Th>}
                {show('aircraft')       && <Th>Aircraft</Th>}
                {show('route')          && <Th>Route</Th>}
                {show('captain')        && <Th>CN</Th>}
                {show('first_officer')  && <Th>FO</Th>}
                {show('pilot_flying')   && <Th>PF</Th>}
                {show('takeoff_pilot')  && <Th>T/O PF</Th>}
                {show('landing_pilot')  && <Th>LDG PF</Th>}
                {show('remarks')        && <Th>Remarks</Th>}
                {show('out')            && <Th>Out</Th>}
                {show('off')            && <Th>Off</Th>}
                {show('on')             && <Th>On</Th>}
                {show('in')             && <Th>In</Th>}
                {show('block')          && <Th>Block</Th>}
                {/* Edit always visible */}
                <th className="px-3 py-3" />
              </tr>
            </thead>
            <tbody>
              {entries.map((e, i) => (
                <tr
                  key={e.id}
                  className={`border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors ${
                    i % 2 === 0 ? 'bg-slate-900/30' : 'bg-slate-900/10'
                  }`}
                >
                  <td className="px-4 py-3 text-slate-300 whitespace-nowrap">
                    {format(new Date(e.date), 'dd MMM yy')}
                  </td>
                  {show('flight_number') && (
                    <td className="px-4 py-3 text-slate-300 font-mono whitespace-nowrap">
                      {e.flight_number ?? '—'}
                    </td>
                  )}
                  {show('aircraft') && (
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex flex-col gap-0.5">
                        <Badge variant="outline" className="border-blue-700 text-blue-300 font-mono w-fit">
                          {e.aircraft_callsign}
                        </Badge>
                        {e.aircraft_type && (
                          <span className="text-xs text-slate-500">{e.aircraft_type}</span>
                        )}
                      </div>
                    </td>
                  )}
                  {show('route') && (
                    <td className="px-4 py-3 text-white font-mono font-medium whitespace-nowrap">
                      {e.departure_airport} → {e.arrival_airport}
                    </td>
                  )}
                  {show('captain')       && <td className="px-4 py-3 text-slate-300 whitespace-nowrap text-xs">{e.captain ?? '—'}</td>}
                  {show('first_officer') && <td className="px-4 py-3 text-slate-300 whitespace-nowrap text-xs">{e.first_officer ?? '—'}</td>}
                  {show('pilot_flying') && (
                    <td className="px-4 py-3 whitespace-nowrap">
                      <Badge className="bg-blue-600/20 text-blue-400 border-blue-600/30 text-xs font-normal">
                        {e.pilot_flying}
                      </Badge>
                    </td>
                  )}
                  {show('takeoff_pilot') && <td className="px-4 py-3 text-slate-300 whitespace-nowrap text-xs">{e.takeoff_pilot ?? '—'}</td>}
                  {show('landing_pilot') && <td className="px-4 py-3 text-slate-300 whitespace-nowrap text-xs">{e.landing_pilot ?? '—'}</td>}
                  {show('remarks')       && <td className="px-4 py-3 text-slate-400 text-xs max-w-32 truncate">{e.remarks ?? ''}</td>}
                  {show('out')           && <td className="px-4 py-3 text-slate-300 font-mono">{formatTime(e.off_block_time)}</td>}
                  {show('off')           && <td className="px-4 py-3 text-slate-300 font-mono">{formatTime(e.takeoff_time)}</td>}
                  {show('on')            && <td className="px-4 py-3 text-slate-300 font-mono">{formatTime(e.landing_time)}</td>}
                  {show('in')            && <td className="px-4 py-3 text-slate-300 font-mono">{formatTime(e.on_block_time)}</td>}
                  {show('block') && (
                    <td className="px-4 py-3 font-mono font-bold text-blue-300 whitespace-nowrap text-base">
                      {e.total_time ? e.total_time.substring(0, 5) : '—'}
                    </td>
                  )}
                  <td className="px-3 py-3">
                    <Link href={`/logbook/${e.id}/edit`}>
                      <button className="p-1.5 rounded text-slate-500 hover:text-white hover:bg-slate-700 transition-colors">
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="text-left px-4 py-3 text-slate-400 font-medium whitespace-nowrap">
      {children}
    </th>
  )
}
