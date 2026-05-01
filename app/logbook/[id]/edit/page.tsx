import { createServerSupabaseClient } from '@/lib/supabase-server'
import { redirect, notFound } from 'next/navigation'
import { NavBar } from '@/components/NavBar'
import { EditEntryForm } from '@/components/EditEntryForm'
import { LogbookEntry } from '@/lib/types'

export default async function EditEntryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: entry, error } = await supabase
    .from('logbook_entries')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (error || !entry) notFound()

  return (
    <div className="min-h-screen flex flex-col">
      <NavBar userEmail={user.email ?? ''} />
      <main className="flex-1 p-4 md:p-8 max-w-2xl mx-auto w-full space-y-6">
        <h1 className="text-xl font-bold text-white">Edit Flight Entry</h1>
        <EditEntryForm entry={entry as LogbookEntry} />
      </main>
    </div>
  )
}
