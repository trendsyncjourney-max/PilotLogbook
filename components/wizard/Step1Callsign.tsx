'use client'

import { useState } from 'react'
import { WizardData } from '@/lib/types'
import { PhotoUploader } from './PhotoUploader'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'

interface Props { data: WizardData; update: (p: Partial<WizardData>) => void; onNext: () => void }

export function Step1Callsign({ data, update, onNext }: Props) {
  const [preview, setPreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleImage(file: File) {
    setPreview(URL.createObjectURL(file))
    setLoading(true)
    try {
      const formData = new FormData()
      formData.append('image', file)
      formData.append('type', 'callsign')
      const res = await fetch('/api/extract', { method: 'POST', body: formData })
      const json = await res.json()
      if (json.success && json.data.aircraft_callsign) {
        update({ aircraft_callsign: json.data.aircraft_callsign })
        toast.success(`Extracted: ${json.data.aircraft_callsign}`)
      } else {
        toast.warning('Could not extract callsign — please enter manually')
      }
    } catch {
      toast.error('Extraction failed — please enter manually')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-white">Step 1: Aircraft Call Sign</h2>
        <p className="text-slate-400 text-sm mt-1">Take or upload a photo of the aircraft registration. AI will read it for you.</p>
      </div>

      <PhotoUploader
        label="Photo of aircraft registration"
        hint="The call sign is on the fuselage or tail (e.g. A6-EDA)"
        onImageSelected={handleImage}
        isLoading={loading}
        preview={preview}
        onClear={() => { setPreview(null); update({ aircraft_callsign: '' }) }}
      />

      <div className="space-y-2">
        <Label className="text-slate-300">Aircraft call sign</Label>
        <Input
          value={data.aircraft_callsign}
          onChange={e => update({ aircraft_callsign: e.target.value.toUpperCase() })}
          placeholder="e.g. A6-EDA"
          className="bg-slate-800 border-slate-700 text-white font-mono placeholder:text-slate-500 uppercase"
        />
      </div>

      <Button
        className="w-full bg-blue-600 hover:bg-blue-700"
        disabled={!data.aircraft_callsign || loading}
        onClick={onNext}
      >
        Continue
      </Button>
    </div>
  )
}
