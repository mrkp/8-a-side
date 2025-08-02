-- Add player numbers for the 35 & Under teams
-- Based on the fixture data provided

-- First, add jersey_number column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'players' AND column_name = 'jersey_number') THEN
    ALTER TABLE players ADD COLUMN jersey_number INTEGER;
    RAISE NOTICE 'Added jersey_number column';
  END IF;
END $$;

-- Update player numbers based on the fixture data
-- Note: Some names have slight variations in the fixture data vs database
-- Using ILIKE for case-insensitive partial matching

-- Aioli/Spirit Mas Players
UPDATE players SET jersey_number = 21 WHERE LOWER(name) LIKE '%gagan%kataria%' AND team_id = (SELECT id FROM teams WHERE LOWER(name) LIKE '%aioli%' LIMIT 1);
UPDATE players SET jersey_number = 12 WHERE LOWER(name) LIKE '%dominic%chong%' AND team_id = (SELECT id FROM teams WHERE LOWER(name) LIKE '%aioli%' LIMIT 1);
UPDATE players SET jersey_number = 77 WHERE LOWER(name) LIKE '%ihsan%hamoui%' AND team_id = (SELECT id FROM teams WHERE LOWER(name) LIKE '%aioli%' LIMIT 1);
UPDATE players SET jersey_number = 23 WHERE LOWER(name) LIKE '%jesse%persad%' AND team_id = (SELECT id FROM teams WHERE LOWER(name) LIKE '%aioli%' LIMIT 1);
UPDATE players SET jersey_number = 28 WHERE LOWER(name) LIKE '%jesse%lalla%' AND team_id = (SELECT id FROM teams WHERE LOWER(name) LIKE '%aioli%' LIMIT 1);
UPDATE players SET jersey_number = 19 WHERE LOWER(name) LIKE '%adrian%almandoz%' AND team_id = (SELECT id FROM teams WHERE LOWER(name) LIKE '%aioli%' LIMIT 1);
UPDATE players SET jersey_number = 88 WHERE LOWER(name) LIKE '%fazil%salim%' AND team_id = (SELECT id FROM teams WHERE LOWER(name) LIKE '%aioli%' LIMIT 1);
UPDATE players SET jersey_number = 10 WHERE LOWER(name) LIKE '%harr%' AND team_id = (SELECT id FROM teams WHERE LOWER(name) LIKE '%aioli%' LIMIT 1); -- Garvin Harripersad
UPDATE players SET jersey_number = 42 WHERE LOWER(name) LIKE '%hakeem%' AND team_id = (SELECT id FROM teams WHERE LOWER(name) LIKE '%aioli%' LIMIT 1); -- Hakeem Norfus

-- WAM Players
UPDATE players SET jersey_number = 69 WHERE LOWER(name) LIKE '%joshua%mitchell%' AND team_id = (SELECT id FROM teams WHERE LOWER(name) = 'wam!' LIMIT 1);
UPDATE players SET jersey_number = 11 WHERE LOWER(name) LIKE '%joel%' AND team_id = (SELECT id FROM teams WHERE LOWER(name) = 'wam!' LIMIT 1); -- Joel O
UPDATE players SET jersey_number = 10 WHERE LOWER(name) LIKE '%jonathan%low%' AND team_id = (SELECT id FROM teams WHERE LOWER(name) = 'wam!' LIMIT 1);
UPDATE players SET jersey_number = 29 WHERE LOWER(name) LIKE '%kairab%' AND team_id = (SELECT id FROM teams WHERE LOWER(name) = 'wam!' LIMIT 1); -- Kairab Maharaj
UPDATE players SET jersey_number = 9 WHERE LOWER(name) LIKE '%keegan%' AND team_id = (SELECT id FROM teams WHERE LOWER(name) = 'wam!' LIMIT 1); -- Keegan Superville
UPDATE players SET jersey_number = 99 WHERE LOWER(name) LIKE '%kieran%' AND team_id = (SELECT id FROM teams WHERE LOWER(name) = 'wam!' LIMIT 1); -- Kieran Rampersad
UPDATE players SET jersey_number = 20 WHERE LOWER(name) LIKE '%liam%gomez%' AND team_id = (SELECT id FROM teams WHERE LOWER(name) = 'wam!' LIMIT 1);
UPDATE players SET jersey_number = 22 WHERE LOWER(name) LIKE '%justin%pinder%' AND team_id = (SELECT id FROM teams WHERE LOWER(name) = 'wam!' LIMIT 1);
UPDATE players SET jersey_number = 7 WHERE LOWER(name) LIKE '%joshua%joseph%' AND team_id = (SELECT id FROM teams WHERE LOWER(name) = 'wam!' LIMIT 1);

