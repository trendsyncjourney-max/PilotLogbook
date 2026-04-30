export interface LogbookEntry {
  id: string
  user_id: string
  date: string
  aircraft_callsign: string
  departure_airport: string
  arrival_airport: string
  pilot_flying: string
  pilot_monitoring: string
  off_block_time: string | null
  takeoff_time: string | null
  landing_time: string | null
  on_block_time: string | null
  total_time: string | null
  created_at: string
}

export interface WizardData {
  // Step 1: Callsign
  aircraft_callsign: string

  // Step 2: General Declaration
  date: string
  pilot1_name: string
  pilot2_name: string
  departure_from_gendecl: string
  arrival_from_gendecl: string

  // Step 3: PF/PM selection
  pilot_flying: string
  pilot_monitoring: string

  // Step 4: MCDU
  departure_airport: string
  arrival_airport: string

  // Step 5: ACARS
  off_block_time: string
  takeoff_time: string
  landing_time: string
  on_block_time: string
  total_time: string
}

export type ExtractionType = 'callsign' | 'gendecl' | 'mcdu' | 'acars'

export interface ExtractionResult {
  success: boolean
  data: Record<string, string>
  error?: string
}
