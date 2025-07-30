-- QPCC Tournament V2 Schema - Safe Version (checks for existing objects)
-- This version won't error if objects already exist

-- 1. Player Votes Table
CREATE TABLE IF NOT EXISTS player_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  voter_id UUID REFERENCES players(id) ON DELETE CASCADE,
  subject_id UUID REFERENCES players(id) ON DELETE CASCADE,
  skill_rating TEXT CHECK (skill_rating IN ('A', 'B', 'C')) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(voter_id, subject_id)
);

-- 2. Update Players Table with new fields
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'players' AND column_name = 'rank_estimate') THEN
    ALTER TABLE players ADD COLUMN rank_estimate TEXT CHECK (rank_estimate IN ('A', 'B', 'C'));
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'players' AND column_name = 'preferred_teammate_id') THEN
    ALTER TABLE players ADD COLUMN preferred_teammate_id UUID REFERENCES players(id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'players' AND column_name = 'is_supplemental') THEN
    ALTER TABLE players ADD COLUMN is_supplemental BOOLEAN DEFAULT FALSE;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'players' AND column_name = 'joined_at') THEN
    ALTER TABLE players ADD COLUMN joined_at TIMESTAMPTZ DEFAULT NOW();
  END IF;
END $$;

-- 3. Update Teams Table with strength score and division
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'teams' AND column_name = 'team_strength_score') THEN
    ALTER TABLE teams ADD COLUMN team_strength_score DECIMAL(3,2) DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'teams' AND column_name = 'division') THEN
    ALTER TABLE teams ADD COLUMN division TEXT DEFAULT 'main';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'teams' AND column_name = 'active') THEN
    ALTER TABLE teams ADD COLUMN active BOOLEAN DEFAULT TRUE;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'teams' AND column_name = 'player_count') THEN
    ALTER TABLE teams ADD COLUMN player_count INTEGER DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'teams' AND column_name = 'dropped_at') THEN
    ALTER TABLE teams ADD COLUMN dropped_at TIMESTAMPTZ;
  END IF;
END $$;

-- 4. Supplemental Players Table
CREATE TABLE IF NOT EXISTS supplemental_players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID REFERENCES players(id) ON DELETE CASCADE UNIQUE,
  rank_estimate TEXT CHECK (rank_estimate IN ('A', 'B', 'C')),
  preferred_teammate_id UUID REFERENCES players(id),
  draft_order INTEGER,
  drafted_to_team_id UUID REFERENCES teams(id),
  drafted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  notes TEXT
);

-- 5. Enhanced Trades Table (drop existing if different structure)
-- First check if trades table exists with old structure
DO $$ 
BEGIN
  -- If trades table exists but doesn't have balance_impact column, drop and recreate
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'trades') AND
     NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'trades' AND column_name = 'balance_impact') THEN
    DROP TABLE trades CASCADE;
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS trades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_from UUID REFERENCES teams(id) NOT NULL,
  team_to UUID REFERENCES teams(id) NOT NULL,
  player_out UUID REFERENCES players(id) NOT NULL,
  player_in UUID REFERENCES players(id),
  status TEXT CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')) DEFAULT 'pending',
  created_by UUID REFERENCES teams(id),
  approved_by TEXT,
  balance_impact DECIMAL(3,2),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  responded_at TIMESTAMPTZ
);

-- 6. Team Requests Table
CREATE TABLE IF NOT EXISTS team_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  request_type TEXT CHECK (request_type IN ('drop', 'division_change', 'player_add')) NOT NULL,
  status TEXT CHECK (status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  processed_at TIMESTAMPTZ,
  processed_by TEXT
);

-- 7. Draft History Table
CREATE TABLE IF NOT EXISTS draft_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID REFERENCES players(id),
  team_id UUID REFERENCES teams(id),
  draft_type TEXT CHECK (draft_type IN ('initial', 'supplemental')) DEFAULT 'supplemental',
  draft_round INTEGER,
  draft_position INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- INDEXES (using IF NOT EXISTS)