-- Bliss Players
UPDATE players SET jersey_number = 77 WHERE LOWER(name) LIKE '%shane%singh%' AND team_id = (SELECT id FROM teams WHERE LOWER(name) LIKE '%bliss%' LIMIT 1);
UPDATE players SET jersey_number = 30 WHERE LOWER(name) LIKE '%nick%rouse%' AND team_id = (SELECT id FROM teams WHERE LOWER(name) LIKE '%bliss%' LIMIT 1);
UPDATE players SET jersey_number = 14 WHERE LOWER(name) LIKE '%matthew%pantin%' AND team_id = (SELECT id FROM teams WHERE LOWER(name) LIKE '%bliss%' LIMIT 1);
UPDATE players SET jersey_number = 23 WHERE LOWER(name) LIKE '%nathan%duncan%' AND team_id = (SELECT id FROM teams WHERE LOWER(name) LIKE '%bliss%' LIMIT 1);
UPDATE players SET jersey_number = 21 WHERE LOWER(name) LIKE '%stefan%young%' AND team_id = (SELECT id FROM teams WHERE LOWER(name) LIKE '%bliss%' LIMIT 1);
UPDATE players SET jersey_number = 10 WHERE LOWER(name) LIKE '%matisse%' AND team_id = (SELECT id FROM teams WHERE LOWER(name) LIKE '%bliss%' LIMIT 1); -- Matisse Nunes
UPDATE players SET jersey_number = 19 WHERE LOWER(name) LIKE '%sean%de%silva%' AND team_id = (SELECT id FROM teams WHERE LOWER(name) LIKE '%bliss%' LIMIT 1);
UPDATE players SET jersey_number = 13 WHERE LOWER(name) LIKE '%patrick%' AND team_id = (SELECT id FROM teams WHERE LOWER(name) LIKE '%bliss%' LIMIT 1); -- Patrick O'Brien
UPDATE players SET jersey_number = 5 WHERE LOWER(name) LIKE '%richard%' AND team_id = (SELECT id FROM teams WHERE LOWER(name) LIKE '%bliss%' LIMIT 1); -- Richard Fifi

-- Mini Bar Players
UPDATE players SET jersey_number = 7 WHERE LOWER(name) LIKE '%andrew%reyes%' AND team_id = (SELECT id FROM teams WHERE LOWER(name) LIKE '%mini%bar%' LIMIT 1);
UPDATE players SET jersey_number = 33 WHERE LOWER(name) LIKE '%andrew%poon%' AND team_id = (SELECT id FROM teams WHERE LOWER(name) LIKE '%mini%bar%' LIMIT 1);
UPDATE players SET jersey_number = 1 WHERE LOWER(name) LIKE '%ameer%ali%' AND team_id = (SELECT id FROM teams WHERE LOWER(name) LIKE '%mini%bar%' LIMIT 1);
UPDATE players SET jersey_number = 20 WHERE LOWER(name) LIKE '%alistair%' AND team_id = (SELECT id FROM teams WHERE LOWER(name) LIKE '%mini%bar%' LIMIT 1); -- Alistair Bobb
UPDATE players SET jersey_number = 99 WHERE LOWER(name) LIKE '%andrew%de%gannes%' AND team_id = (SELECT id FROM teams WHERE LOWER(name) LIKE '%mini%bar%' LIMIT 1);
UPDATE players SET jersey_number = 6 WHERE LOWER(name) LIKE '%andrew%davis%' AND team_id = (SELECT id FROM teams WHERE LOWER(name) LIKE '%mini%bar%' LIMIT 1);
UPDATE players SET jersey_number = 10 WHERE LOWER(name) LIKE '%andel%' AND team_id = (SELECT id FROM teams WHERE LOWER(name) LIKE '%mini%bar%' LIMIT 1); -- Andel Harley
UPDATE players SET jersey_number = 15 WHERE LOWER(name) LIKE '%andrew%mcburnie%' AND team_id = (SELECT id FROM teams WHERE LOWER(name) LIKE '%mini%bar%' LIMIT 1);
UPDATE players SET jersey_number = 8 WHERE LOWER(name) LIKE '%andrew%jagbir%' AND team_id = (SELECT id FROM teams WHERE LOWER(name) LIKE '%mini%bar%' LIMIT 1);

