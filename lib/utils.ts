import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function calculateTotalTime(offBlock: string, onBlock: string): string {
  if (!offBlock || !onBlock) return ''
  const [offH, offM] = offBlock.split(':').map(Number)
  const [onH, onM] = onBlock.split(':').map(Number)
  let totalMinutes = (onH * 60 + onM) - (offH * 60 + offM)
  if (totalMinutes < 0) totalMinutes += 24 * 60
  const h = Math.floor(totalMinutes / 60)
  const m = totalMinutes % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

export function formatTime(time: string | null): string {
  if (!time) return '—'
  return time.substring(0, 5)
}
