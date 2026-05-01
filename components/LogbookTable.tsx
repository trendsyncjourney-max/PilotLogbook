'use client'

import { LogbookEntry } from '@/lib/types'
import { formatTime } from '@/lib/utils'
import { format } from 'date-fns'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Download, Pencil } from 'lucide-react'
import Link from 'next/link'

function exportCSV(entries: LogbookEntry[]) {
  const headers = [
    'Date', 'Flight No', 'Aircraft', 'Type', 'From', 'To',
    'Captain (CN)', 'First Officer (FO)', 'Pilot Flying', 'Pilot Monitoring', 'Takeoff PF', 'Landing PF', 'Remarks',
    'Off Block', 'Takeoff', 'Landing', 'On Block', 'Total Time',
  ]
  const rows = entries.map(e => [
    e.date,
    e.flight_number ?? '',
    e.aircraft_callsign,
    e.aircraft_type ?? '',
    e.departure_airport,
    e.arrival_airport,
    e.captain ?? '',
    e.first_officer ?? '',
    e.pilot_flying,
    e.pilot_monitoring,
    e.takeoff_pilot ?? '',
    e.landing_pilot ?? '',
    e.remarks ?? '',
    formatTime(e.off_block_time),
    formatTime(e.takeoff_time),
    formatTime(e.landing_time),
    formatTime(e.on_block_time),
    e.total_time ? e.total_time.substring(0, 5) : '',
  ])
  const csv = [headers, ...rows].map(r => r.map(v => `"${v}"`).join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'pilot-logbook.csv'
  a.click()
  URL.revokeObjectURL(url)
}

export function LogbookTable({ entries }: { entries: LogbookEntry[] }) {
  if (entries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center space-y-3">
        <div className="text-4xl">✈️</div>
        <p className="text-slate-300 font-medium">No flights logged yet</p>
        <p className="text-slate-500 text-sm">Click <strong className="text-slate-400">New Entry</strong> to add your first flight</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button
          size="sm"
          variant="outline"
          onClick={() => exportCSV(entries)}
          className="border-slate-700 text-slate-300 hover:bg-slate-800 gap-1.5"
        >
          <Download className="h-4 w-4" />
          Export CSV
        </Button>
      </div>

      <div className="rounded-xl border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-900 border-b border-slate-800">
                <th className="text-left px-4 py-3 text-slate-400 font-medium whitespace-nowrap">Date</th>
                <th className="text-left px-4 py-3 text-slate-400 font-medium whitespace-nowrap">Flight No</th>
                <th className="text-left px-4 py-3 text-slate-400 font-medium whitespace-nowrap">Aircraft</th>
                <th className="text-left px-4 py-3 text-slate-400 font-medium whitespace-nowrap">Route</th>
                <th className="text-left px-4 py-3 text-slate-400 font-medium whitespace-nowrap">CN</th>
                <th className="text-left px-4 py-3 text-slate-400 font-medium whitespace-nowrap">FO</th>
                <th className="text-left px-4 py-3 text-slate-400 font-medium whitespace-nowrap">PF</th>
                <th className="text-left px-4 py-3 text-slate-400 font-medium whitespace-nowrap">T/O PF</th>
                <th className="text-left px-4 py-3 text-slate-400 font-medium whitespace-nowrap">LDG PF</th>
                <th className="text-left px-4 py-3 text-slate-400 font-medium whitespace-nowrap">Remarks</th>
                <th className="text-left px-4 py-3 text-slate-400 font-medium whitespace-nowrap">Out</th>
                <th className="text-left px-4 py-3 text-slate-400 font-medium whitespace-nowrap">Off</th>
                <th className="text-left px-4 py-3 text-slate-400 font-medium whitespace-nowrap">On</th>
                <th className="text-left px-4 py-3 text-slate-400 font-medium whitespace-nowrap">In</th>
                <th className="text-left px-4 py-3 text-slate-400 font-medium whitespace-nowrap">Block</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry, i) => (
                <tr
                  key={entry.id}
                  className={`border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors ${
                    i % 2 === 0 ? 'bg-slate-900/30' : 'bg-slate-900/10'
                  }`}
                >
                  <td className="px-4 py-3 text-slate-300 whitespace-nowrap">
                    {format(new Date(entry.date), 'dd MMM yy')}
                  </td>
                  <td className="px-4 py-3 text-slate-300 font-mono whitespace-nowrap">
                    {entry.flight_number ?? '—'}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex flex-col gap-0.5">
                      <Badge variant="outline" className="border-blue-700 text-blue-300 font-mono w-fit">
                        {entry.aircraft_callsign}
                      </Badge>
                      {entry.aircraft_type && (
                        <span className="text-xs text-slate-500">{entry.aircraft_type}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-white font-mono font-medium whitespace-nowrap">
                    {entry.departure_airport} → {entry.arrival_airport}
                  </td>
                  <td className="px-4 py-3 text-slate-300 whitespace-nowrap text-xs">{entry.captain ?? '—'}</td>
                  <td className="px-4 py-3 text-slate-300 whitespace-nowrap text-xs">{entry.first_officer ?? '—'}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <Badge className="bg-blue-600/20 text-blue-400 border-blue-600/30 text-xs font-normal">
                      {entry.pilot_flying}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-slate-300 whitespace-nowrap text-xs">{entry.takeoff_pilot ?? '—'}</td>
                  <td className="px-4 py-3 text-slate-300 whitespace-nowrap text-xs">{entry.landing_pilot ?? '—'}</td>
                  <td className="px-4 py-3 text-slate-400 text-xs max-w-32 truncate">{entry.remarks ?? ''}</td>
                  <td className="px-4 py-3 text-slate-300 font-mono">{formatTime(entry.off_block_time)}</td>
                  <td className="px-4 py-3 text-slate-300 font-mono">{formatTime(entry.takeoff_time)}</td>
                  <td className="px-4 py-3 text-slate-300 font-mono">{formatTime(entry.landing_time)}</td>
                  <td className="px-4 py-3 text-slate-300 font-mono">{formatTime(entry.on_block_time)}</td>
                  <td className="px-4 py-3 font-mono font-bold text-blue-300 whitespace-nowrap text-base">
                    {entry.total_time ? entry.total_time.substring(0, 5) : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/logbook/${entry.id}/edit`}>
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
