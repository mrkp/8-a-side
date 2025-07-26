-- Migration to add professional player status
-- This migration adds the is_professional column to track players currently in professional leagues

-- Add the is_professional column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'players' 
    AND column_name = 'is_professional'
  ) THEN
    ALTER TABLE players ADD COLUMN is_professional BOOLEAN DEFAULT FALSE;
  END IF;
END $$;

-- Optional: Update specific players who are known professionals
-- Example (uncomment and modify as needed):
-- UPDATE players SET is_professional = TRUE WHERE name IN ('Player Name 1', 'Player Name 2');