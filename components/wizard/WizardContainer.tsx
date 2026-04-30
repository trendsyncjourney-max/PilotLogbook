'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase'
import { WizardData } from '@/lib/types'
import { Progress } from '@/components/ui/progress'
import { Step1Callsign } from './Step1Callsign'
import { Step2GenDecl } from './Step2GenDecl'
import { Step3PilotSelect } from './Step3PilotSelect'
import { Step4MCDU } from './Step4MCDU'
import { Step5ACARS } from './Step5ACARS'
import { Step6Review } from './Step6Review'

const STEPS = [
  { label: 'Call Sign', description: 'Aircraft registration' },
  { label: 'Gen Decl', description: 'General declaration' },
  { label: 'Crew', description: 'Pilot flying / monitoring' },
  { label: 'MCDU', description: 'Departure & arrival' },
  { label: 'ACARS', description: 'Flight times' },
  { label: 'Review', description: 'Confirm & save' },
]

const emptyWizard = (): WizardData => ({
  aircraft_callsign: '',
  date: new Date().toISOString().split('T')[0],
  pilot1_name: '',
  pilot2_name: '',
  departure_from_gendecl: '',
  arrival_from_gendecl: '',
  pilot_flying: '',
  pilot_monitoring: '',
  departure_airport: '',
  arrival_airport: '',
  off_block_time: '',
  takeoff_time: '',
  landing_time: '',
  on_block_time: '',
  total_time: '',
})

export function WizardContainer() {
  const [step, setStep] = useState(1)
  const [data, setData] = useState<WizardData>(emptyWizard)
  const [saving, setSaving] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  function update(patch: Partial<WizardData>) {
    setData(prev => ({ ...prev, ...patch }))
  }

  function next() { setStep(s => Math.min(s + 1, 6)) }
  function back() { setStep(s => Math.max(s - 1, 1)) }

  async function save() {
    setSaving(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const totalTime = data.total_time || null
      const { error } = await supabase.from('logbook_entries').insert({
        user_id: user.id,
        date: data.date,
        aircraft_callsign: data.aircraft_callsign,
        departure_airport: data.departure_airport || data.departure_from_gendecl,
        arrival_airport: data.arrival_airport || data.arrival_from_gendecl,
        pilot_flying: data.pilot_flying,
        pilot_monitoring: data.pilot_monitoring,
        off_block_time: data.off_block_time || null,
        takeoff_time: data.takeoff_time || null,
        landing_time: data.landing_time || null,
        on_block_time: data.on_block_time || null,
        total_time: totalTime || null,
      })
      if (error) throw error
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
      {/* Progress header */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-400">Step {step} of {STEPS.length}</span>
          <span className="text-slate-300 font-medium">{STEPS[step - 1].label}</span>
        </div>
        <Progress value={progress} className="h-1.5 bg-slate-800" />
        <div className="flex justify-between">
          {STEPS.map((s, i) => (
            <div key={i} className="flex flex-col items-center gap-1">
              <div className={`w-2 h-2 rounded-full transition-colors ${i + 1 < step ? 'bg-blue-500' : i + 1 === step ? 'bg-blue-400 ring-2 ring-blue-400/30' : 'bg-slate-700'}`} />
              <span className={`text-xs hidden sm:block ${i + 1 === step ? 'text-blue-400' : 'text-slate-600'}`}>{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Step content */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-5">
        {step === 1 && <Step1Callsign data={data} update={update} onNext={next} />}
        {step === 2 && <Step2GenDecl data={data} update={update} onNext={next} onBack={back} />}
        {step === 3 && <Step3PilotSelect data={data} update={update} onNext={next} onBack={back} />}
        {step === 4 && <Step4MCDU data={data} update={update} onNext={next} onBack={back} />}
        {step === 5 && <Step5ACARS data={data} update={update} onNext={next} onBack={back} />}
        {step === 6 && <Step6Review data={data} update={update} onSave={save} onBack={back} saving={saving} />}
      </div>
    </div>
  )
}
