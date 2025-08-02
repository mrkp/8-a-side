-- Fix 35 & Under team rosters - Safe version that adds columns first
-- This script ensures all necessary columns exist before inserting data

-- First, add jersey_number column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'players' AND column_name = 'jersey_number') THEN
    ALTER TABLE players ADD COLUMN jersey_number INTEGER;
    RAISE NOTICE 'Added jersey_number column';
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

-- Add division column to teams if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'teams' AND column_name = 'division') THEN
    ALTER TABLE teams ADD COLUMN division TEXT DEFAULT '35 & Under';
    RAISE NOTICE 'Added division column to teams';
  END IF;
END $$;

-- Update team names to match the fixture data
UPDATE teams SET name = 'Aioli/Spirit Mas' WHERE LOWER(name) = 'aioli';
UPDATE teams SET name = 'WAM' WHERE LOWER(name) = 'wam!';

-- Now proceed with the roster updates
DO $$
DECLARE
  aioli_id UUID;
  wam_id UUID;
  bliss_id UUID;
  fooddrop_id UUID;
  fullbarrel_id UUID;
  minibar_id UUID;
BEGIN
  -- Get team IDs
  SELECT id INTO aioli_id FROM teams WHERE name = 'Aioli/Spirit Mas';
  SELECT id INTO wam_id FROM teams WHERE name = 'WAM';
  SELECT id INTO bliss_id FROM teams WHERE name = 'Bliss';
  SELECT id INTO fooddrop_id FROM teams WHERE name = 'FoodDrop';
  SELECT id INTO fullbarrel_id FROM teams WHERE name = 'Full Barrel';
  SELECT id INTO minibar_id FROM teams WHERE name = 'Mini Bar';

  -- Clear existing players from these teams
  UPDATE players SET team_id = NULL WHERE team_id IN (aioli_id, wam_id, bliss_id, fooddrop_id, fullbarrel_id, minibar_id);
  DELETE FROM players WHERE team_id IN (aioli_id, wam_id, bliss_id, fooddrop_id, fullbarrel_id, minibar_id);

  -- Insert players for Aioli/Spirit Mas
  INSERT INTO players (name, team_id, jersey_number) VALUES
    ('Adrian Almandoz', aioli_id, 7),
    ('Charles Hadden', aioli_id, 11),
    ('Graeme Jones', aioli_id, 1),
    ('John Aboud', aioli_id, 14),
    ('Jordan Weekes', aioli_id, 5),
    ('Kristoff Headly', aioli_id, 3),
    ('Matthew Camacho', aioli_id, 29),
    ('Matthew Clerk', aioli_id, 96),
    ('Myles Yorke', aioli_id, 26),
    ('Romario Gonzales', aioli_id, 17),
    ('Seve Day', aioli_id, 16);
  RAISE NOTICE 'Added % players for Aioli/Spirit Mas', 11;

  -- Insert players for Bliss
  INSERT INTO players (name, team_id, jersey_number) VALUES
    ('Benjamin Decle', bliss_id, 16),
    ('Gary Griffith III', bliss_id, 7),
    ('John De Lima', bliss_id, 22),
    ('Kiel Lopez', bliss_id, 4),
    ('Kristian Bocage', bliss_id, 1),
    ('Peter Sealy II', bliss_id, 14),
    ('Richard Fifi', bliss_id, 17),
    ('Richard Scott', bliss_id, 11),
    ('Rosario Sookdeo', bliss_id, 9),
    ('Scott Fanovich', bliss_id, 12),
    ('Sean De Silva', bliss_id, 10);
  RAISE NOTICE 'Added % players for Bliss', 11;

  -- Insert players for FoodDrop
  INSERT INTO players (name, team_id, jersey_number) VALUES
    ('Christian Landreth-Smith', fooddrop_id, 69),
    ('Brandon Brown', fooddrop_id, 17),
    ('Craig Beepath', fooddrop_id, 21),
    ('Dillion Abraham', fooddrop_id, 7),
    ('Jesu Rampersad', fooddrop_id, 6),
    ('Jordan Vieira', fooddrop_id, 12),
    ('Kwesi Callender', fooddrop_id, 22),
    ('Luke Ramdeen', fooddrop_id, 11),
    ('Paul Fitzwilliam', fooddrop_id, 18),
    ('Ross Darlington', fooddrop_id, 9),
    ('Ross Williams', fooddrop_id, 15),
    ('Tyrese Williams', fooddrop_id, 10);
  RAISE NOTICE 'Added % players for FoodDrop', 12;

  -- Insert players for Full Barrel
  INSERT INTO players (name, team_id, jersey_number) VALUES
    ('Benn Fitzswilliam', fullbarrel_id, 4),
    ('Craig Cockburn', fullbarrel_id, 55),
    ('Dylan Galt', fullbarrel_id, 5),
    ('Jerell Alexander', fullbarrel_id, 20),
    ('Joshua Joseph', fullbarrel_id, 6),
    ('Kyle Mowser', fullbarrel_id, 14),
    ('Rahul Rampersad', fullbarrel_id, 23),
    ('Randy Antoine', fullbarrel_id, 8),
    ('Ryan Mowser', fullbarrel_id, 11),
    ('Sebastian Peterson', fullbarrel_id, 77),
    ('Shirvan Ramdhanie', fullbarrel_id, 22),
    ('Varindra Jagrup', fullbarrel_id, 1);
  RAISE NOTICE 'Added % players for Full Barrel', 12;

  -- Insert players for Mini Bar
  INSERT INTO players (name, team_id, jersey_number) VALUES
    ('Amin Hosein', minibar_id, 19),
    ('Daniel West', minibar_id, 5),
    ('JC Patterson', minibar_id, 12),
    ('John Murray', minibar_id, 7),
    ('John Paul Abraham', minibar_id, 9),
    ('Jonathan Sealy', minibar_id, 14),
    ('Kevin Ferreira', minibar_id, 30),
    ('Kyron Rudd', minibar_id, 18),
    ('Matthew Sealy', minibar_id, 17),
    ('Ryan Daniel', minibar_id, 13),
    ('Shavak Ramberan', minibar_id, 11),
    ('Xavier Jones', minibar_id, 66);
  RAISE NOTICE 'Added % players for Mini Bar', 12;

  -- Insert players for WAM
  INSERT INTO players (name, team_id, jersey_number) VALUES
    ('Aidan Young', wam_id, 19),
    ('Jelani Bynoe', wam_id, 18),
    ('Joel Ogeer', wam_id, 11),
    ('Jonathan Low', wam_id, 10),
    ('Justin Brooks', wam_id, 9),
    ('Keshav Bahadursingh', wam_id, 23),
    ('Luke Darwent', wam_id, 7),
    ('Mark Pereira', wam_id, 17),
    ('Matthew Jardim', wam_id, 22),
    ('Stokeley Smart', wam_id, 8),
    ('Willie Medford', wam_id, 1);
  RAISE NOTICE 'Added % players for WAM', 11;

