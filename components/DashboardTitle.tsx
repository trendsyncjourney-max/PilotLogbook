'use client'

import { useEffect, useState } from 'react'
import { getProfile } from '@/lib/profile'

export function DashboardTitle({ flightCount }: { flightCount: number }) {
  const [name, setName] = useState('')

  useEffect(() => {
    const { displayName } = getProfile()
    setName(displayName.trim())
  }, [])

  const title = name ? `${name}'s Logbook` : 'My Logbook'

  return (
    <div>
      <h1 className="text-2xl font-bold text-white tracking-tight">{title}</h1>
      <p className="text-slate-500 text-sm mt-0.5">
        {flightCount} flight{flightCount !== 1 ? 's' : ''} recorded
      </p>
    </div>
  )
}
