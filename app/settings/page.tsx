'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { ArrowLeft, Save } from 'lucide-react'
import { toast } from 'sonner'
import { getSettings, saveSettings, UserSettings } from '@/lib/settings'

const AIRCRAFT_TYPES = [
  'A318','A319','A320','A320neo','A321','A321neo','A321XLR',
  'A330-200','A330-300','A330-900neo',
  'A340-300','A340-600',
  'A350-900','A350-1000',
  'A380-800',
  'B737-700','B737-800','B737-900','B737 MAX 8','B737 MAX 9','B737 MAX 10',
  'B747-400','B747-8',
  'B757-200','B757-300',
  'B767-300ER','B767-400ER',
  'B777-200','B777-200ER','B777-300','B777-300ER','B777X',
  'B787-8','B787-9','B787-10',
  'E170','E175','E190','E195','E190-E2','E195-E2',
  'CRJ700','CRJ900','CRJ1000',
  'ATR42','ATR72',
  'DHC-8-400','C919','ARJ21',
]

export default function SettingsPage() {
  const router = useRouter()
  const [form, setForm] = useState<UserSettings>({ selfName: '', defaultAircraftType: '', defaultRole: '' })

  useEffect(() => {
    setForm(getSettings())
  }, [])

  function set(patch: Partial<UserSettings>) {
    setForm(f => ({ ...f, ...patch }))
  }

  function handleSave() {
    saveSettings(form)
    toast.success('Settings saved')
  }

  return (
    <div className="min-h-screen p-4 md:p-8 max-w-lg mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="text-slate-400 hover:text-white transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-xl font-bold text-white">Settings</h1>
      </div>

      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="text-white text-base">Default Values</CardTitle>
          <CardDescription className="text-slate-400 text-sm">
            These pre-fill every new logbook entry. You can always change them in the review step.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">

          <div className="space-y-1.5">
            <Label className="text-slate-300">Your name (used for SELF)</Label>
            <Input
              value={form.selfName}
              onChange={e => set({ selfName: e.target.value })}
              placeholder="e.g. John Smith"
              className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
            />
            <p className="text-xs text-slate-500">Tap SELF in the crew fields to insert this name.</p>
          </div>

          <div className="space-y-1.5">
            <Label className="text-slate-300">Default aircraft type</Label>
            <input
              list="settings-aircraft-types"
              value={form.defaultAircraftType}
              onChange={e => set({ defaultAircraftType: e.target.value })}
              placeholder="e.g. B777-300ER"
              className="w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <datalist id="settings-aircraft-types">
              {AIRCRAFT_TYPES.map(t => <option key={t} value={t} />)}
            </datalist>
            <p className="text-xs text-slate-500">Auto-filled on every new entry.</p>
          </div>

          <div className="space-y-1.5">
            <Label className="text-slate-300">Default role</Label>
            <div className="flex gap-2">
              {(['', 'CN', 'FO'] as const).map(role => (
                <button
                  key={role}
                  onClick={() => set({ defaultRole: role })}
                  className={`flex-1 py-2 rounded-lg border-2 text-sm font-medium transition-all ${
                    form.defaultRole === role
                      ? 'border-blue-500 bg-blue-500/10 text-white'
                      : 'border-slate-700 text-slate-400 hover:border-slate-600'
                  }`}
                >
                  {role === '' ? 'None' : role === 'CN' ? 'Captain (CN)' : 'First Officer (FO)'}
                </button>
              ))}
            </div>
            <p className="text-xs text-slate-500">
              Fills your name into the Captain or First Officer field automatically.
            </p>
          </div>

          <Button
            className="w-full bg-blue-600 hover:bg-blue-700 gap-2"
            onClick={handleSave}
          >
            <Save className="h-4 w-4" />
            Save Settings
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