END $$;

-- Add team logos
UPDATE teams SET logo = '/logos/aioli-spirit-mas.png' WHERE name = 'Aioli/Spirit Mas';
UPDATE teams SET logo = '/logos/wam.png' WHERE name = 'WAM';
UPDATE teams SET logo = '/logos/bliss.png' WHERE name = 'Bliss';
UPDATE teams SET logo = '/logos/fooddrop.png' WHERE name = 'FoodDrop';
UPDATE teams SET logo = '/logos/full-barrel.png' WHERE name = 'Full Barrel';
UPDATE teams SET logo = '/logos/mini-bar.png' WHERE name = 'Mini Bar';

-- Set all active teams to 35 & Under division
UPDATE teams SET division = '35 & Under' WHERE active = true;

-- Create index on jersey numbers
CREATE INDEX IF NOT EXISTS idx_players_jersey_number ON players(team_id, jersey_number);

-- Create or replace the team rosters view
CREATE OR REPLACE VIEW team_rosters AS
SELECT 
  t.id as team_id,
  t.name as team_name,
  t.logo as team_logo,
  t.division,
  p.id as player_id,
  p.name as player_name,
  p.jersey_number,
  p.rank,
  p.position,
  p.is_captain,
  p.is_professional,
  p.goals,
  p.assists
FROM teams t
LEFT JOIN players p ON t.id = p.team_id
WHERE t.active = true
ORDER BY t.name, p.jersey_number NULLS LAST, p.name;

-- Grant permissions
GRANT SELECT ON team_rosters TO anon, authenticated;

-- Verify the rosters
SELECT 'Team rosters summary:' as status;
SELECT 
  t.name as team_name,
  COUNT(p.id) as player_count,
  COUNT(p.jersey_number) as players_with_numbers
FROM teams t
LEFT JOIN players p ON t.id = p.team_id
WHERE t.active = true
GROUP BY t.id, t.name
ORDER BY t.name;

-- Show a few sample players
SELECT 'Sample players (first 10):' as status;
SELECT 
  t.name as team,
  p.name as player,
  p.jersey_number as number
FROM players p
JOIN teams t ON p.team_id = t.id
WHERE t.active = true
ORDER BY t.name, p.jersey_number
LIMIT 10;