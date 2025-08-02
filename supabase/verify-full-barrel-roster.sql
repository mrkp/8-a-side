-- Verify Full Barrel roster and remove ranks from all players
-- Since this is a roster page, we don't want to show skill rankings

-- First, let's check Full Barrel's current roster
SELECT 'Current Full Barrel roster:' as status;
SELECT 
  p.name,
  p.jersey_number,
  p.rank
FROM players p
JOIN teams t ON p.team_id = t.id
WHERE t.name = 'Full Barrel'
ORDER BY p.jersey_number;

-- Remove all ranks from players (since rankings should only be shown in admin/draft contexts)
UPDATE players SET rank = NULL WHERE rank IS NOT NULL;

-- Verify Full Barrel has the correct players with numbers
SELECT 'Full Barrel roster verification:' as status;
WITH expected_players AS (
  SELECT * FROM (VALUES
    ('Benn Fitzswilliam', 4),
    ('Craig Cockburn', 55),
    ('Dylan Galt', 5),
    ('Jerell Alexander', 20),
    ('Joshua Joseph', 6),
    ('Kyle Mowser', 14),
    ('Rahul Rampersad', 23),
    ('Randy Antoine', 8),
    ('Ryan Mowser', 11),
    ('Sebastian Peterson', 77),
    ('Shirvan Ramdhanie', 22),
    ('Varindra Jagrup', 1)
  ) AS t(name, jersey_number)
)
SELECT 
  e.name as expected_name,
  e.jersey_number as expected_number,
  p.name as actual_name,
  p.jersey_number as actual_number,
  CASE 
    WHEN p.name IS NULL THEN 'MISSING'
    WHEN p.jersey_number != e.jersey_number THEN 'WRONG NUMBER'
    ELSE 'OK'
  END as status
FROM expected_players e
LEFT JOIN players p ON p.name = e.name AND p.team_id = (SELECT id FROM teams WHERE name = 'Full Barrel')
ORDER BY e.jersey_number;

-- Show final roster summary for all teams
SELECT 'Final team roster summary:' as status;
SELECT 
  t.name as team,
  COUNT(p.id) as player_count,
  array_agg(p.name || ' (#' || p.jersey_number || ')' ORDER BY p.jersey_number) as players
FROM teams t
LEFT JOIN players p ON t.id = p.team_id
WHERE t.active = true
GROUP BY t.id, t.name
ORDER BY t.name;