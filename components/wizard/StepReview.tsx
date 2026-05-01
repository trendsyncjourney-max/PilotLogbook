'use client'

import { useEffect, useState } from 'react'
import { WizardData, CrewMember } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Loader2, CheckCircle2, ArrowRight, Plus } from 'lucide-react'
import { toast } from 'sonner'
import { calculateTotalTime, cn } from '@/lib/utils'

const AIRCRAFT_TYPES = [
  'A318','A319','A320','A320neo','A321','A321neo','A321XLR',
  'A330-200','A330-300','A330-900neo',
  'A340-300','A340-600',
  'A350-900','A350-1000',
  'A380-800',
  'B737-700','B737-800','B737-900','B737 MAX 8','B737 MAX 9','B737 MAX 10',
  'B747-400','B747-8',
  'B757-200','B757-300',
  'B767-300ER','B767-400ER',
  'B777-200','B777-200ER','B777-300','B777-300ER','B777X',
  'B787-8','B787-9','B787-10',
  'E170','E175','E190','E195','E190-E2','E195-E2',
  'CRJ700','CRJ900','CRJ1000',
  'ATR42','ATR72',
  'DHC-8-400','C919','ARJ21',
]

const REMARKS_PRESETS = ['Line Check', 'Observer', 'Safety Pilot', 'Simulator', 'OPC', 'LPC', 'Route Check']

interface Props {
  data: WizardData
  update: (p: Partial<WizardData>) => void
  onSave: () => void
  onBack: () => void
  saving: boolean
}

