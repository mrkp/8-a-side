-- Final fix for Full Barrel team - handling duplicates and constraints

-- First, let's see the current situation
SELECT 'Current Full Barrel/Barrell teams and players:' as status;
SELECT 
  t.id as team_id,
  t.name as team_name,
  COUNT(p.id) as player_count,
  COUNT(p.jersey_number) as players_with_numbers
FROM teams t
LEFT JOIN players p ON t.id = p.team_id
WHERE t.name LIKE '%Full%Barrel%'
GROUP BY t.id, t.name;

-- Update the team name to correct spelling
UPDATE teams 
SET name = 'Full Barrel' 
WHERE name = 'Full Barrell';

-- Now let's see current Full Barrel players
SELECT 'Current Full Barrel players:' as status;
SELECT p.name, p.jersey_number, p.id
FROM players p
JOIN teams t ON p.team_id = t.id
WHERE t.name = 'Full Barrel'
ORDER BY p.name;

-- Update jersey numbers for Full Barrel players
DO $$
DECLARE
  fullbarrel_id UUID;
BEGIN
  -- Get the Full Barrel team ID
  SELECT id INTO fullbarrel_id FROM teams WHERE name = 'Full Barrel';
  
  IF fullbarrel_id IS NULL THEN
    RAISE NOTICE 'Full Barrel team not found!';
    RETURN;
  END IF;

  RAISE NOTICE 'Full Barrel team ID: %', fullbarrel_id;

  -- Update jersey numbers only for players already on Full Barrel team
  UPDATE players 
  SET jersey_number = CASE name
    WHEN 'Varindra Jagrup' THEN 1
    WHEN 'Benn Fitzswilliam' THEN 4
    WHEN 'Dylan Galt' THEN 5
    WHEN 'Joshua Joseph' THEN 6
    WHEN 'Randy Antoine' THEN 8
    WHEN 'Ryan Mowser' THEN 11
    WHEN 'Kyle Mowser' THEN 14
    WHEN 'Jerell Alexander' THEN 20
    WHEN 'Shirvan Ramdhanie' THEN 22
    WHEN 'Rahul Rampersad' THEN 23
    WHEN 'Craig Cockburn' THEN 55
    WHEN 'Sebastian Peterson' THEN 77
  END
  WHERE team_id = fullbarrel_id
  AND name IN (
    'Varindra Jagrup', 'Benn Fitzswilliam', 'Dylan Galt', 'Joshua Joseph',
    'Randy Antoine', 'Ryan Mowser', 'Kyle Mowser', 'Jerell Alexander',
    'Shirvan Ramdhanie', 'Rahul Rampersad', 'Craig Cockburn', 'Sebastian Peterson'
  );

  -- Add only the missing players (those not already on the team)
  INSERT INTO players (name, team_id, jersey_number)
  SELECT name, fullbarrel_id, jersey_number
  FROM (VALUES
    ('Varindra Jagrup', 1),
    ('Benn Fitzswilliam', 4),
    ('Dylan Galt', 5),
    ('Joshua Joseph', 6),
    ('Randy Antoine', 8),
    ('Ryan Mowser', 11),
    ('Kyle Mowser', 14),
    ('Jerell Alexander', 20),
    ('Shirvan Ramdhanie', 22),
    ('Rahul Rampersad', 23),
    ('Craig Cockburn', 55),
    ('Sebastian Peterson', 77)
  ) AS needed(name, jersey_number)
  WHERE NOT EXISTS (
    SELECT 1 FROM players p 
    WHERE p.team_id = fullbarrel_id 
    AND p.name = needed.name
  );

  RAISE NOTICE 'Updated/added Full Barrel players';
END $$;

-- Set the logo
UPDATE teams SET logo = '/logos/full-barrel.png' WHERE name = 'Full Barrel';

-- Remove any players from Full Barrel that aren't in our list of 12
DELETE FROM players 
WHERE team_id = (SELECT id FROM teams WHERE name = 'Full Barrel')
AND name NOT IN (
  'Varindra Jagrup', 'Benn Fitzswilliam', 'Dylan Galt', 'Joshua Joseph',
  'Randy Antoine', 'Ryan Mowser', 'Kyle Mowser', 'Jerell Alexander',
  'Shirvan Ramdhanie', 'Rahul Rampersad', 'Craig Cockburn', 'Sebastian Peterson'
);

-- Final verification
SELECT 'Final Full Barrel roster:' as status;
SELECT 
  p.name,
  p.jersey_number
FROM players p
JOIN teams t ON p.team_id = t.id
WHERE t.name = 'Full Barrel'
ORDER BY p.jersey_number;

-- Summary
SELECT 'Full Barrel final summary:' as status;
SELECT 
  t.name as team,
  COUNT(p.id) as total_players,
  COUNT(p.jersey_number) as players_with_numbers
FROM teams t
LEFT JOIN players p ON t.id = p.team_id
WHERE t.name = 'Full Barrel'
GROUP BY t.id, t.name;

-- Show the roster as it will appear
SELECT 'Roster display:' as status;
SELECT 
  p.name || ' (#' || p.jersey_number || ')' as player
FROM players p
JOIN teams t ON p.team_id = t.id
WHERE t.name = 'Full Barrel'
ORDER BY p.jersey_number;