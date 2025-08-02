-- Permanently remove Ready Freddie and Karcher teams from the database
-- This script removes all traces of these teams

-- First, show what we're about to remove
SELECT 'Teams to be removed:' as status;
SELECT id, name, slug, active, dropped_at 
FROM teams 
WHERE LOWER(name) LIKE '%ready%freddie%' 
   OR LOWER(name) LIKE '%karcher%'
   OR LOWER(name) LIKE '%ready freddie%';

-- Show associated data that will be deleted
SELECT 'Associated data that will be deleted:' as status;

-- Fixtures involving these teams
SELECT COUNT(*) as fixture_count, 'fixtures' as data_type
FROM fixtures f
WHERE f.team_a IN (
  SELECT id FROM teams WHERE LOWER(name) LIKE '%ready%freddie%' OR LOWER(name) LIKE '%karcher%'
) OR f.team_b IN (
  SELECT id FROM teams WHERE LOWER(name) LIKE '%ready%freddie%' OR LOWER(name) LIKE '%karcher%'
)
UNION ALL
-- Trades involving these teams
SELECT COUNT(*) as trade_count, 'trades' as data_type
FROM trades t
WHERE t.from_team_id IN (
  SELECT id FROM teams WHERE LOWER(name) LIKE '%ready%freddie%' OR LOWER(name) LIKE '%karcher%'
) OR t.to_team_id IN (
  SELECT id FROM teams WHERE LOWER(name) LIKE '%ready%freddie%' OR LOWER(name) LIKE '%karcher%'
)
UNION ALL
-- Trade history
SELECT COUNT(*) as history_count, 'trade_history' as data_type
FROM trade_history th
WHERE th.team_id IN (
  SELECT id FROM teams WHERE LOWER(name) LIKE '%ready%freddie%' OR LOWER(name) LIKE '%karcher%'
);

-- Delete fixtures involving these teams
DELETE FROM fixtures 
WHERE team_a IN (
  SELECT id FROM teams WHERE LOWER(name) LIKE '%ready%freddie%' OR LOWER(name) LIKE '%karcher%'
) OR team_b IN (
  SELECT id FROM teams WHERE LOWER(name) LIKE '%ready%freddie%' OR LOWER(name) LIKE '%karcher%'
);

-- Delete trades involving these teams
DELETE FROM trades 
WHERE from_team_id IN (
  SELECT id FROM teams WHERE LOWER(name) LIKE '%ready%freddie%' OR LOWER(name) LIKE '%karcher%'
) OR to_team_id IN (
  SELECT id FROM teams WHERE LOWER(name) LIKE '%ready%freddie%' OR LOWER(name) LIKE '%karcher%'
);

-- Delete trade history
DELETE FROM trade_history 
WHERE team_id IN (
  SELECT id FROM teams WHERE LOWER(name) LIKE '%ready%freddie%' OR LOWER(name) LIKE '%karcher%'
);

-- Delete the teams themselves
DELETE FROM teams 
WHERE LOWER(name) LIKE '%ready%freddie%' 
   OR LOWER(name) LIKE '%karcher%'
   OR LOWER(name) LIKE '%ready freddie%';

-- Verify deletion
SELECT 'Remaining active teams:' as status;
SELECT id, name, slug, active 
FROM teams 
WHERE active = true
ORDER BY name;

-- Update any stored procedures or views that might reference team count
-- The views will automatically reflect the new team count since they query the teams table dynamically