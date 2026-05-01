import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export async function POST(request: NextRequest) {
  const { action, email, password } = await request.json()
  const supabase = await createServerSupabaseClient()

  if (action === 'signup') {
    const { error } = await supabase.auth.signUp({ email, password })
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    // Sign in immediately after signup so session is set
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })
    if (signInError) return NextResponse.json({ error: signInError.message }, { status: 400 })
    return NextResponse.json({ success: true })
  }

  if (action === 'signin') {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ success: true })
  }

  if (action === 'signout') {
    await supabase.auth.signOut()
    return NextResponse.json({ success: true })
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
}
