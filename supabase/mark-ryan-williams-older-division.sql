-- Alternative approach: Mark Ryan Williams as belonging to older division instead of deleting
-- This preserves the record but excludes him from younger division activities

-- First check if division column exists on players table
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'players' AND column_name = 'division') THEN
    ALTER TABLE players ADD COLUMN division TEXT DEFAULT 'younger' CHECK (division IN ('younger', 'older'));
  END IF;
END $$;

-- Find and update Ryan Williams
DO $$
DECLARE
  ryan_id UUID;
  ryan_name TEXT;
BEGIN
  -- Find Ryan Williams
  SELECT id, name 
  INTO ryan_id, ryan_name
  FROM players 
  WHERE LOWER(name) LIKE '%ryan%williams%' OR LOWER(name) LIKE '%ryan williams%'
  LIMIT 1;
  
  IF ryan_id IS NOT NULL THEN
    RAISE NOTICE 'Found player: % with ID: %', ryan_name, ryan_id;
    
    -- Mark as older division
    UPDATE players 
    SET division = 'older'
    WHERE id = ryan_id;
    
    -- Remove from younger division supplemental pool
    DELETE FROM supplemental_players WHERE player_id = ryan_id;
    
    -- Clear any younger division team assignment
    UPDATE players 
    SET team_id = NULL 
    WHERE id = ryan_id;
    
    RAISE NOTICE 'Ryan Williams has been marked as older division player and removed from younger division activities';
  ELSE
    RAISE NOTICE 'Ryan Williams not found in the database';
  END IF;
END $$;

-- Update views to exclude older division players
CREATE OR REPLACE VIEW younger_division_players AS
SELECT * FROM players 
WHERE division = 'younger' OR division IS NULL;

-- Show all players with their divisions
SELECT 
  name,
  division,
  CASE 
    WHEN division = 'older' THEN 'OLDER DIVISION (36-45)'
    WHEN division = 'younger' THEN 'YOUNGER DIVISION'
    ELSE 'YOUNGER DIVISION (DEFAULT)'
  END as division_label
FROM players
WHERE LOWER(name) LIKE '%ryan%' OR division = 'older'
ORDER BY division, name;