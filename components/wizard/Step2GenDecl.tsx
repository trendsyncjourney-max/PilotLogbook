'use client'

import { useState } from 'react'
import { WizardData } from '@/lib/types'
import { PhotoUploader } from './PhotoUploader'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'

interface Props {
  data: WizardData
  update: (p: Partial<WizardData>) => void
  onNext: () => void
  onBack: () => void
}

export function Step2GenDecl({ data, update, onNext, onBack }: Props) {
  const [preview, setPreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleImage(file: File) {
    setPreview(URL.createObjectURL(file))
    setLoading(true)
    try {
      const formData = new FormData()
      formData.append('image', file)
      formData.append('type', 'gendecl')
      const res = await fetch('/api/extract', { method: 'POST', body: formData })
      const json = await res.json()
      if (json.success) {
        const { date, pilot1_name, pilot2_name, departure_from_gendecl, arrival_from_gendecl } = json.data
        update({
          date: date || data.date,
          pilot1_name: pilot1_name || '',
          pilot2_name: pilot2_name || '',
          departure_from_gendecl: departure_from_gendecl || '',
          arrival_from_gendecl: arrival_from_gendecl || '',
        })
        const found = [date, pilot1_name, pilot2_name].filter(Boolean).length
        if (found > 0) {
          toast.success(`Extracted ${found} field${found > 1 ? 's' : ''} from General Declaration`)
        } else {
          toast.warning('Could not extract data — please enter manually')
        }
      }
    } catch {
      toast.error('Extraction failed — please enter manually')
    } finally {
      setLoading(false)
    }
  }

  const canContinue = data.pilot1_name && data.pilot2_name && data.date

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-white">Step 2: General Declaration</h2>
        <p className="text-slate-400 text-sm mt-1">Photo of the GenDecl — AI will extract both pilot names, date, and route.</p>
      </div>

      <PhotoUploader
        label="Photo of General Declaration"
        hint="The document listing the crew for this flight"
        onImageSelected={handleImage}
        isLoading={loading}
        preview={preview}
        onClear={() => setPreview(null)}
      />

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label className="text-slate-300">Flight date</Label>
          <Input
            type="date"
            value={data.date}
            onChange={e => update({ date: e.target.value })}
            className="bg-slate-800 border-slate-700 text-white"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-slate-300 text-xs">Dep (from GenDecl)</Label>
          <Input
            value={data.departure_from_gendecl}
            onChange={e => update({ departure_from_gendecl: e.target.value.toUpperCase() })}
            placeholder="e.g. OMDB"
            className="bg-slate-800 border-slate-700 text-white font-mono placeholder:text-slate-500 uppercase"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label className="text-slate-300">Pilot 1 (Commander)</Label>
          <Input
            value={data.pilot1_name}
            onChange={e => update({ pilot1_name: e.target.value })}
            placeholder="Full name"
            className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-slate-300">Pilot 2 (F/O)</Label>
          <Input
            value={data.pilot2_name}
            onChange={e => update({ pilot2_name: e.target.value })}
            placeholder="Full name"
            className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
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
