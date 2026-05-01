ALTER TABLE logbook_entries
  ADD COLUMN IF NOT EXISTS takeoff_pilot TEXT,
  ADD COLUMN IF NOT EXISTS landing_pilot TEXT,
  ADD COLUMN IF NOT EXISTS remarks       TEXT;
