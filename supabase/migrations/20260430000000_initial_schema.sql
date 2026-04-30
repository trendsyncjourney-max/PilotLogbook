CREATE TABLE IF NOT EXISTS logbook_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  aircraft_callsign TEXT NOT NULL,
  departure_airport TEXT NOT NULL,
  arrival_airport TEXT NOT NULL,
  pilot_flying TEXT NOT NULL,
  pilot_monitoring TEXT NOT NULL,
  off_block_time TIME,
  takeoff_time TIME,
  landing_time TIME,
  on_block_time TIME,
  total_time INTERVAL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE logbook_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own entries" ON logbook_entries
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own entries" ON logbook_entries
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own entries" ON logbook_entries
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own entries" ON logbook_entries
  FOR DELETE USING (auth.uid() = user_id);
