import { createServerSupabaseClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import { LogbookTable } from '@/components/LogbookTable'
import { LogbookStats } from '@/components/LogbookStats'
import { NavBar } from '@/components/NavBar'
import { DashboardTitle } from '@/components/DashboardTitle'
import { LogbookEntry } from '@/lib/types'

export default async function DashboardPage() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: entries, error } = await supabase
    .from('logbook_entries')
    .select('*')
    .order('date', { ascending: false })

  const count = entries?.length ?? 0

  return (
    <div className="min-h-screen flex flex-col">
      <NavBar userEmail={user.email ?? ''} />
      <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full space-y-6">

        <DashboardTitle flightCount={count} />

        <LogbookStats entries={(entries as LogbookEntry[]) ?? []} />

        {error && (
          <div className="p-4 rounded-xl bg-red-900/30 border border-red-800 text-red-300 text-sm">
            Failed to load entries: {error.message}
          </div>
        )}

        <LogbookTable entries={(entries as LogbookEntry[]) ?? []} />
      </main>
    </div>
  )
}
