-- Drop existing tables if they exist
DROP TABLE IF EXISTS events CASCADE;
DROP TABLE IF EXISTS fixtures CASCADE;
DROP TABLE IF EXISTS knockout_bracket CASCADE;

-- Update teams table to include tournament stats
ALTER TABLE teams ADD COLUMN IF NOT EXISTS logo TEXT;
ALTER TABLE teams ADD COLUMN IF NOT EXISTS "group" CHAR(1);
ALTER TABLE teams ADD COLUMN IF NOT EXISTS stats JSONB DEFAULT '{
  "played": 0,
  "won": 0,
  "drawn": 0,
  "lost": 0,
  "gf": 0,
  "ga": 0,
  "gd": 0,
  "points": 0
}'::jsonb;

-- Update players table to include goals and image
ALTER TABLE players ADD COLUMN IF NOT EXISTS goals INTEGER DEFAULT 0;
ALTER TABLE players ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Create fixtures table
CREATE TABLE IF NOT EXISTS fixtures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_a UUID REFERENCES teams(id) ON DELETE CASCADE,
  team_b UUID REFERENCES teams(id) ON DELETE CASCADE,
  date TIMESTAMPTZ NOT NULL,
  venue TEXT,
  status TEXT CHECK (status IN ('upcoming', 'live', 'completed')) DEFAULT 'upcoming',
  score JSONB DEFAULT '{"teamA": 0, "teamB": 0}'::jsonb,
  stage TEXT CHECK (stage IN ('group', 'quarterfinal', 'semifinal', 'final')) DEFAULT 'group',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create events table for match events
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fixture_id UUID REFERENCES fixtures(id) ON DELETE CASCADE,
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  player_id UUID REFERENCES players(id) ON DELETE CASCADE,
  minute INTEGER NOT NULL,
  type TEXT CHECK (type IN ('goal', 'own_goal', 'yellow_card', 'red_card')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create knockout bracket table
CREATE TABLE IF NOT EXISTS knockout_bracket (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stage TEXT CHECK (stage IN ('quarterfinal', 'semifinal', 'final')),
  position INTEGER NOT NULL,
  team_a UUID REFERENCES teams(id),
  team_b UUID REFERENCES teams(id),
  winner UUID REFERENCES teams(id),
  fixture_id UUID REFERENCES fixtures(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_fixtures_date ON fixtures(date);
CREATE INDEX idx_fixtures_status ON fixtures(status);
CREATE INDEX idx_events_fixture ON events(fixture_id);
CREATE INDEX idx_events_player ON events(player_id);

-- Create views
CREATE OR REPLACE VIEW top_scorers AS
SELECT 
  p.id,
  p.name,
  p.rank,
  p.image_url,
  p.goals,
  t.name as team_name,
  t.id as team_id
FROM players p
JOIN teams t ON p.team_id = t.id
WHERE p.goals > 0
ORDER BY p.goals DESC;

-- Create function to update team stats after a match
CREATE OR REPLACE FUNCTION update_team_stats()
RETURNS TRIGGER AS $$
BEGIN
  -- This function will be called after fixtures are updated
  -- to recalculate team statistics
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    -- Update team A stats
    UPDATE teams 
    SET stats = jsonb_build_object(
      'played', (stats->>'played')::int + 1,
      'won', CASE 
        WHEN (NEW.score->>'teamA')::int > (NEW.score->>'teamB')::int 
        THEN (stats->>'won')::int + 1 
        ELSE (stats->>'won')::int 
      END,
      'drawn', CASE 
        WHEN (NEW.score->>'teamA')::int = (NEW.score->>'teamB')::int 
        THEN (stats->>'drawn')::int + 1 
        ELSE (stats->>'drawn')::int 
      END,
      'lost', CASE 
        WHEN (NEW.score->>'teamA')::int < (NEW.score->>'teamB')::int 
        THEN (stats->>'lost')::int + 1 
        ELSE (stats->>'lost')::int 
      END,
      'gf', (stats->>'gf')::int + (NEW.score->>'teamA')::int,
      'ga', (stats->>'ga')::int + (NEW.score->>'teamB')::int,
      'gd', ((stats->>'gf')::int + (NEW.score->>'teamA')::int) - ((stats->>'ga')::int + (NEW.score->>'teamB')::int),
      'points', CASE 
        WHEN (NEW.score->>'teamA')::int > (NEW.score->>'teamB')::int 
        THEN (stats->>'points')::int + 3
        WHEN (NEW.score->>'teamA')::int = (NEW.score->>'teamB')::int 
        THEN (stats->>'points')::int + 1
        ELSE (stats->>'points')::int
      END
    )
    WHERE id = NEW.team_a;

    -- Update team B stats
    UPDATE teams 
    SET stats = jsonb_build_object(
      'played', (stats->>'played')::int + 1,
      'won', CASE 
        WHEN (NEW.score->>'teamB')::int > (NEW.score->>'teamA')::int 
        THEN (stats->>'won')::int + 1 
        ELSE (stats->>'won')::int 
      END,
      'drawn', CASE 
        WHEN (NEW.score->>'teamB')::int = (NEW.score->>'teamA')::int 
        THEN (stats->>'drawn')::int + 1 
        ELSE (stats->>'drawn')::int 
      END,
      'lost', CASE 
        WHEN (NEW.score->>'teamB')::int < (NEW.score->>'teamA')::int 
        THEN (stats->>'lost')::int + 1 
        ELSE (stats->>'lost')::int 
      END,
      'gf', (stats->>'gf')::int + (NEW.score->>'teamB')::int,
      'ga', (stats->>'ga')::int + (NEW.score->>'teamA')::int,
      'gd', ((stats->>'gf')::int + (NEW.score->>'teamB')::int) - ((stats->>'ga')::int + (NEW.score->>'teamA')::int),
      'points', CASE 
        WHEN (NEW.score->>'teamB')::int > (NEW.score->>'teamA')::int 
        THEN (stats->>'points')::int + 3
        WHEN (NEW.score->>'teamB')::int = (NEW.score->>'teamA')::int 
        THEN (stats->>'points')::int + 1
        ELSE (stats->>'points')::int
      END
    )
    WHERE id = NEW.team_b;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updating team stats
CREATE TRIGGER update_team_stats_trigger
AFTER UPDATE ON fixtures
FOR EACH ROW
EXECUTE FUNCTION update_team_stats();

-- Create function to update player goals
CREATE OR REPLACE FUNCTION update_player_goals()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.type IN ('goal', 'own_goal') THEN
    UPDATE players 
    SET goals = goals + 1
    WHERE id = NEW.player_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updating player goals
CREATE TRIGGER update_player_goals_trigger
AFTER INSERT ON events
FOR EACH ROW
EXECUTE FUNCTION update_player_goals();

-- Enable RLS
ALTER TABLE fixtures ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE knockout_bracket ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Public can read fixtures" ON fixtures
  FOR SELECT USING (true);

CREATE POLICY "Public can read events" ON events
  FOR SELECT USING (true);

CREATE POLICY "Public can read knockout bracket" ON knockout_bracket
  FOR SELECT USING (true);

-- Create policies for authenticated write access (for scorers)
CREATE POLICY "Scorers can update fixtures" ON fixtures
  FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Scorers can insert events" ON events
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Scorers can manage knockout bracket" ON knockout_bracket
  FOR ALL USING (auth.uid() IS NOT NULL);