export const APP_VERSION  = '1.0.0'
export const LAST_UPDATED = '1 May 2026'

export const CHANGELOG: { version: string; date: string; notes: string[] }[] = [
  {
    version: '1.0.0',
    date: '1 May 2026',
    notes: [
      'Free-form photo capture — AI extracts all fields from any cockpit document',
      'General Declaration: Captain (CN) and First Officer (FO) extraction',
      'ACARS: flight number, OUT/OFF/ON/IN times, block time',
      'Separate Takeoff PF and Landing PF per sector',
      'Crew database with SELF shortcut',
      'Aircraft type pre-filled from Settings; 50+ types in datalist',
      'Remarks field with presets (Line Check, Observer, Safety Pilot…)',
      'Edit any submitted entry',
      'Dashboard statistics: 30-day, 90-day, and all-time block hours',
      'Settings page: default name, aircraft type, and role',
      'Manual entry mode (skip photos — for simulators)',
      'CSV export',
    ],
  },
]
