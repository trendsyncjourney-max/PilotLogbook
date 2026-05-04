'use client'

import { useEffect } from 'react'
import { getProfile } from '@/lib/profile'

// ── Colour helpers ────────────────────────────────────────────────────────────

function hexToRgb(hex: string) {
  const h = hex.replace('#', '')
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
  }
}

function rgbToHex(r: number, g: number, b: number) {
  return '#' + [r, g, b].map(v => Math.round(Math.min(255, Math.max(0, v))).toString(16).padStart(2, '0')).join('')
}

function blend(hex: string, target: { r: number; g: number; b: number }, t: number) {
  const c = hexToRgb(hex)
  return rgbToHex(c.r + (target.r - c.r) * t, c.g + (target.g - c.g) * t, c.b + (target.b - c.b) * t)
}

// Generate a 50–950 palette from a single brand hex
function buildPalette(primary: string): Record<string, string> {
  const white = { r: 255, g: 255, b: 255 }
  const dark  = { r: 15,  g: 23,  b: 42  } // slate-950
  return {
    '--color-blue-50':  blend(primary, white, 0.93),
    '--color-blue-100': blend(primary, white, 0.84),
    '--color-blue-200': blend(primary, white, 0.68),
    '--color-blue-300': blend(primary, white, 0.48),
    '--color-blue-400': blend(primary, white, 0.27),
    '--color-blue-500': blend(primary, white, 0.12),
    '--color-blue-600': primary,
    '--color-blue-700': blend(primary, dark, 0.22),
    '--color-blue-800': blend(primary, dark, 0.44),
    '--color-blue-900': blend(primary, dark, 0.62),
    '--color-blue-950': blend(primary, dark, 0.76),
  }
}

const SHADES = ['50','100','200','300','400','500','600','700','800','900','950']

// ── Component ─────────────────────────────────────────────────────────────────

export function ThemeApplier() {
  useEffect(() => {
    const { theme } = getProfile()
    const root = document.documentElement
    if (theme?.primaryColor) {
      Object.entries(buildPalette(theme.primaryColor)).forEach(([k, v]) => root.style.setProperty(k, v))
    } else {
      SHADES.forEach(s => root.style.removeProperty(`--color-blue-${s}`))
    }
  }, [])
  return null
}
