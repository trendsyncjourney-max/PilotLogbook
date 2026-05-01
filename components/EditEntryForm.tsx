'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { LogbookEntry, CrewMember } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Loader2, CheckCircle2, ArrowRight, Plus, ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'
import { calculateTotalTime, cn } from '@/lib/utils'

const AIRCRAFT_TYPES = [
  'A318','A319','A320','A320neo','A321','A321neo','A321XLR',
  'A330-200','A330-300','A330-900neo','A340-300','A340-600',
  'A350-900','A350-1000','A380-800',
  'B737-700','B737-800','B737-900','B737 MAX 8','B737 MAX 9','B737 MAX 10',
  'B747-400','B747-8','B757-200','B757-300',
  'B767-300ER','B767-400ER',
  'B777-200','B777-200ER','B777-300','B777-300ER','B777X',
  'B787-8','B787-9','B787-10',
  'E170','E175','E190','E195','E190-E2','E195-E2',
  'CRJ700','CRJ900','CRJ1000','ATR42','ATR72','DHC-8-400','C919','ARJ21',
]

const REMARKS_PRESETS = ['Line Check', 'Observer', 'Safety Pilot', 'Simulator', 'OPC', 'LPC', 'Route Check']

function ft(t: string | null) { return t ? t.substring(0, 5) : '' }

type FormData = {
  date: string; flight_number: string; aircraft_callsign: string; aircraft_type: string
  departure_airport: string; arrival_airport: string
  captain: string; first_officer: string
  pilot_flying: string; pilot_monitoring: string
  takeoff_pilot: string; landing_pilot: string
  off_block_time: string; takeoff_time: string; landing_time: string; on_block_time: string; total_time: string
  remarks: string
}