export function StepReview({ data, update, onSave, onBack, saving }: Props) {
  const [crew, setCrew]           = useState<CrewMember[]>([])
  const [savingCrew, setSavingCrew] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/crew').then(r => r.json()).then(j => setCrew(j.crew ?? [])).catch(() => {})
  }, [])

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

  // Crew options for toggle buttons
  const crewOptions = [
    { role: 'captain' as const, name: data.captain, badge: 'CN' },
    { role: 'first_officer' as const, name: data.first_officer, badge: 'FO' },
  ].filter(x => x.name)

  function selectPF(name: string) {
    const other = [data.captain, data.first_officer].find(n => n && n !== name) ?? ''
    update({
      pilot_flying:    name,
      pilot_monitoring: other,
      takeoff_pilot:   name,
      landing_pilot:   name,
    })
  }

  function handleTimeChange(key: keyof WizardData, value: string) {
    const patch: Partial<WizardData> = { [key]: value }
    const offBlock = key === 'off_block_time' ? value : data.off_block_time
    const onBlock  = key === 'on_block_time'  ? value : data.on_block_time
    if (offBlock && onBlock) patch.total_time = calculateTotalTime(offBlock, onBlock)
    update(patch)
  }

  const depAirport = data.departure_airport || data.departure_from_gendecl
  const arrAirport = data.arrival_airport   || data.arrival_from_gendecl

  const airborneTime =
    data.takeoff_time && data.landing_time
      ? calculateTotalTime(data.takeoff_time, data.landing_time)
      : ''

  const canSave = !!(data.date && data.aircraft_callsign && depAirport && arrAirport && data.pilot_flying && data.pilot_monitoring)

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-white">Step 2: Review & Confirm</h2>
        <p className="text-slate-400 text-sm mt-1">Edit any field before saving.</p>
      </div>

      {/* ── Flight Details ── */}
      <Section title="Flight Details">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Date">
            <Input type="date" value={data.date}
              onChange={e => update({ date: e.target.value })}
              className="bg-slate-800 border-slate-700 text-white" />
          </Field>
          <Field label="Flight Number">
            <Input value={data.flight_number}
              onChange={e => update({ flight_number: e.target.value.toUpperCase() })}
              placeholder="e.g. EK123"
              className="bg-slate-800 border-slate-700 text-white font-mono uppercase placeholder:text-slate-500" />
          </Field>
          <Field label="Aircraft Callsign">
            <Input value={data.aircraft_callsign}
              onChange={e => update({ aircraft_callsign: e.target.value.toUpperCase() })}
              placeholder="e.g. A6-EDA or SIM"
              className="bg-slate-800 border-slate-700 text-white font-mono uppercase placeholder:text-slate-500" />
          </Field>
          <Field label="Aircraft Type">
            <input list="ac-types" value={data.aircraft_type}
              onChange={e => update({ aircraft_type: e.target.value })}
              placeholder="e.g. B777-300ER"
              className="input-base" />
            <datalist id="ac-types">
              {AIRCRAFT_TYPES.map(t => <option key={t} value={t} />)}
            </datalist>
          </Field>
        </div>
      </Section>

      {/* ── Route ── */}
      <Section title="Route">
        <div className="flex items-center gap-3">
          <Field label="Departure (ICAO)" className="flex-1">
            <Input value={data.departure_airport || data.departure_from_gendecl}
              onChange={e => update({ departure_airport: e.target.value.toUpperCase() })}
              placeholder="OMDB" maxLength={4}
              className="bg-slate-800 border-slate-700 text-white font-mono uppercase placeholder:text-slate-500" />
          </Field>
          <ArrowRight className="h-4 w-4 text-slate-600 mt-5 shrink-0" />
          <Field label="Arrival (ICAO)" className="flex-1">
            <Input value={data.arrival_airport || data.arrival_from_gendecl}
              onChange={e => update({ arrival_airport: e.target.value.toUpperCase() })}
              placeholder="EGLL" maxLength={4}
              className="bg-slate-800 border-slate-700 text-white font-mono uppercase placeholder:text-slate-500" />
          </Field>
        </div>
      </Section>

      {/* ── Crew ── */}
      <Section title="Crew">
        <CrewField label="Captain" badge="CN" value={data.captain}
          onChange={v => update({ captain: v })}
          crew={crewNames} onSave={saveCrewName} savingCrew={savingCrew} listId="crew-cn" />
        <CrewField label="First Officer" badge="FO" value={data.first_officer}
          onChange={v => update({ first_officer: v })}
          crew={crewNames} onSave={saveCrewName} savingCrew={savingCrew} listId="crew-fo" />

        {crewOptions.length > 0 && (
          <div className="space-y-3 pt-1 border-t border-slate-700/50">
            <CrewToggle
              label="Pilot Flying (PF) — sector"
              options={crewOptions}
              value={data.pilot_flying}
              onChange={selectPF}
              activeColor="blue"
            />
            <CrewToggle
              label="Takeoff PF"
              options={crewOptions}
              value={data.takeoff_pilot}
              onChange={v => update({ takeoff_pilot: v })}
              activeColor="amber"
            />
            <CrewToggle
              label="Landing PF"
              options={crewOptions}
              value={data.landing_pilot}
              onChange={v => update({ landing_pilot: v })}
              activeColor="green"
            />
          </div>
        )}
      </Section>

      {/* ── Times ── */}
      <Section title="Times (UTC — 24h)">
        <div className="grid grid-cols-2 gap-3">
          {([
            { key: 'off_block_time', label: 'Off Block (OUT)' },
            { key: 'takeoff_time',   label: 'Takeoff (OFF)'  },
            { key: 'landing_time',   label: 'Landing (ON)'   },
            { key: 'on_block_time',  label: 'On Block (IN)'  },
          ] as { key: keyof WizardData; label: string }[]).map(({ key, label }) => (
            <Field key={key} label={label}>
              <Input type="time" value={(data[key] as string) || ''}
                onChange={e => handleTimeChange(key, e.target.value)}
                className="bg-slate-800 border-slate-700 text-white font-mono" />
            </Field>
          ))}
        </div>

        <div className="space-y-2 mt-1">
          {airborneTime && (
            <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-slate-800/60 border border-slate-700">
              <span className="text-slate-400 text-sm">Flight time (airborne)</span>
              <span className="text-slate-200 font-mono font-semibold">{airborneTime}</span>
            </div>
          )}
          {data.total_time && (
            <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-blue-500/10 border border-blue-500/30">
              <span className="text-slate-400 text-sm">Block time (total)</span>
              <span className="text-blue-300 font-mono font-bold text-lg">{data.total_time}</span>
            </div>
          )}
        </div>
      </Section>

      {/* ── Remarks ── */}
      <Section title="Remarks">
        <input
          list="remarks-list"
          value={data.remarks}
          onChange={e => update({ remarks: e.target.value })}
          placeholder="Optional — e.g. Line Check, Observer…"
          className="input-base w-full"
        />
        <datalist id="remarks-list">
          {REMARKS_PRESETS.map(r => <option key={r} value={r} />)}
        </datalist>
      </Section>

      <div className="flex gap-3 pt-1">
        <Button variant="outline" className="flex-1 border-slate-700 text-slate-300 hover:bg-slate-800"
          onClick={onBack} disabled={saving}>
          Back
        </Button>
        <Button className="flex-1 bg-green-600 hover:bg-green-700 gap-2"
          disabled={!canSave || saving} onClick={onSave}>
          {saving
            ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving…</>
            : <><CheckCircle2 className="h-4 w-4" /> Save to Logbook</>}
        </Button>
      </div>
    </div>
  )
}