CREATE INDEX IF NOT EXISTS idx_player_votes_voter ON player_votes(voter_id);
CREATE INDEX IF NOT EXISTS idx_player_votes_subject ON player_votes(subject_id);
CREATE INDEX IF NOT EXISTS idx_supplemental_players_draft_order ON supplemental_players(draft_order) WHERE drafted_to_team_id IS NULL;
CREATE INDEX IF NOT EXISTS idx_trades_status ON trades(status);
CREATE INDEX IF NOT EXISTS idx_team_requests_status ON team_requests(status);

-- VIEWS (CREATE OR REPLACE)

-- Player ranking summary view
CREATE OR REPLACE VIEW player_rankings AS
SELECT 
  p.id,
  p.name,
  p.team_id,
  p.rank,
  p.rank_estimate,
  COUNT(pv.id) as vote_count,
  MODE() WITHIN GROUP (ORDER BY pv.skill_rating) as voted_rank,
  CASE 
    WHEN COUNT(pv.id) = 0 THEN NULL
    WHEN COUNT(CASE WHEN pv.skill_rating = 'A' THEN 1 END) >= COUNT(pv.id) * 0.5 THEN 'A'
    WHEN COUNT(CASE WHEN pv.skill_rating = 'C' THEN 1 END) >= COUNT(pv.id) * 0.5 THEN 'C'
    ELSE 'B'
  END as calculated_rank
FROM players p
LEFT JOIN player_votes pv ON p.id = pv.subject_id
GROUP BY p.id, p.name, p.team_id, p.rank, p.rank_estimate;

-- Team strength view
CREATE OR REPLACE VIEW team_strength AS
SELECT 
  t.id,
  t.name,
  t.active,
  COUNT(p.id) as player_count,
  AVG(
    CASE 
      WHEN COALESCE(p.rank_estimate, p.rank) = 'A' THEN 1
      WHEN COALESCE(p.rank_estimate, p.rank) = 'B' THEN 2
      WHEN COALESCE(p.rank_estimate, p.rank) = 'C' THEN 3
      ELSE 2.5
    END
  ) as strength_score,
  STRING_AGG(p.name || ' (' || COALESCE(p.rank_estimate, p.rank, 'U') || ')', ', ' ORDER BY p.name) as roster
FROM teams t
LEFT JOIN players p ON t.id = p.team_id
WHERE t.active = true
GROUP BY t.id, t.name, t.active;

-- Supplemental draft order view
CREATE OR REPLACE VIEW supplemental_draft_order AS
WITH team_stats AS (
  SELECT 
    t.id,
    t.name,
    COUNT(p.id) as player_count,
    COALESCE(t.team_strength_score, 2.5) as strength_score
  FROM teams t
  LEFT JOIN players p ON t.id = p.team_id
  WHERE t.active = true
  GROUP BY t.id, t.name, t.team_strength_score
)
SELECT 
  id,
  name,
  player_count,
  strength_score,
  ROW_NUMBER() OVER (
    ORDER BY 
      player_count ASC,
      strength_score DESC
  ) as draft_position
FROM team_stats
ORDER BY draft_position;

-- FUNCTIONS

-- Function to calculate and update team strength scores
CREATE OR REPLACE FUNCTION update_team_strength()
RETURNS void AS $$
BEGIN
  UPDATE teams t
  SET 
    team_strength_score = subq.avg_rank,
    player_count = subq.player_count
  FROM (
    SELECT 
      team_id,
      COUNT(*) as player_count,
      AVG(
        CASE 
          WHEN COALESCE(rank_estimate, rank) = 'A' THEN 1
          WHEN COALESCE(rank_estimate, rank) = 'B' THEN 2
          WHEN COALESCE(rank_estimate, rank) = 'C' THEN 3
          ELSE 2.5
        END
      ) as avg_rank
    FROM players
    WHERE team_id IS NOT NULL
    GROUP BY team_id
  ) subq
  WHERE t.id = subq.team_id;
END;
$$ LANGUAGE plpgsql;

