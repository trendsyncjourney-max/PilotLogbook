'use client'

import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Plane, Plus, LogOut } from 'lucide-react'
import Link from 'next/link'

export function NavBar({ userEmail }: { userEmail: string }) {
  const router = useRouter()
  const supabase = createClient()

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
    toast.success('Signed out')
  }

  return (
    <nav className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-sm sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 md:px-8 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Plane className="h-5 w-5 text-blue-400" />
          <span className="font-semibold text-white">Pilot AI Logbook</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-slate-400 text-sm hidden sm:block">{userEmail}</span>
          <Link href="/new-entry">
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700 gap-1.5">
              <Plus className="h-4 w-4" />
              New Entry
            </Button>
          </Link>
          <Button size="sm" variant="ghost" onClick={handleSignOut} className="text-slate-400 hover:text-white gap-1.5">
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:block">Sign out</span>
          </Button>
        </div>
      </div>
    </nav>
  )
}