-- FoodDrop Players
UPDATE players SET jersey_number = 99 WHERE LOWER(name) LIKE '%luke%ramdeen%' AND team_id = (SELECT id FROM teams WHERE LOWER(name) LIKE '%food%drop%' LIMIT 1);
UPDATE players SET jersey_number = 11 WHERE LOWER(name) LIKE '%liam%jarvis%' AND team_id = (SELECT id FROM teams WHERE LOWER(name) LIKE '%food%drop%' LIMIT 1);
UPDATE players SET jersey_number = 21 WHERE LOWER(name) LIKE '%mark%perreira%' AND team_id = (SELECT id FROM teams WHERE LOWER(name) LIKE '%food%drop%' LIMIT 1);
UPDATE players SET jersey_number = 15 WHERE LOWER(name) LIKE '%luke%habib%' AND team_id = (SELECT id FROM teams WHERE LOWER(name) LIKE '%food%drop%' LIMIT 1);
UPDATE players SET jersey_number = 22 WHERE LOWER(name) LIKE '%martin%' AND team_id = (SELECT id FROM teams WHERE LOWER(name) LIKE '%food%drop%' LIMIT 1); -- Martin Seeterram
UPDATE players SET jersey_number = 12 WHERE LOWER(name) LIKE '%lindon%' AND team_id = (SELECT id FROM teams WHERE LOWER(name) LIKE '%food%drop%' LIMIT 1); -- Lindon Ragoonanan
UPDATE players SET jersey_number = 24 WHERE LOWER(name) LIKE '%mario%' AND team_id = (SELECT id FROM teams WHERE LOWER(name) LIKE '%food%drop%' LIMIT 1); -- Mario Pereira
UPDATE players SET jersey_number = 8 WHERE LOWER(name) LIKE '%mark%samaroo%' AND team_id = (SELECT id FROM teams WHERE LOWER(name) LIKE '%food%drop%' LIMIT 1);

-- Full Barrel Players
UPDATE players SET jersey_number = 24 WHERE LOWER(name) LIKE '%uriah%' AND team_id = (SELECT id FROM teams WHERE LOWER(name) LIKE '%full%barrel%' LIMIT 1); -- Uriah Roopnarine
UPDATE players SET jersey_number = 23 WHERE LOWER(name) LIKE '%tommy%' AND team_id = (SELECT id FROM teams WHERE LOWER(name) LIKE '%full%barrel%' LIMIT 1); -- Tommy Dolphy
UPDATE players SET jersey_number = 32 WHERE LOWER(name) LIKE '%william%' AND team_id = (SELECT id FROM teams WHERE LOWER(name) LIKE '%full%barrel%' LIMIT 1); -- William Ramcharan
UPDATE players SET jersey_number = 20 WHERE LOWER(name) LIKE '%vivin%' AND team_id = (SELECT id FROM teams WHERE LOWER(name) LIKE '%full%barrel%' LIMIT 1); -- Vivin Ramoutar
UPDATE players SET jersey_number = 21 WHERE LOWER(name) LIKE '%yanick%' AND team_id = (SELECT id FROM teams WHERE LOWER(name) LIKE '%full%barrel%' LIMIT 1); -- Yanick Ramlal
UPDATE players SET jersey_number = 5 WHERE LOWER(name) LIKE '%timothy%' AND team_id = (SELECT id FROM teams WHERE LOWER(name) LIKE '%full%barrel%' LIMIT 1); -- Timothy Shafique
UPDATE players SET jersey_number = 7 WHERE LOWER(name) LIKE '%david%' AND team_id = (SELECT id FROM teams WHERE LOWER(name) LIKE '%full%barrel%' LIMIT 1); -- David Isava
UPDATE players SET jersey_number = 18 WHERE LOWER(name) LIKE '%yakeem%' AND team_id = (SELECT id FROM teams WHERE LOWER(name) LIKE '%full%barrel%' LIMIT 1); -- Yakeem Mitchell
UPDATE players SET jersey_number = 9 WHERE LOWER(name) LIKE '%yasir%' AND team_id = (SELECT id FROM teams WHERE LOWER(name) LIKE '%full%barrel%' LIMIT 1); -- Yasir Phillip

