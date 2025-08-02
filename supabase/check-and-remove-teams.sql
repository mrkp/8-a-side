-- First, let's check the actual structure of the trades table
SELECT 'Checking trades table structure:' as status;
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'trades' 
ORDER BY ordinal_position;

-- Check if Ready Freddie and Karcher exist
SELECT 'Teams to potentially remove:' as status;
SELECT id, name, slug, active 
FROM teams 
WHERE LOWER(name) LIKE '%ready%freddie%' 
   OR LOWER(name) LIKE '%karcher%'
   OR LOWER(name) LIKE '%ready freddie%';

-- If you want to just mark them as inactive instead of deleting
-- This is safer and preserves history
UPDATE teams 
SET active = false
WHERE LOWER(name) LIKE '%ready%freddie%' 
   OR LOWER(name) LIKE '%karcher%'
   OR LOWER(name) LIKE '%ready freddie%';

-- Remove their players from active rosters
UPDATE players 
SET team_id = NULL
WHERE team_id IN (
  SELECT id FROM teams 
  WHERE LOWER(name) LIKE '%ready%freddie%' 
     OR LOWER(name) LIKE '%karcher%'
     OR LOWER(name) LIKE '%ready freddie%'
);

-- Show final status
SELECT 'Active teams remaining:' as status;
SELECT name, 
       (SELECT COUNT(*) FROM players WHERE team_id = teams.id) as player_count
FROM teams 
WHERE active = true
ORDER BY name;

SELECT 'Inactive teams:' as status;
SELECT name, active
FROM teams 
WHERE active = false
ORDER BY name;