export interface LogbookEntry {
  id: string
  user_id: string
  date: string
  flight_number: string | null
  aircraft_callsign: string
  aircraft_type: string | null
  departure_airport: string
  arrival_airport: string
  captain: string | null
  first_officer: string | null
  pilot_flying: string
  pilot_monitoring: string
  takeoff_pilot: string | null
  landing_pilot: string | null
  off_block_time: string | null
  takeoff_time: string | null
  landing_time: string | null
  on_block_time: string | null
  total_time: string | null
  remarks: string | null
  created_at: string
}

export interface WizardData {
  photos: File[]

  date: string
  flight_number: string
  aircraft_callsign: string
  aircraft_type: string

  captain: string
  first_officer: string
  departure_from_gendecl: string
  arrival_from_gendecl: string

  departure_airport: string
  arrival_airport: string

  pilot_flying: string
  pilot_monitoring: string
  takeoff_pilot: string
  landing_pilot: string

  off_block_time: string
  takeoff_time: string
  landing_time: string
  on_block_time: string
  total_time: string

  remarks: string
}

export interface CrewMember {
  id: string
  name: string
}

export type ExtractionType = 'auto'
