'use client'

import { useState } from 'react'
import { WizardData } from '@/lib/types'
import { PhotoUploader } from './PhotoUploader'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { calculateTotalTime } from '@/lib/utils'

interface Props {
  data: WizardData
  update: (p: Partial<WizardData>) => void
  onNext: () => void
  onBack: () => void
}

const timeFields: { key: keyof WizardData; label: string; placeholder: string }[] = [
  { key: 'off_block_time', label: 'Off Block (OUT)', placeholder: '08:00' },
  { key: 'takeoff_time', label: 'Takeoff (OFF)', placeholder: '08:15' },
  { key: 'landing_time', label: 'Landing (ON)', placeholder: '10:30' },
  { key: 'on_block_time', label: 'On Block (IN)', placeholder: '10:45' },
]

export function Step5ACARS({ data, update, onNext, onBack }: Props) {
  const [preview, setPreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleImage(file: File) {
    setPreview(URL.createObjectURL(file))
    setLoading(true)
    try {
      const formData = new FormData()
      formData.append('image', file)
      formData.append('type', 'acars')
      const res = await fetch('/api/extract', { method: 'POST', body: formData })
      const json = await res.json()
      if (json.success) {
        const { off_block_time, takeoff_time, landing_time, on_block_time, total_time } = json.data
        const patch: Partial<WizardData> = {
          off_block_time: off_block_time || '',
          takeoff_time: takeoff_time || '',
          landing_time: landing_time || '',
          on_block_time: on_block_time || '',
          total_time: total_time || (off_block_time && on_block_time ? calculateTotalTime(off_block_time, on_block_time) : ''),
        }
        update(patch)
        const found = [off_block_time, takeoff_time, landing_time, on_block_time].filter(Boolean).length
        if (found > 0) {
          toast.success(`Extracted ${found} time${found > 1 ? 's' : ''} from ACARS`)
        } else {
          toast.warning('Could not extract times — please enter manually')
        }
      }
    } catch {
      toast.error('Extraction failed — please enter manually')
    } finally {
      setLoading(false)
    }
  }

  function handleTimeChange(key: keyof WizardData, value: string) {
    const patch: Partial<WizardData> = { [key]: value }
    const nextOffBlock = key === 'off_block_time' ? value : data.off_block_time
    const nextOnBlock = key === 'on_block_time' ? value : data.on_block_time
    if (nextOffBlock && nextOnBlock) {
      patch.total_time = calculateTotalTime(nextOffBlock, nextOnBlock)
    }
    update(patch)
  }

  const canContinue = data.off_block_time && data.on_block_time

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-white">Step 5: ACARS / Flight Computer</h2>
        <p className="text-slate-400 text-sm mt-1">Photo of the ACARS screen showing flight times. All times should be in UTC.</p>
      </div>

      <PhotoUploader
        label="Photo of ACARS screen"
        hint="Screen showing OUT / OFF / ON / IN times (or equivalent)"
        onImageSelected={handleImage}
        isLoading={loading}
        preview={preview}
        onClear={() => setPreview(null)}
      />

      <div className="grid grid-cols-2 gap-3">
        {timeFields.map(({ key, label, placeholder }) => (
          <div key={key} className="space-y-2">
            <Label className="text-slate-300 text-sm">{label}</Label>
            <Input
              type="time"
              value={(data[key] as string) || ''}
              onChange={e => handleTimeChange(key, e.target.value)}
              placeholder={placeholder}
              className="bg-slate-800 border-slate-700 text-white font-mono"
            />
          </div>
        ))}
      </div>

      {data.total_time && (
        <div className="flex items-center justify-between p-3 rounded-lg bg-blue-500/10 border border-blue-500/30">
          <span className="text-slate-400 text-sm">Total block time</span>
          <span className="text-blue-300 font-mono font-semibold text-lg">{data.total_time}</span>
        </div>
      )}

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
