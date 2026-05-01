import { APP_VERSION, LAST_UPDATED } from '@/lib/version'
import { Plane } from 'lucide-react'

export function AppFooter() {
  return (
    <footer className="border-t border-slate-800/60 bg-slate-950 mt-auto py-4 px-4 md:px-8">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-600">
        <div className="flex items-center gap-1.5">
          <Plane className="h-3 w-3" />
          <span className="font-medium text-slate-500">Pilot AI Logbook</span>
        </div>
        <div className="flex items-center gap-3">
          <span>Last updated: {LAST_UPDATED}</span>
          <span className="text-slate-700">·</span>
          <span className="font-mono text-slate-500">v{APP_VERSION}</span>
        </div>
      </div>
    </footer>
  )
}
