-- Apply supplemental draft results with safe name matching
-- This script updates player team assignments based on the draft picks

-- First, let's see what we're working with
SELECT 'Current team rosters before draft:' as status;
SELECT t.name as team, COUNT(p.id) as player_count
FROM teams t
LEFT JOIN players p ON t.id = p.team_id
WHERE t.active = true
GROUP BY t.id, t.name
ORDER BY t.name;

-- Create a temporary table with draft results for safer updates
CREATE TEMP TABLE IF NOT EXISTS draft_results (
  player_name TEXT,
  new_team_name TEXT
);

-- Insert all draft picks
INSERT INTO draft_results (player_name, new_team_name) VALUES
-- Full Barrel picks
('galt', 'Full Barrel'),
('ben williams', 'Full Barrel'),
('peterson', 'Full Barrel'),
-- FoodDrop picks
('ross darlington', 'FoodDrop'),
('dillon abraham', 'FoodDrop'),  -- Note: might be "dillion" in DB
('tyrese williams', 'FoodDrop'),
-- Bliss picks
('scott fanovich', 'Bliss'),
('john delima', 'Bliss'),  -- Note: might be "de lima" in DB
-- WAM picks
('justin brooks', 'WAM'),
('jelanie bynoe', 'WAM'),  -- Note: might be "jelani" in DB
-- Aioli picks
('charles hadden', 'Aioli'),
('kristoff headly', 'Aioli'),
-- Minibar picks
('john murray', 'Minibar'),
('paul fitz', 'Minibar'),  -- Note: might be "fitzwilliams" in DB
('jp abraham', 'Minibar');  -- Note: might be "john paul abraham" in DB

-- Show what will be updated (with fuzzy matching)
SELECT 'Players to be updated:' as status;
SELECT 
  dr.player_name as draft_name,
  p.name as actual_name,
  dr.new_team_name as new_team,
  t_old.name as current_team,
  CASE 
    WHEN p.id IS NULL THEN 'NOT FOUND - CHECK NAME'
    WHEN LOWER(p.name) = LOWER(dr.player_name) THEN 'EXACT MATCH'
    WHEN LOWER(p.name) LIKE '%' || LOWER(dr.player_name) || '%' THEN 'PARTIAL MATCH'
    WHEN LOWER(dr.player_name) LIKE '%' || LOWER(SPLIT_PART(p.name, ' ', 1)) || '%' THEN 'FIRST NAME MATCH'
    ELSE 'FUZZY MATCH'
  END as match_type
FROM draft_results dr
LEFT JOIN players p ON 
  LOWER(p.name) = LOWER(dr.player_name) OR
  LOWER(p.name) LIKE '%' || LOWER(dr.player_name) || '%' OR
  LOWER(dr.player_name) LIKE '%' || LOWER(SPLIT_PART(p.name, ' ', 1)) || '%' OR
  -- Special cases
  (LOWER(dr.player_name) = 'galt' AND LOWER(p.name) LIKE '%galt%') OR
  (LOWER(dr.player_name) = 'peterson' AND LOWER(p.name) LIKE '%peterson%') OR
  (LOWER(dr.player_name) = 'dillon abraham' AND LOWER(p.name) LIKE '%dillion abraham%') OR
  (LOWER(dr.player_name) = 'john delima' AND LOWER(p.name) LIKE '%de lima%') OR
  (LOWER(dr.player_name) = 'jelanie bynoe' AND LOWER(p.name) LIKE '%jelani bynoe%') OR
  (LOWER(dr.player_name) = 'paul fitz' AND LOWER(p.name) LIKE '%fitzwilliams%') OR
  (LOWER(dr.player_name) = 'jp abraham' AND LOWER(p.name) LIKE '%john paul abraham%')
LEFT JOIN teams t_old ON p.team_id = t_old.id
ORDER BY dr.new_team_name, dr.player_name;

-- Perform the updates using better matching
UPDATE players p
SET team_id = t_new.id
FROM draft_results dr
JOIN teams t_new ON LOWER(t_new.name) = LOWER(dr.new_team_name)
WHERE 
  LOWER(p.name) = LOWER(dr.player_name) OR
  LOWER(p.name) LIKE '%' || LOWER(dr.player_name) || '%' OR
  -- Special case matching
  (LOWER(dr.player_name) = 'galt' AND LOWER(p.name) LIKE '%galt%') OR
  (LOWER(dr.player_name) = 'peterson' AND LOWER(p.name) LIKE '%peterson%') OR
  (LOWER(dr.player_name) = 'dillon abraham' AND LOWER(p.name) LIKE '%dillion abraham%') OR
  (LOWER(dr.player_name) = 'john delima' AND LOWER(p.name) LIKE '%de lima%') OR
  (LOWER(dr.player_name) = 'jelanie bynoe' AND LOWER(p.name) LIKE '%jelani bynoe%') OR
  (LOWER(dr.player_name) = 'paul fitz' AND LOWER(p.name) LIKE '%fitzwilliams%') OR
  (LOWER(dr.player_name) = 'jp abraham' AND LOWER(p.name) LIKE '%john paul abraham%');

-- Update supplemental_players table to mark them as drafted
UPDATE supplemental_players sp
SET 
  drafted_to_team_id = p.team_id,
  drafted_at = NOW()
FROM players p
WHERE sp.player_id = p.id
AND p.team_id IS NOT NULL
AND sp.drafted_to_team_id IS NULL;

-- Show final team rosters
SELECT 'Final team rosters after draft:' as status;
SELECT 
  t.name as team,
  COUNT(p.id) as player_count,
  STRING_AGG(p.name, ', ' ORDER BY p.name) as players
FROM teams t
LEFT JOIN players p ON t.id = p.team_id
WHERE t.active = true
GROUP BY t.id, t.name
ORDER BY t.name;

-- Show any players that couldn't be matched
SELECT 'Unmatched draft picks (if any):' as status;
SELECT dr.player_name, dr.new_team_name
FROM draft_results dr
WHERE NOT EXISTS (
  SELECT 1 FROM players p 
  WHERE LOWER(p.name) = LOWER(dr.player_name) OR
        LOWER(p.name) LIKE '%' || LOWER(dr.player_name) || '%' OR
        (LOWER(dr.player_name) = 'galt' AND LOWER(p.name) LIKE '%galt%') OR
        (LOWER(dr.player_name) = 'peterson' AND LOWER(p.name) LIKE '%peterson%') OR
        (LOWER(dr.player_name) = 'dillon abraham' AND LOWER(p.name) LIKE '%dillion abraham%') OR
        (LOWER(dr.player_name) = 'john delima' AND LOWER(p.name) LIKE '%de lima%') OR
        (LOWER(dr.player_name) = 'jelanie bynoe' AND LOWER(p.name) LIKE '%jelani bynoe%') OR
        (LOWER(dr.player_name) = 'paul fitz' AND LOWER(p.name) LIKE '%fitzwilliams%') OR
        (LOWER(dr.player_name) = 'jp abraham' AND LOWER(p.name) LIKE '%john paul abraham%')
);