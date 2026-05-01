'use client'

import { useRef, useState } from 'react'
import { WizardData } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Camera, Upload, X, Loader2, CheckCircle2, ImagePlus } from 'lucide-react'
import Image from 'next/image'
import { toast } from 'sonner'
import { calculateTotalTime } from '@/lib/utils'

async function extractPhoto(file: File): Promise<Record<string, string>> {
  const fd = new FormData()
  fd.append('image', file)
  const res = await fetch('/api/extract', { method: 'POST', body: fd })
  const json = await res.json()
  return json.success ? json.data : {}
}

interface Props {
  data: WizardData
  update: (p: Partial<WizardData>) => void
  onNext: () => void
  onSkip: () => void
}

export function StepPhotos({ data, update, onNext, onSkip }: Props) {
  const fileRef   = useRef<HTMLInputElement>(null)
  const cameraRef = useRef<HTMLInputElement>(null)

  const [previews, setPreviews]   = useState<string[]>([])
  const [analyzing, setAnalyzing] = useState(false)
  const [doneIdx, setDoneIdx]     = useState<Set<number>>(new Set())
  const [progress, setProgress]   = useState({ done: 0, total: 0 })

  function addFiles(files: FileList | null) {
    if (!files || files.length === 0) return
    const arr = Array.from(files)
    update({ photos: [...data.photos, ...arr] })
    setPreviews(p => [...p, ...arr.map(f => URL.createObjectURL(f))])
  }

  function removePhoto(idx: number) {
    update({ photos: data.photos.filter((_, i) => i !== idx) })
    setPreviews(p => p.filter((_, i) => i !== idx))
    setDoneIdx(s => {
      const next = new Set<number>()
      s.forEach(i => { if (i < idx) next.add(i); else if (i > idx) next.add(i - 1) })
      return next
    })
  }

  async function analyzeAll() {
    if (data.photos.length === 0) return
    setAnalyzing(true)
    setDoneIdx(new Set())
    setProgress({ done: 0, total: data.photos.length })

    const merged: Record<string, string> = {}

    for (let i = 0; i < data.photos.length; i++) {
      try {
        const extracted = await extractPhoto(data.photos[i])
        for (const [key, value] of Object.entries(extracted)) {
          // Later photos override earlier ones for the same field
          if (value) merged[key] = value
        }
      } catch {
        // skip failed photo, continue
      }
      setDoneIdx(s => new Set([...s, i]))
      setProgress(p => ({ ...p, done: p.done + 1 }))
    }

    // Auto-calculate total time if not extracted
    if (!merged.total_time && merged.off_block_time && merged.on_block_time) {
      merged.total_time = calculateTotalTime(merged.off_block_time, merged.on_block_time)
    }

    // departure_airport may be from gendecl — store as both for fallback
    const patch: Partial<WizardData> = {
      aircraft_callsign:      merged.aircraft_callsign      || '',
      aircraft_type:          merged.aircraft_type          || '',
      flight_number:          merged.flight_number          || '',
      date:                   merged.date                   || data.date,
      captain:                merged.captain                || '',
      first_officer:          merged.first_officer          || '',
      departure_airport:      merged.departure_airport      || '',
      arrival_airport:        merged.arrival_airport        || '',
      departure_from_gendecl: merged.departure_airport      || '',
      arrival_from_gendecl:   merged.arrival_airport        || '',
      off_block_time:         merged.off_block_time         || '',
      takeoff_time:           merged.takeoff_time           || '',
      landing_time:           merged.landing_time           || '',
      on_block_time:          merged.on_block_time          || '',
      total_time:             merged.total_time             || '',
    }
    update(patch)
    setAnalyzing(false)

    const fieldsFound = Object.values(merged).filter(Boolean).length
    toast.success(`Found ${fieldsFound} field${fieldsFound !== 1 ? 's' : ''} — please review and confirm`)
    onNext()
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-white">Step 1: Take Photos</h2>
        <p className="text-slate-400 text-sm mt-1">
          Take photos of any cockpit documents — ACARS, GenDecl, MCDU, or anything else.
          AI will figure out the rest. Add as many as you need, then tap <strong className="text-slate-300">Done</strong>.
        </p>
      </div>

      {/* Add photo buttons */}
      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          className="flex-1 border-slate-700 text-slate-300 hover:bg-slate-800 gap-2 h-12"
          onClick={() => cameraRef.current?.click()}
          disabled={analyzing}
        >
          <Camera className="h-5 w-5" />
          Take Photo
        </Button>
        <Button
          type="button"
          variant="outline"
          className="flex-1 border-slate-700 text-slate-300 hover:bg-slate-800 gap-2 h-12"
          onClick={() => fileRef.current?.click()}
          disabled={analyzing}
        >
          <Upload className="h-5 w-5" />
          Upload
        </Button>
        <input
          ref={cameraRef}
          type="file"
          accept="image/*"
          capture="environment"
          multiple
          className="hidden"
          onChange={e => { addFiles(e.target.files); e.target.value = '' }}
        />
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={e => { addFiles(e.target.files); e.target.value = '' }}
        />
      </div>

      {/* Photo grid */}
      {previews.length > 0 ? (
        <div className="space-y-3">
          <p className="text-xs text-slate-500">
            {previews.length} photo{previews.length !== 1 ? 's' : ''} added
            {analyzing && ` — analyzing ${progress.done} / ${progress.total}…`}
          </p>
          <div className="grid grid-cols-3 gap-2">
            {previews.map((src, i) => (
              <div key={i} className="relative rounded-lg overflow-hidden border border-slate-700 bg-slate-800 aspect-square">
                <Image src={src} alt={`Photo ${i + 1}`} fill className="object-cover" />

                {/* Analyzing overlay */}
                {analyzing && !doneIdx.has(i) && (
                  <div className="absolute inset-0 flex items-center justify-center bg-slate-900/70">
                    <Loader2 className="h-5 w-5 text-blue-400 animate-spin" />
                  </div>
                )}
                {analyzing && doneIdx.has(i) && (
                  <div className="absolute inset-0 flex items-center justify-center bg-green-900/60">
                    <CheckCircle2 className="h-6 w-6 text-green-400" />
                  </div>
                )}

                {/* Remove button (hidden while analyzing) */}
                {!analyzing && (
                  <button
                    onClick={() => removePhoto(i)}
                    className="absolute top-1 right-1 p-1 rounded-full bg-slate-900/80 text-slate-300 hover:text-white transition-colors"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}

                <span className="absolute bottom-1 left-1.5 text-xs text-white/70 font-medium drop-shadow">
                  {i + 1}
                </span>
              </div>
            ))}

            {/* Quick-add tile */}
            {!analyzing && (
              <button
                onClick={() => cameraRef.current?.click()}
                className="aspect-square rounded-lg border-2 border-dashed border-slate-700 flex flex-col items-center justify-center gap-1 text-slate-600 hover:border-blue-500/50 hover:text-blue-500/50 transition-colors"
              >
                <ImagePlus className="h-5 w-5" />
                <span className="text-xs">Add</span>
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="border-2 border-dashed border-slate-700 rounded-xl p-10 text-center space-y-2">
          <Camera className="h-8 w-8 text-slate-600 mx-auto" />
          <p className="text-slate-500 text-sm">No photos yet</p>
          <p className="text-slate-600 text-xs">Take photos of ACARS, GenDecl, MCDU or any cockpit document</p>
        </div>
      )}

      {/* Done button */}
      <Button
        className="w-full bg-blue-600 hover:bg-blue-700 gap-2 h-11"
        disabled={data.photos.length === 0 || analyzing}
        onClick={analyzeAll}
      >
        {analyzing ? (
          <><Loader2 className="h-4 w-4 animate-spin" /> Analyzing {progress.done}/{progress.total} photos…</>
        ) : (
          <>Done — Analyze {data.photos.length > 0 ? `${data.photos.length} Photo${data.photos.length !== 1 ? 's' : ''}` : 'Photos'} →</>
        )}
      </Button>

      <div className="text-center">
        <button
          onClick={onSkip}
          disabled={analyzing}
          className="text-sm text-slate-500 hover:text-slate-300 transition-colors underline underline-offset-2"
        >
          Skip photos — enter data manually (simulator / no photos)
        </button>
      </div>
    </div>
  )
}
