-- Safely remove Ready Freddie and Karcher teams from the database
-- This script checks column names before attempting deletion

-- First, show what we're about to remove
SELECT 'Teams to be removed:' as status;
SELECT id, name, slug, active 
FROM teams 
WHERE LOWER(name) LIKE '%ready%freddie%' 
   OR LOWER(name) LIKE '%karcher%'
   OR LOWER(name) LIKE '%ready freddie%';

-- Store team IDs in a temporary table for easier reference
CREATE TEMP TABLE teams_to_remove AS
SELECT id 
FROM teams 
WHERE LOWER(name) LIKE '%ready%freddie%' 
   OR LOWER(name) LIKE '%karcher%'
   OR LOWER(name) LIKE '%ready freddie%';

-- Check if we found any teams
DO $$
DECLARE
  team_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO team_count FROM teams_to_remove;
  
  IF team_count = 0 THEN
    RAISE NOTICE 'No teams found matching Ready Freddie or Karcher - they may have already been removed';
  ELSE
    RAISE NOTICE 'Found % teams to remove', team_count;
  END IF;
END $$;

-- Only proceed if we have teams to remove
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM teams_to_remove) THEN
    -- Delete fixtures involving these teams (if fixtures table exists)
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'fixtures') THEN
      -- Check column names in fixtures table
      IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'fixtures' AND column_name = 'team_a') THEN
        DELETE FROM fixtures 
        WHERE team_a IN (SELECT id FROM teams_to_remove) 
           OR team_b IN (SELECT id FROM teams_to_remove);
        RAISE NOTICE 'Deleted fixtures involving these teams';
      END IF;
    END IF;

    -- Delete trades involving these teams (if trades table exists)
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'trades') THEN
      -- Check which columns exist in trades table
      IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'trades' AND column_name = 'from_team_id') THEN
        DELETE FROM trades 
        WHERE from_team_id IN (SELECT id FROM teams_to_remove) 
           OR to_team_id IN (SELECT id FROM teams_to_remove);
        RAISE NOTICE 'Deleted trades involving these teams';
      ELSIF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'trades' AND column_name = 'proposing_team_id') THEN
        -- Alternative column names
        DELETE FROM trades 
        WHERE proposing_team_id IN (SELECT id FROM teams_to_remove) 
           OR target_team_id IN (SELECT id FROM teams_to_remove);
        RAISE NOTICE 'Deleted trades involving these teams (alt columns)';
      END IF;
    END IF;

    -- Delete trade_players entries (if table exists)
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'trade_players') THEN
      DELETE FROM trade_players
      WHERE trade_id IN (
        SELECT id FROM trades 
        WHERE (EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'trades' AND column_name = 'from_team_id') 
               AND (from_team_id IN (SELECT id FROM teams_to_remove) OR to_team_id IN (SELECT id FROM teams_to_remove)))
           OR (EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'trades' AND column_name = 'proposing_team_id')
               AND (proposing_team_id IN (SELECT id FROM teams_to_remove) OR target_team_id IN (SELECT id FROM teams_to_remove)))
      );
      RAISE NOTICE 'Deleted trade_players entries';
    END IF;

    -- Delete trade history (if table exists)
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'trade_history') THEN
      DELETE FROM trade_history 
      WHERE team_id IN (SELECT id FROM teams_to_remove);
      RAISE NOTICE 'Deleted trade history';
    END IF;

    -- Delete knockout bracket entries (if table exists)
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'knockout_bracket') THEN
      DELETE FROM knockout_bracket 
      WHERE team_a IN (SELECT id FROM teams_to_remove) 
         OR team_b IN (SELECT id FROM teams_to_remove);
      RAISE NOTICE 'Deleted knockout bracket entries';
    END IF;

    -- Finally, delete the teams themselves
    DELETE FROM teams 
    WHERE id IN (SELECT id FROM teams_to_remove);
    RAISE NOTICE 'Deleted teams';
  END IF;
END $$;

-- Clean up
DROP TABLE IF EXISTS teams_to_remove;

-- Verify deletion
SELECT 'Remaining active teams:' as status;
SELECT id, name, slug, active 
FROM teams 
WHERE active = true
ORDER BY name;

-- Show team count
SELECT 'Total active teams: ' || COUNT(*) as team_count
FROM teams 
WHERE active = true;