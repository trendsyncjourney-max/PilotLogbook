'use client'

import { useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Camera, Upload, X, Loader2 } from 'lucide-react'
import Image from 'next/image'

interface PhotoUploaderProps {
  label: string
  hint: string
  onImageSelected: (file: File) => void
  isLoading?: boolean
  preview?: string | null
  onClear?: () => void
}

export function PhotoUploader({ label, hint, onImageSelected, isLoading, preview, onClear }: PhotoUploaderProps) {
  const fileRef = useRef<HTMLInputElement>(null)
  const cameraRef = useRef<HTMLInputElement>(null)

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) onImageSelected(file)
  }

  if (preview) {
    return (
      <div className="relative rounded-xl overflow-hidden border border-slate-700 bg-slate-800/50">
        <div className="relative w-full h-56">
          <Image src={preview} alt="Uploaded photo" fill className="object-contain" />
        </div>
        {onClear && !isLoading && (
          <button
            onClick={onClear}
            className="absolute top-2 right-2 p-1.5 rounded-full bg-slate-900/80 text-slate-300 hover:text-white transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        )}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-900/70">
            <div className="flex flex-col items-center gap-2 text-blue-400">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="text-sm font-medium">Analyzing image...</span>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div
        className="border-2 border-dashed border-slate-700 rounded-xl p-8 text-center cursor-pointer hover:border-blue-500/50 hover:bg-blue-500/5 transition-colors"
        onClick={() => fileRef.current?.click()}
      >
        <Upload className="h-8 w-8 text-slate-500 mx-auto mb-3" />
        <p className="text-slate-300 font-medium">{label}</p>
        <p className="text-slate-500 text-sm mt-1">{hint}</p>
      </div>
      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          className="flex-1 border-slate-700 text-slate-300 hover:bg-slate-800 gap-2"
          onClick={() => fileRef.current?.click()}
        >
          <Upload className="h-4 w-4" />
          Upload photo
        </Button>
        <Button
          type="button"
          variant="outline"
          className="flex-1 border-slate-700 text-slate-300 hover:bg-slate-800 gap-2"
          onClick={() => cameraRef.current?.click()}
        >
          <Camera className="h-4 w-4" />
          Take photo
        </Button>
      </div>
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
      <input ref={cameraRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFile} />
    </div>
  )
}
