-- Check Full Barrel's current roster
SELECT 'Current Full Barrel roster:' as status;
SELECT 
  p.id,
  p.name,
  p.jersey_number,
  p.team_id,
  t.name as team_name
FROM players p
JOIN teams t ON p.team_id = t.id
WHERE t.name = 'Full Barrel'
ORDER BY p.jersey_number NULLS LAST, p.name;

-- Count players
SELECT 'Player count:' as status;
SELECT COUNT(*) as player_count
FROM players p
JOIN teams t ON p.team_id = t.id
WHERE t.name = 'Full Barrel';

-- Check if any Full Barrel players are missing jersey numbers
SELECT 'Players without jersey numbers:' as status;
SELECT p.name 
FROM players p
JOIN teams t ON p.team_id = t.id
WHERE t.name = 'Full Barrel' AND p.jersey_number IS NULL;

-- Verify the team exists and is active
SELECT 'Full Barrel team status:' as status;
SELECT id, name, active, logo 
FROM teams 
WHERE name = 'Full Barrel';