// ── Sub-components ──────────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3 p-4 rounded-lg bg-slate-800/40 border border-slate-700/60">
      <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{title}</h3>
      {children}
    </div>
  )
}

function Field({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('space-y-1.5', className)}>
      <Label className="text-slate-300 text-xs">{label}</Label>
      {children}
    </div>
  )
}

function CrewToggle({
  label, options, value, onChange, activeColor,
}: {
  label: string
  options: { role: string; name: string; badge: string }[]
  value: string
  onChange: (name: string) => void
  activeColor: 'blue' | 'amber' | 'green'
}) {
  const colors = {
    blue:  { active: 'border-blue-500 bg-blue-500/10 text-white', badge: 'bg-blue-600/30 text-blue-300 border-blue-500/50' },
    amber: { active: 'border-amber-500 bg-amber-500/10 text-white', badge: 'bg-amber-600/30 text-amber-300 border-amber-500/50' },
    green: { active: 'border-green-500 bg-green-500/10 text-white', badge: 'bg-green-600/30 text-green-300 border-green-500/50' },
  }
  const c = colors[activeColor]

  return (
    <div className="space-y-1.5">
      <Label className="text-slate-400 text-xs">{label}</Label>
      <div className="flex gap-2">
        {options.map(({ name, badge }) => {
          const isActive = value === name
          return (
            <button key={name} onClick={() => onChange(isActive ? '' : name)}
              className={cn(
                'flex-1 py-2 px-3 rounded-lg border-2 text-sm font-medium transition-all flex items-center justify-center gap-2',
                isActive ? c.active : 'border-slate-700 text-slate-400 hover:border-slate-600'
              )}>
              <span className="truncate">{name}</span>
              <Badge className={cn('text-xs shrink-0', isActive ? c.badge : 'bg-slate-700 text-slate-400 border-slate-600')}>
                {badge}
              </Badge>
            </button>
          )
        })}
      </div>
    </div>
  )
}

function CrewField({
  label, badge, value, onChange, crew, onSave, savingCrew, listId,
}: {
  label: string; badge: string; value: string
  onChange: (v: string) => void
  crew: string[]
  onSave: (name: string) => void
  savingCrew: string | null
  listId: string
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
          placeholder="Type or select from list…"
          className="flex-1 rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500" />
        <datalist id={listId}>
          <option value="SELF" />
          {crew.map(n => <option key={n} value={n} />)}
        </datalist>
        <Button type="button" variant="outline" size="sm"
          className="border-slate-700 text-slate-300 hover:bg-slate-800 shrink-0"
          onClick={() => onChange('SELF')}>
          SELF
        </Button>
      </div>
      {value && !isInList && (
        <button onClick={() => onSave(value)} disabled={savingCrew === value}
          className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 transition-colors disabled:opacity-50">
          {savingCrew === value ? <Loader2 className="h-3 w-3 animate-spin" /> : <Plus className="h-3 w-3" />}
          Save &ldquo;{value}&rdquo; to crew list
        </button>
      )}
    </div>
  )
}
