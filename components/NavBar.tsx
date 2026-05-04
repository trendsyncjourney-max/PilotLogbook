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
    const { theme } = getProfile()
    setTheme(theme)
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

  const brandColor = theme?.primaryColor ?? '#2563eb'

  return (
    <nav className="border-b border-slate-800/60 bg-slate-950/90 backdrop-blur-md sticky top-0 z-10">
      {/* Airline accent line */}
      {theme && (
        <div className="h-0.5 w-full" style={{ background: `linear-gradient(to right, ${theme.primaryColor}, ${theme.accentColor})` }} />
      )}

      <div className="max-w-7xl mx-auto px-4 md:px-8 h-14 flex items-center justify-between gap-4">

        {/* Brand */}
        <Link href="/dashboard" className="flex items-center gap-2.5 shrink-0 group">
          {/* Airline logo OR default plane icon */}
          <div className="relative shrink-0">
            {theme && !logoError ? (
              <div className="w-7 h-7 rounded-lg bg-white flex items-center justify-center overflow-hidden shadow-sm">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={theme.logoUrl}
                  alt={theme.airlineName}
                  className="w-6 h-6 object-contain"
                  onError={() => setLogoError(true)}
                />
              </div>
            ) : (
              <div
                className="p-1.5 rounded-lg border transition-colors"
                style={{ background: `${brandColor}22`, borderColor: `${brandColor}44` }}
              >
                <Plane className="h-4 w-4" style={{ color: brandColor }} />
              </div>
            )}
          </div>
          <div className="hidden sm:block">
            <span className="font-semibold text-white text-sm leading-none">Pilot AI Logbook</span>
            {theme && (
              <p className="text-xs leading-none mt-0.5" style={{ color: theme.primaryColor }}>
                {theme.airlineName}
              </p>
            )}
          </div>
        </Link>

        {/* Actions */}
        <div className="flex items-center gap-1.5">
          <span className="text-slate-500 text-xs hidden md:block truncate max-w-48 mr-1">{userEmail}</span>

          <Link href="/new-entry">
            <Button
              size="sm"
              className="gap-1.5 font-medium h-8 px-3 text-xs transition-colors"
              style={{ background: brandColor }}
            >
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
