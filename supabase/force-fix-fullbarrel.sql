-- Force fix Full Barrel roster with jersey numbers

-- Step 1: Ensure jersey_number column exists
ALTER TABLE players ADD COLUMN IF NOT EXISTS jersey_number INTEGER;

-- Step 2: Get Full Barrel team ID (or create if missing)
DO $$
DECLARE
  fullbarrel_id UUID;
BEGIN
  -- Check if Full Barrel exists
  SELECT id INTO fullbarrel_id FROM teams WHERE name = 'Full Barrel' AND active = true;
  
  IF fullbarrel_id IS NULL THEN
    -- Create Full Barrel team if it doesn't exist
    INSERT INTO teams (name, slug, active, logo)
    VALUES ('Full Barrel', 'full-barrel', true, '/logos/full-barrel.png')
    RETURNING id INTO fullbarrel_id;
    RAISE NOTICE 'Created Full Barrel team with ID: %', fullbarrel_id;
  ELSE
    RAISE NOTICE 'Found Full Barrel team with ID: %', fullbarrel_id;
  END IF;

  -- Step 3: Remove any existing Full Barrel players
  DELETE FROM players WHERE team_id = fullbarrel_id;
  RAISE NOTICE 'Removed existing Full Barrel players';

  -- Step 4: Remove any orphaned players with Full Barrel names
  DELETE FROM players WHERE name IN (
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
  );
  RAISE NOTICE 'Removed orphaned Full Barrel players';

  -- Step 5: Insert all Full Barrel players with jersey numbers
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
  
  RAISE NOTICE 'Inserted 12 Full Barrel players with jersey numbers';
END $$;

-- Step 6: Verify the result
SELECT 'Full Barrel roster after fix:' as status;
SELECT 
  p.name,
  p.jersey_number,
  t.name as team_name
FROM players p
JOIN teams t ON p.team_id = t.id
WHERE t.name = 'Full Barrel'
ORDER BY p.jersey_number;

-- Step 7: Double check the count
SELECT 'Player count:' as status;
SELECT COUNT(*) as total_players
FROM players p
JOIN teams t ON p.team_id = t.id
WHERE t.name = 'Full Barrel';

-- Step 8: Show what will be displayed in the app
SELECT 'Data as it will appear in the app:' as status;
SELECT 
  p.name || ' (#' || COALESCE(p.jersey_number::text, 'NO NUMBER') || ')' as player_display
FROM players p
JOIN teams t ON p.team_id = t.id
WHERE t.name = 'Full Barrel'
ORDER BY p.jersey_number;