export interface UserSettings {
  selfName:            string
  defaultAircraftType: string
  defaultRole:         'CN' | 'FO' | ''
}

const KEY = 'pilot-logbook-settings'

const DEFAULTS: UserSettings = { selfName: '', defaultAircraftType: '', defaultRole: '' }

export function getSettings(): UserSettings {
  if (typeof window === 'undefined') return DEFAULTS
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? { ...DEFAULTS, ...JSON.parse(raw) } : DEFAULTS
  } catch {
    return DEFAULTS
  }
}

export function saveSettings(s: UserSettings): void {
  localStorage.setItem(KEY, JSON.stringify(s))
}
