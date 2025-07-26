-- Migration to clean up duplicate players and add unique constraint
-- This migration should be run after the main schema.sql

-- Step 1: Find and remove duplicate players, keeping the one with the earliest created_at
WITH duplicates AS (
  SELECT 
    name,
    team_id,
    MIN(created_at) as first_created
  FROM players 
  WHERE team_id IS NOT NULL
  GROUP BY name, team_id 
  HAVING COUNT(*) > 1
),
to_delete AS (
  SELECT p.id
  FROM players p
  INNER JOIN duplicates d ON p.name = d.name AND p.team_id = d.team_id
  WHERE p.created_at > d.first_created
)
DELETE FROM players 
WHERE id IN (SELECT id FROM to_delete);

-- Step 2: Add the unique constraint (if not already added in schema.sql)
-- This will prevent future duplicates
DO $$ 
BEGIN
  -- Check if constraint already exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'players_name_team_id_key' 
    AND table_name = 'players'
  ) THEN
    ALTER TABLE players ADD CONSTRAINT players_name_team_id_key UNIQUE (name, team_id);
  END IF;
END $$;

-- Step 3: Create an index on the unique constraint for better performance
CREATE INDEX IF NOT EXISTS idx_players_name_team_unique ON players(name, team_id);