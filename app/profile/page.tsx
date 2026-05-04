'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ArrowLeft, Save, Sparkles, Loader2, CheckCircle2, X, UserCircle } from 'lucide-react'
import { toast } from 'sonner'
import { getProfile, saveProfile, UserProfile, AirlineTheme } from '@/lib/profile'

export default function ProfilePage() {
  const router = useRouter()
  const [form, setForm]           = useState<UserProfile>({ displayName: '', airline: '', theme: null })
  const [fetching, setFetching]   = useState(false)
  const [preview, setPreview]     = useState<AirlineTheme | null>(null)
  const [logoError, setLogoError] = useState(false)

  useEffect(() => {
    const p = getProfile()
    setForm(p)
    if (p.theme) setPreview(p.theme)
  }, [])

  function set(patch: Partial<UserProfile>) {
    setForm(f => ({ ...f, ...patch }))
  }

  async function fetchTheme() {
    if (!form.airline.trim()) {
      toast.error('Enter an airline name first')
      return
    }
    setFetching(true)
    setLogoError(false)
    try {
      const res  = await fetch('/api/airline-theme', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ airline: form.airline }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      const theme: AirlineTheme = {
        primaryColor: json.primaryColor,
        accentColor:  json.accentColor,
        logoUrl:      json.logoUrl,
        airlineName:  json.airlineName,
      }
      setPreview(theme)
      toast.success(`Found theme for ${json.airlineName}`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to fetch theme')
    } finally {
      setFetching(false)
    }
  }

  function applyTheme() {
    if (!preview) return
    const updated = { ...form, theme: preview }
    setForm(updated)
    saveProfile(updated)
    // Apply CSS vars immediately
    document.documentElement.style.setProperty('--brand-primary', preview.primaryColor)
    document.documentElement.style.setProperty('--brand-accent',  preview.accentColor)
    toast.success('Theme applied!')
  }

  function removeTheme() {
    const updated = { ...form, theme: null }
    setForm(updated)
    setPreview(null)
    saveProfile(updated)
    document.documentElement.style.removeProperty('--brand-primary')
    document.documentElement.style.removeProperty('--brand-accent')
    toast.success('Theme removed')
  }

  function handleSave() {
    saveProfile(form)
    toast.success('Profile saved')
    router.push('/dashboard')
  }

  const hasAppliedTheme = !!form.theme

  return (
    <div className="min-h-screen p-4 md:p-8 max-w-lg mx-auto space-y-6">

      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="text-slate-400 hover:text-white transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-xl font-bold text-white">Profile</h1>
      </div>

      {/* Avatar / display name */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-slate-800 border border-slate-700">
            <UserCircle className="h-5 w-5 text-slate-400" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-white">Display Name</h2>
            <p className="text-xs text-slate-500">Shown on your dashboard as "[Name]'s Logbook"</p>
          </div>
        </div>
        <div className="space-y-1.5">
          <Label className="text-slate-300 text-sm">Nickname / Name</Label>
          <Input
            value={form.displayName}
            onChange={e => set({ displayName: e.target.value })}
            placeholder="e.g. Alex or Captain Wong"
            className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus-visible:border-blue-500"
          />
        </div>
      </div>

      {/* Airline theme */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
        <div>
          <h2 className="text-sm font-semibold text-white">Airline & Theme</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Enter your airline and we'll find its brand colors and logo to personalise the app.
          </p>
        </div>

        <div className="space-y-1.5">
          <Label className="text-slate-300 text-sm">Airline</Label>
          <div className="flex gap-2">
            <Input
              value={form.airline}
              onChange={e => { set({ airline: e.target.value }); setPreview(null) }}
              placeholder="e.g. Cathay Pacific, Emirates, Jetstar…"
              className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus-visible:border-blue-500 flex-1"
            />
            <Button
              variant="outline"
              className="border-slate-700 text-slate-300 hover:bg-slate-800 gap-1.5 shrink-0"
              onClick={fetchTheme}
              disabled={fetching || !form.airline.trim()}
            >
              {fetching
                ? <Loader2 className="h-4 w-4 animate-spin" />
                : <Sparkles className="h-4 w-4" />}
              {fetching ? 'Finding…' : 'Find Theme'}
            </Button>
          </div>
        </div>

        {/* Theme preview */}
        {preview && (
          <div className="rounded-xl border border-slate-700 overflow-hidden">
            {/* Color bar */}
            <div className="h-2 w-full" style={{ background: `linear-gradient(to right, ${preview.primaryColor}, ${preview.accentColor})` }} />
            <div className="p-4 flex items-center gap-4">
              {/* Logo */}
              <div className="shrink-0 w-12 h-12 rounded-lg bg-white flex items-center justify-center overflow-hidden">
                {!logoError ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={preview.logoUrl}
                    alt={preview.airlineName}
                    className="w-10 h-10 object-contain"
                    onError={() => setLogoError(true)}
                  />
                ) : (
                  <span className="text-xs text-slate-400 font-bold text-center px-1 leading-tight">
                    {preview.airlineName.slice(0, 3).toUpperCase()}
                  </span>
                )}
              </div>
              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-white font-medium text-sm truncate">{preview.airlineName}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="inline-block w-4 h-4 rounded-sm border border-white/20 shrink-0" style={{ background: preview.primaryColor }} />
                  <span className="text-xs text-slate-400 font-mono">{preview.primaryColor}</span>
                  <span className="inline-block w-4 h-4 rounded-sm border border-white/20 shrink-0" style={{ background: preview.accentColor }} />
                  <span className="text-xs text-slate-400 font-mono">{preview.accentColor}</span>
                </div>
              </div>
              {/* Actions */}
              <div className="flex flex-col gap-1.5 shrink-0">
                {!hasAppliedTheme || form.theme?.logoUrl !== preview.logoUrl ? (
                  <Button size="sm" className="h-7 text-xs gap-1 px-3" style={{ background: preview.primaryColor }} onClick={applyTheme}>
                    <CheckCircle2 className="h-3 w-3" /> Apply
                  </Button>
                ) : (
                  <div className="flex items-center gap-1 text-xs text-green-400">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Applied
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {hasAppliedTheme && (
          <button onClick={removeTheme} className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-red-400 transition-colors">
            <X className="h-3.5 w-3.5" /> Remove airline theme
          </button>
        )}
      </div>

      {/* Save */}
      <Button className="w-full bg-blue-600 hover:bg-blue-500 gap-2 h-11" onClick={handleSave}>
        <Save className="h-4 w-4" />
        Save Profile
      </Button>

    </div>
  )
}
