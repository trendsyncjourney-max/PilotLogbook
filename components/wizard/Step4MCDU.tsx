'use client'

import { useState } from 'react'
import { WizardData } from '@/lib/types'
import { PhotoUploader } from './PhotoUploader'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { ArrowRight } from 'lucide-react'

interface Props {
  data: WizardData
  update: (p: Partial<WizardData>) => void
  onNext: () => void
  onBack: () => void
}

export function Step4MCDU({ data, update, onNext, onBack }: Props) {
  const [preview, setPreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleImage(file: File) {
    setPreview(URL.createObjectURL(file))
    setLoading(true)
    try {
      const formData = new FormData()
      formData.append('image', file)
      formData.append('type', 'mcdu')
      const res = await fetch('/api/extract', { method: 'POST', body: formData })
      const json = await res.json()
      if (json.success) {
        const { departure_airport, arrival_airport } = json.data
        update({
          departure_airport: departure_airport || data.departure_from_gendecl || '',
          arrival_airport: arrival_airport || data.arrival_from_gendecl || '',
        })
        if (departure_airport || arrival_airport) {
          toast.success(`Route: ${departure_airport || '?'} → ${arrival_airport || '?'}`)
        } else {
          toast.warning('Could not extract airports — please enter manually')
        }
      }
    } catch {
      toast.error('Extraction failed — please enter manually')
    } finally {
      setLoading(false)
    }
  }

  const canContinue = data.departure_airport && data.arrival_airport

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-white">Step 4: MCDU / FMS</h2>
        <p className="text-slate-400 text-sm mt-1">Photo of the MCDU showing the route (FROM/TO airports). AI will extract the ICAO codes.</p>
      </div>

      <PhotoUploader
        label="Photo of MCDU screen"
        hint="Show the route page with departure and destination ICAO codes"
        onImageSelected={handleImage}
        isLoading={loading}
        preview={preview}
        onClear={() => setPreview(null)}
      />

      <div className="flex items-center gap-3">
        <div className="flex-1 space-y-2">
          <Label className="text-slate-300">Departure (ICAO)</Label>
          <Input
            value={data.departure_airport}
            onChange={e => update({ departure_airport: e.target.value.toUpperCase() })}
            placeholder="e.g. OMDB"
            maxLength={4}
            className="bg-slate-800 border-slate-700 text-white font-mono uppercase placeholder:text-slate-500"
          />
        </div>
        <ArrowRight className="h-5 w-5 text-slate-600 mt-6 shrink-0" />
        <div className="flex-1 space-y-2">
          <Label className="text-slate-300">Arrival (ICAO)</Label>
          <Input
            value={data.arrival_airport}
            onChange={e => update({ arrival_airport: e.target.value.toUpperCase() })}
            placeholder="e.g. EGLL"
            maxLength={4}
            className="bg-slate-800 border-slate-700 text-white font-mono uppercase placeholder:text-slate-500"
          />
        </div>
      </div>

      <div className="flex gap-3">
        <Button variant="outline" className="flex-1 border-slate-700 text-slate-300 hover:bg-slate-800" onClick={onBack}>
          Back
        </Button>
        <Button
          className="flex-1 bg-blue-600 hover:bg-blue-700"
          disabled={!canContinue || loading}
          onClick={onNext}
        >
          Continue
        </Button>
      </div>
    </div>
  )
}