export function EditEntryForm({ entry }: { entry: LogbookEntry }) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [crew, setCrew]     = useState<CrewMember[]>([])
  const [savingCrew, setSavingCrew] = useState<string | null>(null)

  const [form, setForm] = useState<FormData>({
    date:              entry.date,
    flight_number:     entry.flight_number     ?? '',
    aircraft_callsign: entry.aircraft_callsign,
    aircraft_type:     entry.aircraft_type     ?? '',
    departure_airport: entry.departure_airport,
    arrival_airport:   entry.arrival_airport,
    captain:           entry.captain           ?? '',
    first_officer:     entry.first_officer     ?? '',
    pilot_flying:      entry.pilot_flying,
    pilot_monitoring:  entry.pilot_monitoring,
    takeoff_pilot:     entry.takeoff_pilot     ?? '',
    landing_pilot:     entry.landing_pilot     ?? '',
    off_block_time:    ft(entry.off_block_time),
    takeoff_time:      ft(entry.takeoff_time),
    landing_time:      ft(entry.landing_time),
    on_block_time:     ft(entry.on_block_time),
    total_time:        ft(entry.total_time),
    remarks:           entry.remarks           ?? '',
  })

  useEffect(() => {
    fetch('/api/crew').then(r => r.json()).then(j => setCrew(j.crew ?? [])).catch(() => {})
  }, [])

  function set(patch: Partial<FormData>) { setForm(f => ({ ...f, ...patch })) }

  function handleTimeChange(key: keyof FormData, value: string) {
    const next = { ...form, [key]: value }
    if (next.off_block_time && next.on_block_time) {
      next.total_time = calculateTotalTime(next.off_block_time, next.on_block_time)
    }
    setForm(next)
  }

  const crewNames = crew.map(c => c.name)

  async function saveCrewName(name: string) {
    if (!name || name === 'SELF') return
    setSavingCrew(name)
    await fetch('/api/crew', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    })
    setCrew(c => c.some(x => x.name === name) ? c : [...c, { id: Date.now().toString(), name }])
    setSavingCrew(null)
    toast.success(`"${name}" saved to crew list`)
  }

  function selectPF(name: string) {
    const other = [form.captain, form.first_officer].find(n => n && n !== name) ?? ''
    set({
      pilot_flying:    name,
      pilot_monitoring: other,
      takeoff_pilot:   name,
      landing_pilot:   name,
    })
  }

  const crewOptions = [
    { name: form.captain,       badge: 'CN' },
    { name: form.first_officer, badge: 'FO' },
  ].filter(x => x.name)

  const airborneTime = form.takeoff_time && form.landing_time
    ? calculateTotalTime(form.takeoff_time, form.landing_time) : ''

  const canSave = !!(form.date && form.aircraft_callsign && form.departure_airport && form.arrival_airport && form.pilot_flying && form.pilot_monitoring)

  async function handleSave() {
    setSaving(true)
    try {
      const res = await fetch(`/api/logbook/${entry.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date:              form.date,
          flight_number:     form.flight_number     || null,
          aircraft_callsign: form.aircraft_callsign,
          aircraft_type:     form.aircraft_type     || null,
          departure_airport: form.departure_airport,
          arrival_airport:   form.arrival_airport,
          captain:           form.captain           || null,
          first_officer:     form.first_officer     || null,
          pilot_flying:      form.pilot_flying,
          pilot_monitoring:  form.pilot_monitoring,
          takeoff_pilot:     form.takeoff_pilot     || null,
          landing_pilot:     form.landing_pilot     || null,
          off_block_time:    form.off_block_time    || null,
          takeoff_time:      form.takeoff_time      || null,
          landing_time:      form.landing_time      || null,
          on_block_time:     form.on_block_time     || null,
          total_time:        form.total_time        || null,
          remarks:           form.remarks           || null,
        }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      toast.success('Entry updated')
      router.push('/dashboard')
      router.refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-4 pb-10">

      <ESection title="Flight Details">
        <div className="grid grid-cols-2 gap-3">
          <EField label="Date">
            <Input type="date" value={form.date} onChange={e => set({ date: e.target.value })}
              className="bg-slate-800 border-slate-700 text-white" />
          </EField>
          <EField label="Flight Number">
            <Input value={form.flight_number} onChange={e => set({ flight_number: e.target.value.toUpperCase() })}
              placeholder="EK123" className="bg-slate-800 border-slate-700 text-white font-mono uppercase placeholder:text-slate-500" />
          </EField>
          <EField label="Aircraft Callsign">
            <Input value={form.aircraft_callsign} onChange={e => set({ aircraft_callsign: e.target.value.toUpperCase() })}
              placeholder="A6-EDA" className="bg-slate-800 border-slate-700 text-white font-mono uppercase placeholder:text-slate-500" />
          </EField>
          <EField label="Aircraft Type">
            <input list="edit-ac-types" value={form.aircraft_type}
              onChange={e => set({ aircraft_type: e.target.value })} placeholder="B777-300ER"
              className="w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <datalist id="edit-ac-types">{AIRCRAFT_TYPES.map(t => <option key={t} value={t} />)}</datalist>
          </EField>
        </div>
      </ESection>

      <ESection title="Route">
        <div className="flex items-center gap-3">
          <EField label="Departure (ICAO)" className="flex-1">
            <Input value={form.departure_airport} onChange={e => set({ departure_airport: e.target.value.toUpperCase() })}
              placeholder="OMDB" maxLength={4}
              className="bg-slate-800 border-slate-700 text-white font-mono uppercase placeholder:text-slate-500" />
          </EField>
          <ArrowRight className="h-4 w-4 text-slate-600 mt-5 shrink-0" />
          <EField label="Arrival (ICAO)" className="flex-1">
            <Input value={form.arrival_airport} onChange={e => set({ arrival_airport: e.target.value.toUpperCase() })}
              placeholder="EGLL" maxLength={4}
              className="bg-slate-800 border-slate-700 text-white font-mono uppercase placeholder:text-slate-500" />
          </EField>
        </div>
      </ESection>

      <ESection title="Crew">
        <ECrewField label="Captain" badge="CN" value={form.captain} onChange={v => set({ captain: v })}
          crew={crewNames} onSave={saveCrewName} savingCrew={savingCrew} listId="edit-cn" />
        <ECrewField label="First Officer" badge="FO" value={form.first_officer} onChange={v => set({ first_officer: v })}
          crew={crewNames} onSave={saveCrewName} savingCrew={savingCrew} listId="edit-fo" />

        {crewOptions.length > 0 && (
          <div className="space-y-3 pt-1 border-t border-slate-700/50">
            <ECrewToggle label="Pilot Flying (PF) — sector" options={crewOptions}
              value={form.pilot_flying} onChange={selectPF} color="blue" />
            <ECrewToggle label="Takeoff PF" options={crewOptions}
              value={form.takeoff_pilot} onChange={v => set({ takeoff_pilot: v })} color="amber" />
            <ECrewToggle label="Landing PF" options={crewOptions}
              value={form.landing_pilot} onChange={v => set({ landing_pilot: v })} color="green" />
          </div>
        )}
      </ESection>

      <ESection title="Times (UTC — 24h)">
        <div className="grid grid-cols-2 gap-3">
          {([
            { key: 'off_block_time', label: 'Off Block (OUT)' },
            { key: 'takeoff_time',   label: 'Takeoff (OFF)'  },
            { key: 'landing_time',   label: 'Landing (ON)'   },
            { key: 'on_block_time',  label: 'On Block (IN)'  },
          ] as { key: keyof FormData; label: string }[]).map(({ key, label }) => (
            <EField key={key} label={label}>
              <Input type="time" value={(form[key] as string) || ''}
                onChange={e => handleTimeChange(key, e.target.value)}
                className="bg-slate-800 border-slate-700 text-white font-mono" />
            </EField>
          ))}
        </div>
        <div className="space-y-2 mt-1">
          {airborneTime && (
            <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-slate-800/60 border border-slate-700">
              <span className="text-slate-400 text-sm">Flight time (airborne)</span>
              <span className="text-slate-200 font-mono font-semibold">{airborneTime}</span>
            </div>
          )}
          {form.total_time && (
            <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-blue-500/10 border border-blue-500/30">
              <span className="text-slate-400 text-sm">Block time (total)</span>
              <span className="text-blue-300 font-mono font-bold text-lg">{form.total_time}</span>
            </div>
          )}
        </div>
      </ESection>

      <ESection title="Remarks">
        <input list="edit-remarks" value={form.remarks} onChange={e => set({ remarks: e.target.value })}
          placeholder="Optional — e.g. Line Check, Observer…"
          className="w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500" />
        <datalist id="edit-remarks">{REMARKS_PRESETS.map(r => <option key={r} value={r} />)}</datalist>
      </ESection>

      <div className="flex gap-3">
        <Button variant="outline" className="flex-1 border-slate-700 text-slate-300 hover:bg-slate-800 gap-2"
          onClick={() => router.back()} disabled={saving}>
          <ArrowLeft className="h-4 w-4" /> Cancel
        </Button>
        <Button className="flex-1 bg-green-600 hover:bg-green-700 gap-2"
          disabled={!canSave || saving} onClick={handleSave}>
          {saving
            ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving…</>
            : <><CheckCircle2 className="h-4 w-4" /> Save Changes</>}
        </Button>
      </div>
    </div>
  )
}

// ── Shared sub-components ────────────────────────────────────────────────────

function ESection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3 p-4 rounded-lg bg-slate-800/40 border border-slate-700/60">
      <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{title}</h3>
      {children}
    </div>
  )
}

function EField({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('space-y-1.5', className)}>
      <Label className="text-slate-300 text-xs">{label}</Label>
      {children}
    </div>
  )
}

function ECrewToggle({ label, options, value, onChange, color }: {
  label: string
  options: { name: string; badge: string }[]
  value: string
  onChange: (name: string) => void
  color: 'blue' | 'amber' | 'green'
}) {
  const styles = {
    blue:  'border-blue-500 bg-blue-500/10',
    amber: 'border-amber-500 bg-amber-500/10',
    green: 'border-green-500 bg-green-500/10',
  }
  return (
    <div className="space-y-1.5">
      <Label className="text-slate-400 text-xs">{label}</Label>
      <div className="flex gap-2">
        {options.map(({ name, badge }) => {
          const active = value === name
          return (
            <button key={name} onClick={() => onChange(active ? '' : name)}
              className={cn(
                'flex-1 py-2 px-3 rounded-lg border-2 text-sm font-medium transition-all flex items-center justify-center gap-2',
                active ? `${styles[color]} text-white` : 'border-slate-700 text-slate-400 hover:border-slate-600'
              )}>
              <span className="truncate">{name}</span>
              <Badge className="text-xs shrink-0 bg-slate-700 text-slate-300 border-slate-600">{badge}</Badge>
            </button>
          )
        })}
      </div>
    </div>
  )
}

function ECrewField({ label, badge, value, onChange, crew, onSave, savingCrew, listId }: {
  label: string; badge: string; value: string; onChange: (v: string) => void
  crew: string[]; onSave: (n: string) => void; savingCrew: string | null; listId: string
}) {
  const isInList = crew.includes(value) || value === 'SELF' || !value
  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-2">
        <Label className="text-slate-300 text-xs">{label}</Label>
        <Badge variant="outline" className="text-xs border-slate-600 text-slate-400 py-0">{badge}</Badge>
      </div>
      <div className="flex gap-2">
        <input list={listId} value={value} onChange={e => onChange(e.target.value)}
          placeholder="Type or select…"
          className="flex-1 rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500" />
        <datalist id={listId}><option value="SELF" />{crew.map(n => <option key={n} value={n} />)}</datalist>
        <Button type="button" variant="outline" size="sm"
          className="border-slate-700 text-slate-300 hover:bg-slate-800 shrink-0"
          onClick={() => onChange('SELF')}>SELF</Button>
      </div>
      {value && !isInList && (
        <button onClick={() => onSave(value)} disabled={savingCrew === value}
          className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 disabled:opacity-50">
          {savingCrew === value ? <Loader2 className="h-3 w-3 animate-spin" /> : <Plus className="h-3 w-3" />}
          Save &ldquo;{value}&rdquo; to crew list
        </button>
      )}
    </div>
  )
}
