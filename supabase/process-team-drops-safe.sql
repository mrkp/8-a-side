-- Process Ready Freddie and Karcher team drops
-- Safe version that checks before processing

-- First, let's see which teams are Ready Freddie and Karcher
SELECT id, name, slug, active FROM teams 
WHERE LOWER(name) LIKE '%ready%freddie%' 
   OR LOWER(name) LIKE '%karcher%'
   OR LOWER(name) LIKE '%ready freddie%';

-- Check if these teams are already marked as inactive
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
  IF ready_freddie_id IS NOT NULL THEN
    -- Check if already processed
    IF EXISTS (SELECT 1 FROM teams WHERE id = ready_freddie_id AND active = true) THEN
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
    ELSE
      RAISE NOTICE 'Ready Freddie already processed or not found';
    END IF;
  END IF;
  
  -- Process Karcher if found and still active
  IF karcher_id IS NOT NULL THEN
    -- Check if already processed
    IF EXISTS (SELECT 1 FROM teams WHERE id = karcher_id AND active = true) THEN
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
    ELSE
      RAISE NOTICE 'Karcher already processed or not found';
    END IF;
  END IF;
END $$;

-- Recalculate team strengths
SELECT update_team_strength();

-- Show current team status
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
ORDER BY t.active DESC, player_count ASC;

-- Show players in supplemental pool
SELECT 
  sp.id,
  p.name as player_name,
  COALESCE(p.rank_estimate, p.rank, 'U') as rank,
  pt.name as prefers_teammate,
  sp.draft_order,
  CASE 
    WHEN sp.drafted_to_team_id IS NOT NULL THEN 'DRAFTED'
    ELSE 'AVAILABLE'
  END as status
FROM supplemental_players sp
JOIN players p ON sp.player_id = p.id
LEFT JOIN players pt ON p.preferred_teammate_id = pt.id
ORDER BY 
  CASE WHEN sp.drafted_to_team_id IS NULL THEN 0 ELSE 1 END,
  CASE COALESCE(p.rank_estimate, p.rank)
    WHEN 'A' THEN 1
    WHEN 'B' THEN 2
    WHEN 'C' THEN 3
    ELSE 4
  END,
  p.name;