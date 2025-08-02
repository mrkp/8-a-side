-- Apply supplemental draft results
-- This script updates player team assignments based on the draft picks

-- Full Barrel picks
UPDATE players 
SET team_id = (SELECT id FROM teams WHERE LOWER(name) LIKE '%full%barrel%')
WHERE LOWER(name) IN (
  'galt',
  'ben williams',
  'peterson'
);

-- FoodDrop picks
UPDATE players 
SET team_id = (SELECT id FROM teams WHERE LOWER(name) LIKE '%food%drop%')
WHERE LOWER(name) IN (
  'ross darlington',
  'dillon abraham',
  'tyrese williams'
);

-- Bliss picks
UPDATE players 
SET team_id = (SELECT id FROM teams WHERE LOWER(name) LIKE '%bliss%')
WHERE LOWER(name) IN (
  'scott fanovich',
  'john delima'
);

-- WAM picks
UPDATE players 
SET team_id = (SELECT id FROM teams WHERE LOWER(name) LIKE '%wam%')
WHERE LOWER(name) IN (
  'justin brooks',
  'jelanie bynoe'
);

-- Aioli picks
UPDATE players 
SET team_id = (SELECT id FROM teams WHERE LOWER(name) LIKE '%aioli%')
WHERE LOWER(name) IN (
  'charles hadden',
  'kristoff headly'
);

-- Minibar picks
UPDATE players 
SET team_id = (SELECT id FROM teams WHERE LOWER(name) LIKE '%minibar%')
WHERE LOWER(name) IN (
  'john murray',
  'paul fitz',
  'jp abraham'
);

-- Also update supplemental_players table to mark them as drafted
UPDATE supplemental_players sp
SET 
  drafted_to_team_id = p.team_id,
  drafted_at = NOW()
FROM players p
WHERE sp.player_id = p.id
AND p.team_id IS NOT NULL
AND sp.drafted_to_team_id IS NULL;

-- Verify the updates
SELECT 
  t.name as team_name,
  COUNT(p.id) as player_count,
  STRING_AGG(p.name, ', ' ORDER BY p.name) as players
FROM teams t
LEFT JOIN players p ON t.id = p.team_id
WHERE t.active = true
GROUP BY t.id, t.name
ORDER BY t.name;