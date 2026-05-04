'use client'

import { useEffect } from 'react'
import { getProfile } from '@/lib/profile'

export function ThemeApplier() {
  useEffect(() => {
    const { theme } = getProfile()
    if (theme?.primaryColor) {
      document.documentElement.style.setProperty('--brand-primary', theme.primaryColor)
      document.documentElement.style.setProperty('--brand-accent',  theme.accentColor)
    } else {
      document.documentElement.style.removeProperty('--brand-primary')
      document.documentElement.style.removeProperty('--brand-accent')
    }
  }, [])
  return null
}
