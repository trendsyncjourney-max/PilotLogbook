'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Plane, Plus, LogOut, Settings, UserCircle } from 'lucide-react'
import Link from 'next/link'
import { getProfile, AirlineTheme } from '@/lib/profile'

export function NavBar({ userEmail }: { userEmail: string }) {
  const router = useRouter()
  const [theme, setTheme]         = useState<AirlineTheme | null>(null)
  const [logoError, setLogoError] = useState(false)

  useEffect(() => {
    setTheme(getProfile().theme)
  }, [])

  async function handleSignOut() {
    await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'signout' }),
    })
    router.push('/login')
    router.refresh()
    toast.success('Signed out')
  }

  return (
    <nav className="border-b border-slate-800/60 bg-slate-950/95 backdrop-blur-md sticky top-0 z-10">

      {/* Airline accent stripe */}
      {theme && (
        <div
          className="h-1 w-full"
          style={{ background: `linear-gradient(to right, ${theme.primaryColor}, ${theme.accentColor})` }}
        />
      )}

      <div className="max-w-7xl mx-auto px-4 md:px-8 h-14 flex items-center justify-between gap-4">

        {/* ── Brand / Logo ── */}
        <Link href="/dashboard" className="flex items-center gap-3 shrink-0 group">

          {/* Airline logo (prominent) or default plane pill */}
          {theme && !logoError ? (
            <div className="w-9 h-9 rounded-xl bg-white shadow-md flex items-center justify-center overflow-hidden shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={theme.logoUrl}
                alt={theme.airlineName}
                className="w-7 h-7 object-contain"
                onError={() => setLogoError(true)}
              />
            </div>
          ) : (
            <div className="p-2 rounded-xl bg-blue-600/20 border border-blue-500/30 group-hover:bg-blue-600/30 transition-colors shrink-0">
              <Plane className="h-4 w-4 text-blue-400" />
            </div>
          )}

          {/* Text */}
          <div className="hidden sm:flex flex-col leading-tight">
            <span className="font-semibold text-white text-sm">Pilot AI Logbook</span>
            {theme ? (
              <span className="text-xs font-medium" style={{ color: theme.primaryColor }}>
                {theme.airlineName}
              </span>
            ) : (
              <span className="text-xs text-slate-600">Flight Logbook</span>
            )}
          </div>

        </Link>

        {/* ── Actions ── */}
        <div className="flex items-center gap-1.5">
          <span className="text-slate-500 text-xs hidden md:block truncate max-w-48 mr-1">{userEmail}</span>

          <Link href="/new-entry">
            <Button size="sm" className="bg-blue-600 hover:bg-blue-500 gap-1.5 font-medium h-8 px-3 text-xs transition-colors">
              <Plus className="h-3.5 w-3.5" />
              New Entry
            </Button>
          </Link>

          <Link href="/profile">
            <Button size="sm" variant="ghost" className="text-slate-400 hover:text-white hover:bg-slate-800 h-8 w-8 p-0">
              <UserCircle className="h-4 w-4" />
            </Button>
          </Link>

          <Link href="/settings">
            <Button size="sm" variant="ghost" className="text-slate-400 hover:text-white hover:bg-slate-800 h-8 w-8 p-0">
              <Settings className="h-4 w-4" />
            </Button>
          </Link>

          <Button
            size="sm"
            variant="ghost"
            onClick={handleSignOut}
            className="text-slate-400 hover:text-white hover:bg-slate-800 gap-1.5 h-8 px-2"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:block text-xs">Sign out</span>
          </Button>
        </div>

      </div>
    </nav>
  )
}
