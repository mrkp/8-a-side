-- Safe fix for Full Barrel team name and roster

-- First, let's see what we have
SELECT 'Current Full Barrel/Barrell teams:' as status;
SELECT id, name, active FROM teams WHERE name LIKE '%Full%Barrel%';

-- Update the team name to correct spelling
UPDATE teams 
SET name = 'Full Barrel' 
WHERE name = 'Full Barrell';

-- Now update the players with jersey numbers
DO $$
DECLARE
  fullbarrel_id UUID;
BEGIN
  -- Get the Full Barrel team ID (now with correct spelling)
  SELECT id INTO fullbarrel_id FROM teams WHERE name = 'Full Barrel';
  
  IF fullbarrel_id IS NULL THEN
    RAISE NOTICE 'Full Barrel team not found!';
    RETURN;
  END IF;

  RAISE NOTICE 'Found Full Barrel team with ID: %', fullbarrel_id;

  -- Update jersey numbers for existing players based on their names
  UPDATE players SET jersey_number = 1 WHERE team_id = fullbarrel_id AND name = 'Varindra Jagrup';
  UPDATE players SET jersey_number = 4 WHERE team_id = fullbarrel_id AND name = 'Benn Fitzswilliam';
  UPDATE players SET jersey_number = 5 WHERE team_id = fullbarrel_id AND name = 'Dylan Galt';
  UPDATE players SET jersey_number = 6 WHERE team_id = fullbarrel_id AND name = 'Joshua Joseph';
  UPDATE players SET jersey_number = 8 WHERE team_id = fullbarrel_id AND name = 'Randy Antoine';
  UPDATE players SET jersey_number = 11 WHERE team_id = fullbarrel_id AND name = 'Ryan Mowser';
  UPDATE players SET jersey_number = 14 WHERE team_id = fullbarrel_id AND name = 'Kyle Mowser';
  UPDATE players SET jersey_number = 20 WHERE team_id = fullbarrel_id AND name = 'Jerell Alexander';
  UPDATE players SET jersey_number = 22 WHERE team_id = fullbarrel_id AND name = 'Shirvan Ramdhanie';
  UPDATE players SET jersey_number = 23 WHERE team_id = fullbarrel_id AND name = 'Rahul Rampersad';
  UPDATE players SET jersey_number = 55 WHERE team_id = fullbarrel_id AND name = 'Craig Cockburn';
  UPDATE players SET jersey_number = 77 WHERE team_id = fullbarrel_id AND name = 'Sebastian Peterson';

  -- Instead of deleting, assign orphaned players to Full Barrel
  UPDATE players 
  SET team_id = fullbarrel_id
  WHERE team_id IS NULL 
  AND name IN (
    'Varindra Jagrup', 'Benn Fitzswilliam', 'Dylan Galt', 'Joshua Joseph',
    'Randy Antoine', 'Ryan Mowser', 'Kyle Mowser', 'Jerell Alexander',
    'Shirvan Ramdhanie', 'Rahul Rampersad', 'Craig Cockburn', 'Sebastian Peterson'
  );

  -- Add missing players only if they don't exist
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
    WHERE p.name = needed.name
  );

  -- Update jersey numbers again for any newly assigned players
  UPDATE players SET jersey_number = 1 WHERE name = 'Varindra Jagrup' AND jersey_number IS NULL;
  UPDATE players SET jersey_number = 4 WHERE name = 'Benn Fitzswilliam' AND jersey_number IS NULL;
  UPDATE players SET jersey_number = 5 WHERE name = 'Dylan Galt' AND jersey_number IS NULL;
  UPDATE players SET jersey_number = 6 WHERE name = 'Joshua Joseph' AND jersey_number IS NULL;
  UPDATE players SET jersey_number = 8 WHERE name = 'Randy Antoine' AND jersey_number IS NULL;
  UPDATE players SET jersey_number = 11 WHERE name = 'Ryan Mowser' AND jersey_number IS NULL;
  UPDATE players SET jersey_number = 14 WHERE name = 'Kyle Mowser' AND jersey_number IS NULL;
  UPDATE players SET jersey_number = 20 WHERE name = 'Jerell Alexander' AND jersey_number IS NULL;
  UPDATE players SET jersey_number = 22 WHERE name = 'Shirvan Ramdhanie' AND jersey_number IS NULL;
  UPDATE players SET jersey_number = 23 WHERE name = 'Rahul Rampersad' AND jersey_number IS NULL;
  UPDATE players SET jersey_number = 55 WHERE name = 'Craig Cockburn' AND jersey_number IS NULL;
  UPDATE players SET jersey_number = 77 WHERE name = 'Sebastian Peterson' AND jersey_number IS NULL;

  RAISE NOTICE 'Updated Full Barrel players with jersey numbers';
END $$;

-- Set the logo
UPDATE teams SET logo = '/logos/full-barrel.png' WHERE name = 'Full Barrel';

-- Remove any duplicate players (keep the one with jersey number)
DELETE FROM players p1
WHERE EXISTS (
  SELECT 1 FROM players p2
  WHERE p1.name = p2.name
  AND p1.team_id = p2.team_id
  AND p1.id != p2.id
  AND (p1.jersey_number IS NULL OR (p2.jersey_number IS NOT NULL AND p1.id > p2.id))
);

-- Verify the final result
SELECT 'Final Full Barrel roster:' as status;
SELECT 
  p.name,
  p.jersey_number,
  t.name as team
FROM players p
JOIN teams t ON p.team_id = t.id
WHERE t.name = 'Full Barrel'
ORDER BY p.jersey_number;

-- Count check
SELECT 'Full Barrel summary:' as status;
SELECT 
  t.name as team,
  COUNT(DISTINCT p.name) as total_players,
  COUNT(p.jersey_number) as players_with_numbers,
  array_agg(DISTINCT p.name || ' (#' || COALESCE(p.jersey_number::text, 'N/A') || ')' ORDER BY p.name) as roster
FROM teams t
LEFT JOIN players p ON t.id = p.team_id
WHERE t.name = 'Full Barrel'
GROUP BY t.id, t.name;