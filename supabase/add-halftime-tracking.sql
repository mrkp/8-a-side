-- Add half-time tracking to fixtures table
ALTER TABLE fixtures 
ADD COLUMN IF NOT EXISTS current_half INTEGER DEFAULT 1 CHECK (current_half IN (1, 2)),
ADD COLUMN IF NOT EXISTS half_time_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS second_half_started_at TIMESTAMPTZ;

-- Add half tracking to events table
ALTER TABLE events
ADD COLUMN IF NOT EXISTS half INTEGER DEFAULT 1 CHECK (half IN (1, 2));

-- Update existing events to be in first half
UPDATE events SET half = 1 WHERE half IS NULL;