-- Add any missing players from the fixture data that might not be in the database yet
-- These are players that appeared in the fixture data but might be missing

-- Check and add Kevin for Bliss if not exists
DO $$
DECLARE
  bliss_team_id UUID;
BEGIN
  SELECT id INTO bliss_team_id FROM teams WHERE LOWER(name) LIKE '%bliss%' LIMIT 1;
  
  IF NOT EXISTS (SELECT 1 FROM players WHERE LOWER(name) LIKE '%kevin%' AND team_id = bliss_team_id) THEN
    INSERT INTO players (name, team_id, jersey_number) VALUES ('Kevin', bliss_team_id, 17);
  ELSE
    UPDATE players SET jersey_number = 17 WHERE LOWER(name) LIKE '%kevin%' AND team_id = bliss_team_id;
  END IF;
END $$;

-- Check and add Kiel for Mini Bar if not exists
DO $$
DECLARE
  minibar_team_id UUID;
BEGIN
  SELECT id INTO minibar_team_id FROM teams WHERE LOWER(name) LIKE '%mini%bar%' LIMIT 1;
  
  IF NOT EXISTS (SELECT 1 FROM players WHERE LOWER(name) LIKE '%kiel%' AND team_id = minibar_team_id) THEN
    INSERT INTO players (name, team_id, jersey_number) VALUES ('Kiel', minibar_team_id, 14);
  ELSE
    UPDATE players SET jersey_number = 14 WHERE LOWER(name) LIKE '%kiel%' AND team_id = minibar_team_id;
  END IF;
END $$;

-- Add position column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'players' AND column_name = 'position') THEN
    ALTER TABLE players ADD COLUMN position TEXT;
    RAISE NOTICE 'Added position column';
  END IF;
END $$;

-- Add preferred_positions column for versatile players
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'players' AND column_name = 'preferred_positions') THEN
    ALTER TABLE players ADD COLUMN preferred_positions TEXT[];
    RAISE NOTICE 'Added preferred_positions column';
  END IF;
END $$;

-- Create index on jersey numbers for faster lookups
CREATE INDEX IF NOT EXISTS idx_players_jersey_number ON players(team_id, jersey_number);

-- Verify the updates
SELECT 'Players with jersey numbers by team:' as status;
SELECT 
  t.name as team_name,
  COUNT(*) as total_players,
  COUNT(p.jersey_number) as players_with_numbers
FROM teams t
LEFT JOIN players p ON t.id = p.team_id
WHERE t.active = true
GROUP BY t.id, t.name
ORDER BY t.name;

-- Show sample of players with their numbers
SELECT 'Sample players with numbers:' as status;
SELECT 
  t.name as team,
  p.name as player,
  p.jersey_number as number,
  p.rank
FROM players p
JOIN teams t ON p.team_id = t.id
WHERE p.jersey_number IS NOT NULL
  AND t.active = true
ORDER BY t.name, p.jersey_number
LIMIT 20;