-- Complete Tournament V2 Migration
-- This script applies all necessary schema changes and processes team drops

-- Step 1: Apply the safe schema (if not already applied)
-- Check if player_votes table exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'player_votes') THEN
    RAISE NOTICE 'Creating player_votes table...';
    
    CREATE TABLE player_votes (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      voter_id UUID REFERENCES players(id) ON DELETE CASCADE,
      subject_id UUID REFERENCES players(id) ON DELETE CASCADE,
      skill_rating TEXT CHECK (skill_rating IN ('A', 'B', 'C')),
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE(voter_id, subject_id)
    );
    
    CREATE INDEX IF NOT EXISTS idx_player_votes_voter ON player_votes(voter_id);
    CREATE INDEX IF NOT EXISTS idx_player_votes_subject ON player_votes(subject_id);
  ELSE
    RAISE NOTICE 'player_votes table already exists';
  END IF;
END $$;

-- Check if supplemental_players table exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'supplemental_players') THEN
    RAISE NOTICE 'Creating supplemental_players table...';
    
    CREATE TABLE supplemental_players (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      player_id UUID REFERENCES players(id) ON DELETE CASCADE UNIQUE,
      rank_estimate TEXT CHECK (rank_estimate IN ('A', 'B', 'C')),
      preferred_teammate_id UUID REFERENCES players(id),
      draft_order INTEGER,
      drafted_to_team_id UUID REFERENCES teams(id),
      drafted_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
    
    CREATE INDEX IF NOT EXISTS idx_supplemental_players_player ON supplemental_players(player_id);
    CREATE INDEX IF NOT EXISTS idx_supplemental_draft_order ON supplemental_players(draft_order) WHERE drafted_to_team_id IS NULL;
  ELSE
    RAISE NOTICE 'supplemental_players table already exists';
  END IF;
END $$;

-- Add missing columns to existing tables
DO $$
BEGIN
  -- Add columns to teams table
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'teams' AND column_name = 'team_strength_score') THEN
    ALTER TABLE teams ADD COLUMN team_strength_score DECIMAL(3,2) DEFAULT 2.5;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'teams' AND column_name = 'dropped_at') THEN
    ALTER TABLE teams ADD COLUMN dropped_at TIMESTAMPTZ;
  END IF;
  
  -- Add columns to players table
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'players' AND column_name = 'rank_estimate') THEN
    ALTER TABLE players ADD COLUMN rank_estimate TEXT CHECK (rank_estimate IN ('A', 'B', 'C'));
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'players' AND column_name = 'preferred_teammate_id') THEN
    ALTER TABLE players ADD COLUMN preferred_teammate_id UUID REFERENCES players(id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'players' AND column_name = 'voting_completed') THEN
    ALTER TABLE players ADD COLUMN voting_completed BOOLEAN DEFAULT false;
  END IF;
END $$;

-- Create or replace the team strength view
CREATE OR REPLACE VIEW team_strength AS
WITH player_ranks AS (
  SELECT 
    p.team_id,
    p.id,
    p.name,
    COALESCE(p.rank_estimate, p.rank) as effective_rank,
    CASE COALESCE(p.rank_estimate, p.rank)
      WHEN 'A' THEN 1.0
      WHEN 'B' THEN 2.0
      WHEN 'C' THEN 3.0
      ELSE 3.5
    END as rank_value
  FROM players p
  WHERE p.team_id IS NOT NULL
),
team_stats AS (
  SELECT 
    t.id,
    t.name,
    t.active,
    COUNT(pr.id) as player_count,
    COALESCE(AVG(pr.rank_value), 3.5) as avg_rank_value,
    STRING_AGG(pr.name || ' (' || COALESCE(pr.effective_rank, 'U') || ')', ', ' ORDER BY pr.rank_value, pr.name) as roster
  FROM teams t
  LEFT JOIN player_ranks pr ON t.id = pr.team_id
  WHERE t.active = true
  GROUP BY t.id, t.name, t.active
)
SELECT 
  id,
  name,
  active,
  player_count,
  ROUND(avg_rank_value::numeric, 2) as strength_score,
  roster
