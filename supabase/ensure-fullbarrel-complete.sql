-- Ensure Full Barrel has complete roster with all jersey numbers

-- First check what we currently have
SELECT 'Current Full Barrel players:' as status;
SELECT name, jersey_number FROM players 
WHERE team_id = (SELECT id FROM teams WHERE name = 'Full Barrel')
ORDER BY jersey_number;

-- Get Full Barrel team ID
DO $$
DECLARE
  fullbarrel_id UUID;
BEGIN
  SELECT id INTO fullbarrel_id FROM teams WHERE name = 'Full Barrel';
  
  IF fullbarrel_id IS NULL THEN
    RAISE NOTICE 'Full Barrel team not found!';
    RETURN;
  END IF;

  -- Delete all existing Full Barrel players to start fresh
  DELETE FROM players WHERE team_id = fullbarrel_id;
  RAISE NOTICE 'Cleared existing Full Barrel players';

  -- Insert all 12 Full Barrel players with their jersey numbers
  INSERT INTO players (name, team_id, jersey_number) VALUES
    ('Varindra Jagrup', fullbarrel_id, 1),
    ('Benn Fitzswilliam', fullbarrel_id, 4),
    ('Dylan Galt', fullbarrel_id, 5),
    ('Joshua Joseph', fullbarrel_id, 6),
    ('Randy Antoine', fullbarrel_id, 8),
    ('Ryan Mowser', fullbarrel_id, 11),
    ('Kyle Mowser', fullbarrel_id, 14),
    ('Jerell Alexander', fullbarrel_id, 20),
    ('Shirvan Ramdhanie', fullbarrel_id, 22),
    ('Rahul Rampersad', fullbarrel_id, 23),
    ('Craig Cockburn', fullbarrel_id, 55),
    ('Sebastian Peterson', fullbarrel_id, 77);
  
  RAISE NOTICE 'Added all 12 Full Barrel players with jersey numbers';
END $$;

-- Verify the final roster
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
SELECT 'Total Full Barrel players:' as status, COUNT(*) as count
FROM players p
JOIN teams t ON p.team_id = t.id
WHERE t.name = 'Full Barrel';

-- Also ensure Full Barrel has a logo path set
UPDATE teams 
SET logo = '/logos/full-barrel.png' 
WHERE name = 'Full Barrel';

SELECT 'Full Barrel team info:' as status;
SELECT name, logo, active 
FROM teams 
WHERE name = 'Full Barrel';