-- Fix RLS policies to allow public access for the tournament app
-- Since authentication is not required, we'll allow public access to all operations

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Scorers can update fixtures" ON fixtures;
DROP POLICY IF EXISTS "Scorers can insert events" ON events;
DROP POLICY IF EXISTS "Scorers can manage knockout bracket" ON knockout_bracket;

-- Create policies for fixtures table
CREATE POLICY "Public can insert fixtures" ON fixtures
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Public can update fixtures" ON fixtures
  FOR UPDATE USING (true);

CREATE POLICY "Public can delete fixtures" ON fixtures
  FOR DELETE USING (true);

-- Create policies for events table
CREATE POLICY "Public can insert events" ON events
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Public can update events" ON events
  FOR UPDATE USING (true);

CREATE POLICY "Public can delete events" ON events
  FOR DELETE USING (true);

-- Create policies for knockout_bracket table
CREATE POLICY "Public can insert knockout bracket" ON knockout_bracket
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Public can update knockout bracket" ON knockout_bracket
  FOR UPDATE USING (true);

CREATE POLICY "Public can delete knockout bracket" ON knockout_bracket
  FOR DELETE USING (true);

-- Also ensure teams and players tables have proper policies
-- Teams table
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read teams" ON teams
  FOR SELECT USING (true);

CREATE POLICY "Public can update teams" ON teams
  FOR UPDATE USING (true);

-- Players table
ALTER TABLE players ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read players" ON players
  FOR SELECT USING (true);

CREATE POLICY "Public can update players" ON players
  FOR UPDATE USING (true);