-- Function to process team drop
CREATE OR REPLACE FUNCTION process_team_drop(drop_team_id UUID)
RETURNS void AS $$
BEGIN
  -- Mark team as inactive
  UPDATE teams 
  SET active = false, dropped_at = NOW()
  WHERE id = drop_team_id;
  
  -- Move all players to supplemental pool
  INSERT INTO supplemental_players (player_id, rank_estimate, preferred_teammate_id)
  SELECT id, rank_estimate, preferred_teammate_id
  FROM players
  WHERE team_id = drop_team_id
  ON CONFLICT (player_id) DO NOTHING;
  
  -- Clear team assignment
  UPDATE players
  SET team_id = NULL
  WHERE team_id = drop_team_id;
  
  -- Recalculate all team strengths
  PERFORM update_team_strength();
END;
$$ LANGUAGE plpgsql;

-- TRIGGERS

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS on_player_change ON players;
DROP TRIGGER IF EXISTS on_vote_change ON player_votes;

-- Update team strength when players change
CREATE OR REPLACE FUNCTION trigger_update_team_strength()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM update_team_strength();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_player_change
AFTER INSERT OR UPDATE OR DELETE ON players
FOR EACH STATEMENT
EXECUTE FUNCTION trigger_update_team_strength();

-- Update player rank estimate when votes change
CREATE OR REPLACE FUNCTION update_player_rank_estimate()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE players p
  SET rank_estimate = (
    SELECT 
      CASE 
        WHEN COUNT(pv.id) = 0 THEN p.rank
        WHEN COUNT(CASE WHEN pv.skill_rating = 'A' THEN 1 END) >= COUNT(pv.id) * 0.5 THEN 'A'
        WHEN COUNT(CASE WHEN pv.skill_rating = 'C' THEN 1 END) >= COUNT(pv.id) * 0.5 THEN 'C'
        ELSE 'B'
      END
    FROM player_votes pv
    WHERE pv.subject_id = p.id
  )
  WHERE p.id IN (
    SELECT COALESCE(NEW.subject_id, OLD.subject_id)
  );
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_vote_change
AFTER INSERT OR UPDATE OR DELETE ON player_votes
FOR EACH ROW
EXECUTE FUNCTION update_player_rank_estimate();

-- RLS Policies
ALTER TABLE player_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplemental_players ENABLE ROW LEVEL SECURITY;
ALTER TABLE trades ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE draft_history ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Public read player votes" ON player_votes;
DROP POLICY IF EXISTS "Public write player votes" ON player_votes;
DROP POLICY IF EXISTS "Public read supplemental players" ON supplemental_players;
DROP POLICY IF EXISTS "Public read trades" ON trades;
DROP POLICY IF EXISTS "Public write trades" ON trades;
DROP POLICY IF EXISTS "Public read team requests" ON team_requests;
DROP POLICY IF EXISTS "Public write team requests" ON team_requests;
DROP POLICY IF EXISTS "Public read draft history" ON draft_history;

-- Create policies
CREATE POLICY "Public read player votes" ON player_votes
  FOR SELECT USING (true);

CREATE POLICY "Public write player votes" ON player_votes
  FOR ALL USING (true);

CREATE POLICY "Public read supplemental players" ON supplemental_players
  FOR SELECT USING (true);

CREATE POLICY "Public write supplemental players" ON supplemental_players
  FOR ALL USING (true);

CREATE POLICY "Public read trades" ON trades
  FOR SELECT USING (true);

CREATE POLICY "Public write trades" ON trades
  FOR ALL USING (true);

CREATE POLICY "Public read team requests" ON team_requests
  FOR SELECT USING (true);

CREATE POLICY "Public write team requests" ON team_requests
  FOR ALL USING (true);

CREATE POLICY "Public read draft history" ON draft_history
  FOR SELECT USING (true);

CREATE POLICY "Public write draft history" ON draft_history
  FOR ALL USING (true);

-- Initial team strength calculation
SELECT update_team_strength();