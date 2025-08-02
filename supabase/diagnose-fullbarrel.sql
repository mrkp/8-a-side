-- Comprehensive diagnosis of Full Barrel roster issue

-- 1. Check if jersey_number column exists
SELECT 'Column check:' as status;
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'players' 
AND column_name = 'jersey_number';

-- 2. Check Full Barrel team
SELECT 'Full Barrel team:' as status;
SELECT * FROM teams WHERE name = 'Full Barrel';

-- 3. Check all players for Full Barrel
SELECT 'All Full Barrel players:' as status;
SELECT 
  p.id,
  p.name,
  p.jersey_number,
  p.team_id,
  p.created_at
FROM players p
WHERE p.team_id = (SELECT id FROM teams WHERE name = 'Full Barrel')
ORDER BY p.jersey_number NULLS LAST, p.name;

-- 4. Check if there are any players without team assignment but should be Full Barrel
SELECT 'Orphaned players that might be Full Barrel:' as status;
SELECT name, jersey_number, team_id
FROM players
WHERE name IN (
  'Benn Fitzswilliam',
  'Craig Cockburn',
  'Dylan Galt',
  'Jerell Alexander',
  'Joshua Joseph',
  'Kyle Mowser',
  'Rahul Rampersad',
  'Randy Antoine',
  'Ryan Mowser',
  'Sebastian Peterson',
  'Shirvan Ramdhanie',
  'Varindra Jagrup'
)
ORDER BY name;

-- 5. Count total players in system
SELECT 'Total players by team:' as status;
SELECT 
  t.name as team,
  COUNT(p.id) as player_count,
  COUNT(p.jersey_number) as players_with_numbers
FROM teams t
LEFT JOIN players p ON t.id = p.team_id
WHERE t.active = true
GROUP BY t.id, t.name
ORDER BY t.name;