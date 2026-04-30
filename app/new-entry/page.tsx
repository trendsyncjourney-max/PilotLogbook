import { createServerSupabaseClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import { NavBar } from '@/components/NavBar'
import { WizardContainer } from '@/components/wizard/WizardContainer'

export default async function NewEntryPage() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  return (
    <div className="min-h-screen flex flex-col">
      <NavBar userEmail={user.email ?? ''} />
      <main className="flex-1 p-4 md:p-8 max-w-2xl mx-auto w-full">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white">New Flight Entry</h1>
          <p className="text-slate-400 text-sm mt-1">
            Take or upload photos — AI will extract the flight data for you
          </p>
        </div>
        <WizardContainer />
      </main>
    </div>
  )
}
