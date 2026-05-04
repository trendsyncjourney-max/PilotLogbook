'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plane, Eye, EyeOff, Loader2 } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw]     = useState(false)
  const [isSignUp, setIsSignUp] = useState(false)
  const [loading, setLoading]   = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: isSignUp ? 'signup' : 'signin', email, password }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      if (isSignUp) toast.success('Account created!')
      router.push('/dashboard')
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Authentication failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-slate-950">
      {/* Ambient background glows */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(30,64,175,0.25),transparent)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_40%_30%_at_80%_80%,rgba(15,118,110,0.08),transparent)]" />

      <div className="relative w-full max-w-sm space-y-8">

        {/* Logo / hero */}
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-blue-500/20 blur-2xl scale-150" />
              <div className="relative p-4 rounded-2xl bg-gradient-to-br from-blue-600/30 to-blue-900/30 border border-blue-500/30 backdrop-blur-sm shadow-lg shadow-blue-900/20">
                <Plane className="h-10 w-10 text-blue-400" />
              </div>
            </div>
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white">Pilot AI Logbook</h1>
            <p className="text-slate-400 text-sm mt-1.5">AI-powered flight records from cockpit photos</p>
          </div>
        </div>

        {/* Form card */}
        <div className="bg-slate-900/80 backdrop-blur-sm border border-slate-800 rounded-2xl p-6 space-y-5 shadow-2xl shadow-black/50">
          <div>
            <h2 className="text-base font-semibold text-white">
              {isSignUp ? 'Create your account' : 'Welcome back'}
            </h2>
            <p className="text-slate-500 text-xs mt-0.5">
              {isSignUp ? 'Start your digital logbook today' : 'Sign in to access your flight records'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-slate-300 text-sm">Email address</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="pilot@airline.com"
                required
                className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-600 h-11 focus-visible:ring-blue-500/40 focus-visible:border-blue-500"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-slate-300 text-sm">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-600 h-11 pr-10 focus-visible:ring-blue-500/40 focus-visible:border-blue-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                  tabIndex={-1}
                >
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-11 bg-blue-600 hover:bg-blue-500 font-medium gap-2 transition-colors"
              disabled={loading}
            >
              {loading
                ? <><Loader2 className="h-4 w-4 animate-spin" /> Please wait…</>
                : isSignUp ? 'Create account' : 'Sign in'
              }
            </Button>
          </form>

          <div className="border-t border-slate-800 pt-4 text-center">
            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-sm text-slate-500 hover:text-slate-300 transition-colors"
            >
              {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
              <span className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
                {isSignUp ? 'Sign in' : 'Sign up free'}
              </span>
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}