FROM team_stats
ORDER BY avg_rank_value ASC, name;

-- Create update function for team strength
CREATE OR REPLACE FUNCTION update_team_strength()
RETURNS void AS $$
BEGIN
  UPDATE teams t
  SET team_strength_score = ts.strength_score
  FROM team_strength ts
  WHERE t.id = ts.id;
END;
$$ LANGUAGE plpgsql;

-- Step 2: Process team drops
DO $$
DECLARE
  ready_freddie_id UUID;
  karcher_id UUID;
BEGIN
  -- Find Ready Freddie team
  SELECT id INTO ready_freddie_id
  FROM teams 
  WHERE LOWER(name) LIKE '%ready%freddie%' OR LOWER(name) LIKE '%ready freddie%'
  LIMIT 1;
  
  -- Find Karcher team
  SELECT id INTO karcher_id
  FROM teams 
  WHERE LOWER(name) LIKE '%karcher%'
  LIMIT 1;
  
  -- Process Ready Freddie if found and still active
  IF ready_freddie_id IS NOT NULL AND EXISTS (SELECT 1 FROM teams WHERE id = ready_freddie_id AND active = true) THEN
    RAISE NOTICE 'Processing Ready Freddie team drop...';
    
    -- Mark as inactive
    UPDATE teams 
    SET active = false, dropped_at = NOW()
    WHERE id = ready_freddie_id;
    
    -- Move players to supplemental pool
    INSERT INTO supplemental_players (player_id, rank_estimate, preferred_teammate_id)
    SELECT p.id, p.rank_estimate, p.preferred_teammate_id
    FROM players p
    WHERE p.team_id = ready_freddie_id
    ON CONFLICT (player_id) DO NOTHING;
    
    -- Clear team assignments
    UPDATE players
    SET team_id = NULL
    WHERE team_id = ready_freddie_id;
    
    RAISE NOTICE 'Ready Freddie team dropped successfully';
  END IF;
  
  -- Process Karcher if found and still active
  IF karcher_id IS NOT NULL AND EXISTS (SELECT 1 FROM teams WHERE id = karcher_id AND active = true) THEN
    RAISE NOTICE 'Processing Karcher team drop...';
    
    -- Mark as inactive
    UPDATE teams 
    SET active = false, dropped_at = NOW()
    WHERE id = karcher_id;
    
    -- Move players to supplemental pool
    INSERT INTO supplemental_players (player_id, rank_estimate, preferred_teammate_id)
    SELECT p.id, p.rank_estimate, p.preferred_teammate_id
    FROM players p
    WHERE p.team_id = karcher_id
    ON CONFLICT (player_id) DO NOTHING;
    
    -- Clear team assignments
    UPDATE players
    SET team_id = NULL
    WHERE team_id = karcher_id;
    
    RAISE NOTICE 'Karcher team dropped successfully';
  END IF;
END $$;

-- Step 3: Update team strengths
SELECT update_team_strength();

-- Step 4: Show final status
SELECT 'Active teams after migration:' as status;
SELECT 
  t.name,
  t.active,
  COUNT(p.id) as player_count,
  t.team_strength_score,
  CASE 
    WHEN t.active = false THEN 'DROPPED'
    WHEN COUNT(p.id) < 10 THEN 'NEEDS PLAYERS'
    ELSE 'OK'
  END as status
FROM teams t
LEFT JOIN players p ON t.id = p.team_id
GROUP BY t.id, t.name, t.active, t.team_strength_score
ORDER BY t.active DESC, t.name;

SELECT 'Players available in supplemental pool:' as status;
SELECT COUNT(*) as available_players
FROM supplemental_players sp
WHERE sp.drafted_to_team_id IS NULL;