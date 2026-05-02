CREATE TABLE IF NOT EXISTS game_rooms (
  room_code VARCHAR(6) PRIMARY KEY,
  status VARCHAR(20) DEFAULT 'waiting',
  host_id TEXT,
  -- The original room creator; this player can never become a guesser
  first_host_id TEXT,
  -- When true the next newRound keeps the same guesser (host skipped the round)
  round_skipped BOOLEAN DEFAULT FALSE,
  players JSONB DEFAULT '[]'::jsonb,
  current_round JSONB,
  past_rounds JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Enable Row Level Security
ALTER TABLE game_rooms ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows anyone (anonymous users) to do anything
-- This is necessary for a game where users aren't logging in.
DROP POLICY IF EXISTS "Public Access" ON game_rooms;
CREATE POLICY "Public Access" ON game_rooms
  FOR ALL
  TO anon
  USING (true)
  WITH CHECK (true);

-- Turn on Realtime for the game_rooms table (idempotent check)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND tablename = 'game_rooms'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE game_rooms;
  END IF;
END $$;
