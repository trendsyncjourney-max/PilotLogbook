'use client'

import { WizardData } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Loader2, CheckCircle2 } from 'lucide-react'
import { format } from 'date-fns'

interface Props {
  data: WizardData
  update: (p: Partial<WizardData>) => void
  onSave: () => void
  onBack: () => void
  saving: boolean
}

function Row({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-slate-800 last:border-0">
      <span className="text-slate-400 text-sm">{label}</span>
      <span className={`text-white font-medium ${mono ? 'font-mono' : ''}`}>{value || '—'}</span>
    </div>
  )
}

export function Step6Review({ data, update, onSave, onBack, saving }: Props) {
  const formattedDate = data.date ? format(new Date(data.date), 'dd MMM yyyy') : '—'

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-white">Step 6: Review & Save</h2>
        <p className="text-slate-400 text-sm mt-1">Check all details before saving to your logbook. You can edit any field.</p>
      </div>

      <div className="space-y-4">
        {/* Basic info */}
        <div className="space-y-3 p-4 rounded-lg bg-slate-800/40 border border-slate-700">
          <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Flight Details</h3>
          <Row label="Date" value={formattedDate} />
          <Row label="Aircraft" value={data.aircraft_callsign} mono />
          <Row label="Route" value={`${data.departure_airport || data.departure_from_gendecl} → ${data.arrival_airport || data.arrival_from_gendecl}`} mono />
        </div>

        {/* Crew */}
        <div className="space-y-3 p-4 rounded-lg bg-slate-800/40 border border-slate-700">
          <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Crew</h3>
          <div className="flex items-center justify-between py-2 border-b border-slate-800">
            <span className="text-slate-400 text-sm">Pilot Flying</span>
            <div className="flex items-center gap-2">
              <span className="text-white font-medium">{data.pilot_flying || '—'}</span>
              <Badge className="bg-blue-600/20 text-blue-400 border-blue-600/30 text-xs">PF</Badge>
            </div>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-slate-400 text-sm">Pilot Monitoring</span>
            <div className="flex items-center gap-2">
              <span className="text-white font-medium">{data.pilot_monitoring || '—'}</span>
              <Badge variant="outline" className="border-slate-600 text-slate-400 text-xs">PM</Badge>
            </div>
          </div>
        </div>

        {/* Times */}
        <div className="space-y-3 p-4 rounded-lg bg-slate-800/40 border border-slate-700">
          <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Times (UTC)</h3>
          <div className="grid grid-cols-2 gap-x-4">
            <Row label="Off Block" value={data.off_block_time} mono />
            <Row label="Takeoff" value={data.takeoff_time} mono />
            <Row label="Landing" value={data.landing_time} mono />
            <Row label="On Block" value={data.on_block_time} mono />
          </div>
          {data.total_time && (
            <div className="flex items-center justify-between pt-2 border-t border-slate-700">
              <span className="text-slate-300 font-medium">Total Block Time</span>
              <span className="text-blue-300 font-mono font-bold text-xl">{data.total_time}</span>
            </div>
          )}
        </div>

        {/* Editable notes — date override */}
        <div className="space-y-2">
          <Label className="text-slate-400 text-sm">Adjust date if needed</Label>
          <Input
            type="date"
            value={data.date}
            onChange={e => update({ date: e.target.value })}
            className="bg-slate-800 border-slate-700 text-white"
          />
        </div>
      </div>

      <div className="flex gap-3">
        <Button variant="outline" className="flex-1 border-slate-700 text-slate-300 hover:bg-slate-800" onClick={onBack} disabled={saving}>
          Back
        </Button>
        <Button
          className="flex-1 bg-green-600 hover:bg-green-700 gap-2"
          onClick={onSave}
          disabled={saving}
        >
          {saving ? (
            <><Loader2 className="h-4 w-4 animate-spin" /> Saving...</>
          ) : (
            <><CheckCircle2 className="h-4 w-4" /> Save to Logbook</>
          )}
        </Button>
      </div>
    </div>
  )
}
