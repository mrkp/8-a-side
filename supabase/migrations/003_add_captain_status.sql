-- Migration to add team captain status
-- This migration adds the is_captain column to track team captains

-- Add the is_captain column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'players' 
    AND column_name = 'is_captain'
  ) THEN
    ALTER TABLE players ADD COLUMN is_captain BOOLEAN DEFAULT FALSE;
  END IF;
END $$;

-- Optional: Ensure only one captain per team
-- This creates a partial unique index that allows only one captain per team
CREATE UNIQUE INDEX IF NOT EXISTS idx_one_captain_per_team 
ON players (team_id) 
WHERE is_captain = TRUE;