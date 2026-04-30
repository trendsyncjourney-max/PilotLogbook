'use client'

import { WizardData } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { User, Plane } from 'lucide-react'

interface Props {
  data: WizardData
  update: (p: Partial<WizardData>) => void
  onNext: () => void
  onBack: () => void
}

export function Step3PilotSelect({ data, update, onNext, onBack }: Props) {
  const pilots = [data.pilot1_name, data.pilot2_name].filter(Boolean)

  function selectPF(name: string) {
    const pm = pilots.find(p => p !== name) || ''
    update({ pilot_flying: name, pilot_monitoring: pm })
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-white">Step 3: Select Pilot Flying</h2>
        <p className="text-slate-400 text-sm mt-1">Who is the Pilot Flying (PF) on this sector?</p>
      </div>

      <div className="space-y-3">
        {pilots.map(name => {
          const isPF = data.pilot_flying === name
          return (
            <button
              key={name}
              onClick={() => selectPF(name)}
              className={cn(
                'w-full flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all',
                isPF
                  ? 'border-blue-500 bg-blue-500/10'
                  : 'border-slate-700 bg-slate-800/30 hover:border-slate-600'
              )}
            >
              <div className={cn(
                'p-2 rounded-full',
                isPF ? 'bg-blue-500/20 text-blue-400' : 'bg-slate-700 text-slate-400'
              )}>
                <User className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <p className={cn('font-medium', isPF ? 'text-white' : 'text-slate-300')}>{name}</p>
                <p className={cn('text-sm', isPF ? 'text-blue-400' : 'text-slate-500')}>
                  {isPF ? 'Pilot Flying (PF)' : 'Pilot Monitoring (PM)'}
                </p>
              </div>
              {isPF && (
                <div className="flex items-center gap-1 text-blue-400 text-sm font-medium">
                  <Plane className="h-4 w-4" />
                  PF
                </div>
              )}
            </button>
          )
        })}
      </div>

      {data.pilot_flying && (
        <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700 text-sm text-slate-400">
          <span className="text-white font-medium">{data.pilot_flying}</span> is PF &bull;{' '}
          <span className="text-white font-medium">{data.pilot_monitoring}</span> is PM
        </div>
      )}

      <div className="flex gap-3">
        <Button variant="outline" className="flex-1 border-slate-700 text-slate-300 hover:bg-slate-800" onClick={onBack}>
          Back
        </Button>
        <Button
          className="flex-1 bg-blue-600 hover:bg-blue-700"
          disabled={!data.pilot_flying}
          onClick={onNext}
        >
          Continue
        </Button>
      </div>
    </div>
  )
}
