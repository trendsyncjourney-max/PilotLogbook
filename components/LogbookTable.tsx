'use client'

import { LogbookEntry } from '@/lib/types'
import { formatTime } from '@/lib/utils'
import { format } from 'date-fns'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Download } from 'lucide-react'

function exportCSV(entries: LogbookEntry[]) {
  const headers = [
    'Date', 'Aircraft', 'From', 'To',
    'Pilot Flying', 'Pilot Monitoring',
    'Off Block', 'Takeoff', 'Landing', 'On Block', 'Total Time'
  ]
  const rows = entries.map(e => [
    e.date,
    e.aircraft_callsign,
    e.departure_airport,
    e.arrival_airport,
    e.pilot_flying,
    e.pilot_monitoring,
    formatTime(e.off_block_time),
    formatTime(e.takeoff_time),
    formatTime(e.landing_time),
    formatTime(e.on_block_time),
    e.total_time ? e.total_time.substring(0, 5) : '—',
  ])
  const csv = [headers, ...rows].map(r => r.join(',')).join('\n')
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
                <th className="text-left px-4 py-3 text-slate-400 font-medium">Date</th>
                <th className="text-left px-4 py-3 text-slate-400 font-medium">Aircraft</th>
                <th className="text-left px-4 py-3 text-slate-400 font-medium">Route</th>
                <th className="text-left px-4 py-3 text-slate-400 font-medium">Pilot Flying</th>
                <th className="text-left px-4 py-3 text-slate-400 font-medium">Off Block</th>
                <th className="text-left px-4 py-3 text-slate-400 font-medium">T/O</th>
                <th className="text-left px-4 py-3 text-slate-400 font-medium">LDG</th>
                <th className="text-left px-4 py-3 text-slate-400 font-medium">On Block</th>
                <th className="text-left px-4 py-3 text-slate-400 font-medium">Block Time</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry, i) => (
                <tr
                  key={entry.id}
                  className={`border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors ${i % 2 === 0 ? 'bg-slate-900/30' : 'bg-slate-900/10'}`}
                >
                  <td className="px-4 py-3 text-slate-300 whitespace-nowrap">
                    {format(new Date(entry.date), 'dd MMM yyyy')}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="outline" className="border-blue-700 text-blue-300 font-mono">
                      {entry.aircraft_callsign}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-white font-mono font-medium whitespace-nowrap">
                    {entry.departure_airport} → {entry.arrival_airport}
                  </td>
                  <td className="px-4 py-3 text-slate-300 whitespace-nowrap">{entry.pilot_flying}</td>
                  <td className="px-4 py-3 text-slate-300 font-mono">{formatTime(entry.off_block_time)}</td>
                  <td className="px-4 py-3 text-slate-300 font-mono">{formatTime(entry.takeoff_time)}</td>
                  <td className="px-4 py-3 text-slate-300 font-mono">{formatTime(entry.landing_time)}</td>
                  <td className="px-4 py-3 text-slate-300 font-mono">{formatTime(entry.on_block_time)}</td>
                  <td className="px-4 py-3 font-mono font-semibold text-blue-300">
                    {entry.total_time ? entry.total_time.substring(0, 5) : '—'}
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
