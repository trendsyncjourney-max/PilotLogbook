'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { WizardData } from '@/lib/types'
import { Progress } from '@/components/ui/progress'
import { StepPhotos } from './StepPhotos'
import { StepReview } from './StepReview'
import { getSettings } from '@/lib/settings'

const STEPS = [
  { label: 'Photos',  description: 'Upload cockpit photos' },
  { label: 'Review',  description: 'Confirm & save'        },
]

function makeEmptyWizard(): WizardData {
  const s = getSettings()
  return {
    photos: [],

    date:              new Date().toISOString().split('T')[0],
    flight_number:     '',
    aircraft_callsign: '',
    aircraft_type:     s.defaultAircraftType,

    captain:                s.defaultRole === 'CN' ? s.selfName : '',
    first_officer:          s.defaultRole === 'FO' ? s.selfName : '',
    departure_from_gendecl: '',
    arrival_from_gendecl:   '',

    departure_airport: '',
    arrival_airport:   '',

    pilot_flying:     '',
    pilot_monitoring: '',
    takeoff_pilot:    '',
    landing_pilot:    '',

    off_block_time: '',
    takeoff_time:   '',
    landing_time:   '',
    on_block_time:  '',
    total_time:     '',

    remarks: '',
  }
}

export function WizardContainer() {
  const [step, setStep]     = useState(1)
  const [data, setData]     = useState<WizardData>(makeEmptyWizard)
  const [saving, setSaving] = useState(false)
  const router = useRouter()

  function update(patch: Partial<WizardData>) {
    setData(prev => ({ ...prev, ...patch }))
  }

  function next() { setStep(s => Math.min(s + 1, STEPS.length)) }
  function back() { setStep(s => Math.max(s - 1, 1)) }

  async function save() {
    setSaving(true)
    try {
      const dep = data.departure_airport || data.departure_from_gendecl
      const arr = data.arrival_airport   || data.arrival_from_gendecl

      const res = await fetch('/api/logbook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date:              data.date,
          flight_number:     data.flight_number     || null,
          aircraft_callsign: data.aircraft_callsign,
          aircraft_type:     data.aircraft_type     || null,
          departure_airport: dep,
          arrival_airport:   arr,
          captain:           data.captain           || null,
          first_officer:     data.first_officer     || null,
          pilot_flying:      data.pilot_flying,
          pilot_monitoring:  data.pilot_monitoring,
          takeoff_pilot:     data.takeoff_pilot     || null,
          landing_pilot:     data.landing_pilot     || null,
          off_block_time:    data.off_block_time    || null,
          takeoff_time:      data.takeoff_time      || null,
          landing_time:      data.landing_time      || null,
          on_block_time:     data.on_block_time     || null,
          total_time:        data.total_time        || null,
          remarks:           data.remarks           || null,
        }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      toast.success('Flight logged successfully!')
      router.push('/dashboard')
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to save entry')
    } finally {
      setSaving(false)
    }
  }

  const progress = ((step - 1) / (STEPS.length - 1)) * 100

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-400">Step {step} of {STEPS.length}</span>
          <span className="text-slate-300 font-medium">{STEPS[step - 1].label}</span>
        </div>
        <Progress value={progress} className="h-1.5 bg-slate-800" />
        <div className="flex justify-around">
          {STEPS.map((s, i) => (
            <div key={i} className="flex flex-col items-center gap-1">
              <div className={`w-2 h-2 rounded-full transition-colors ${
                i + 1 < step   ? 'bg-blue-500' :
                i + 1 === step ? 'bg-blue-400 ring-2 ring-blue-400/30' :
                                 'bg-slate-700'
              }`} />
              <span className={`text-xs ${i + 1 === step ? 'text-blue-400' : 'text-slate-600'}`}>
                {s.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-5">
        {step === 1 && <StepPhotos data={data} update={update} onNext={next} onSkip={next} />}
        {step === 2 && <StepReview data={data} update={update} onSave={save} onBack={back} saving={saving} />}
      </div>
    </div>
  )
}
