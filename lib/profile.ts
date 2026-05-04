export interface AirlineTheme {
  primaryColor: string
  accentColor:  string
  logoUrl:      string
  airlineName:  string
}

export interface UserProfile {
  displayName: string
  airline:     string
  theme:       AirlineTheme | null
}

const KEY = 'pilot-logbook-profile'
const DEFAULTS: UserProfile = { displayName: '', airline: '', theme: null }

export function getProfile(): UserProfile {
  if (typeof window === 'undefined') return DEFAULTS
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? { ...DEFAULTS, ...JSON.parse(raw) } : DEFAULTS
  } catch {
    return DEFAULTS
  }
}

export function saveProfile(p: UserProfile): void {
  localStorage.setItem(KEY, JSON.stringify(p))
}
