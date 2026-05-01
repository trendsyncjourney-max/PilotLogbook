-- New columns on logbook_entries
ALTER TABLE logbook_entries
  ADD COLUMN IF NOT EXISTS flight_number TEXT,
  ADD COLUMN IF NOT EXISTS aircraft_type  TEXT,
  ADD COLUMN IF NOT EXISTS captain        TEXT,
  ADD COLUMN IF NOT EXISTS first_officer  TEXT;

-- Crew members lookup table
CREATE TABLE IF NOT EXISTS crew_members (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id    UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name       TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, name)
);

ALTER TABLE crew_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "crew_select" ON crew_members FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "crew_insert" ON crew_members FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "crew_delete" ON crew_members FOR DELETE USING (auth.uid() = user_id);
