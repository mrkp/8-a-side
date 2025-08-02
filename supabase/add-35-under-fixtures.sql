-- Add 35 & Under Fixtures to the tournament
-- Based on the user's fixture data, filtering only the 35 & Under age group

-- First, let's check which teams are currently active
SELECT 'Active teams for 35 & Under:' as status;
SELECT id, name FROM teams WHERE active = true ORDER BY name;

-- Create a temporary table to map team names to IDs for easier insertion
WITH team_mapping AS (
  SELECT 
    id,
    CASE 
      WHEN LOWER(name) LIKE '%aioli%' OR LOWER(name) LIKE '%spirit%mas%' THEN 'Aioli/Spirit Mas'
      WHEN LOWER(name) = 'wam' THEN 'WAM'
      WHEN LOWER(name) LIKE '%bliss%' THEN 'Bliss'
      WHEN LOWER(name) LIKE '%mini%bar%' THEN 'Mini Bar'
      WHEN LOWER(name) LIKE '%food%drop%' THEN 'FoodDrop'
      WHEN LOWER(name) LIKE '%full%barrel%' THEN 'Full Barrel'
      ELSE name
    END as match_name
  FROM teams
  WHERE active = true
)
SELECT * FROM team_mapping;

-- Insert 35 & Under fixtures for September 2025
INSERT INTO fixtures (team_a, team_b, date, venue, status, stage) VALUES
-- Week 1: September 2, 2025
((SELECT id FROM teams WHERE LOWER(name) LIKE '%aioli%' OR LOWER(name) LIKE '%spirit%mas%' LIMIT 1), 
 (SELECT id FROM teams WHERE LOWER(name) = 'wam' LIMIT 1), 
 '2025-09-02 18:30:00'::timestamptz, 'Field 1', 'upcoming', 'group'),

((SELECT id FROM teams WHERE LOWER(name) LIKE '%bliss%' LIMIT 1), 
 (SELECT id FROM teams WHERE LOWER(name) LIKE '%mini%bar%' LIMIT 1), 
 '2025-09-02 19:30:00'::timestamptz, 'Field 1', 'upcoming', 'group'),

((SELECT id FROM teams WHERE LOWER(name) LIKE '%food%drop%' LIMIT 1), 
 (SELECT id FROM teams WHERE LOWER(name) LIKE '%full%barrel%' LIMIT 1), 
 '2025-09-02 20:30:00'::timestamptz, 'Field 1', 'upcoming', 'group'),

-- Week 2: September 9, 2025
((SELECT id FROM teams WHERE LOWER(name) = 'wam' LIMIT 1), 
 (SELECT id FROM teams WHERE LOWER(name) LIKE '%bliss%' LIMIT 1), 
 '2025-09-09 18:30:00'::timestamptz, 'Field 1', 'upcoming', 'group'),

((SELECT id FROM teams WHERE LOWER(name) LIKE '%mini%bar%' LIMIT 1), 
 (SELECT id FROM teams WHERE LOWER(name) LIKE '%food%drop%' LIMIT 1), 
 '2025-09-09 19:30:00'::timestamptz, 'Field 1', 'upcoming', 'group'),

((SELECT id FROM teams WHERE LOWER(name) LIKE '%full%barrel%' LIMIT 1), 
 (SELECT id FROM teams WHERE LOWER(name) LIKE '%aioli%' OR LOWER(name) LIKE '%spirit%mas%' LIMIT 1), 
 '2025-09-09 20:30:00'::timestamptz, 'Field 1', 'upcoming', 'group'),

-- Week 3: September 16, 2025
((SELECT id FROM teams WHERE LOWER(name) LIKE '%bliss%' LIMIT 1), 
 (SELECT id FROM teams WHERE LOWER(name) LIKE '%food%drop%' LIMIT 1), 
 '2025-09-16 18:30:00'::timestamptz, 'Field 1', 'upcoming', 'group'),

((SELECT id FROM teams WHERE LOWER(name) LIKE '%full%barrel%' LIMIT 1), 
 (SELECT id FROM teams WHERE LOWER(name) = 'wam' LIMIT 1), 
 '2025-09-16 19:30:00'::timestamptz, 'Field 1', 'upcoming', 'group'),

((SELECT id FROM teams WHERE LOWER(name) LIKE '%aioli%' OR LOWER(name) LIKE '%spirit%mas%' LIMIT 1), 
 (SELECT id FROM teams WHERE LOWER(name) LIKE '%mini%bar%' LIMIT 1), 
 '2025-09-16 20:30:00'::timestamptz, 'Field 1', 'upcoming', 'group'),

-- Week 4: September 23, 2025
((SELECT id FROM teams WHERE LOWER(name) = 'wam' LIMIT 1), 
 (SELECT id FROM teams WHERE LOWER(name) LIKE '%food%drop%' LIMIT 1), 
 '2025-09-23 18:30:00'::timestamptz, 'Field 1', 'upcoming', 'group'),

((SELECT id FROM teams WHERE LOWER(name) LIKE '%mini%bar%' LIMIT 1), 
 (SELECT id FROM teams WHERE LOWER(name) LIKE '%full%barrel%' LIMIT 1), 
 '2025-09-23 19:30:00'::timestamptz, 'Field 1', 'upcoming', 'group'),

((SELECT id FROM teams WHERE LOWER(name) LIKE '%aioli%' OR LOWER(name) LIKE '%spirit%mas%' LIMIT 1), 
 (SELECT id FROM teams WHERE LOWER(name) LIKE '%bliss%' LIMIT 1), 
 '2025-09-23 20:30:00'::timestamptz, 'Field 1', 'upcoming', 'group'),

-- Week 5: September 30, 2025
((SELECT id FROM teams WHERE LOWER(name) LIKE '%bliss%' LIMIT 1), 
 (SELECT id FROM teams WHERE LOWER(name) LIKE '%full%barrel%' LIMIT 1), 
 '2025-09-30 18:30:00'::timestamptz, 'Field 1', 'upcoming', 'group'),

((SELECT id FROM teams WHERE LOWER(name) LIKE '%aioli%' OR LOWER(name) LIKE '%spirit%mas%' LIMIT 1), 
 (SELECT id FROM teams WHERE LOWER(name) LIKE '%food%drop%' LIMIT 1), 
 '2025-09-30 19:30:00'::timestamptz, 'Field 1', 'upcoming', 'group'),

((SELECT id FROM teams WHERE LOWER(name) = 'wam' LIMIT 1), 
 (SELECT id FROM teams WHERE LOWER(name) LIKE '%mini%bar%' LIMIT 1), 
 '2025-09-30 20:30:00'::timestamptz, 'Field 1', 'upcoming', 'group'),

-- Finals Week: October 3, 2025 (Placeholder - will be determined by group stage results)
-- Semi-final 1
(NULL, NULL, '2025-10-03 18:00:00'::timestamptz, 'Field 1', 'upcoming', 'semifinal'),
-- Semi-final 2  
(NULL, NULL, '2025-10-03 19:00:00'::timestamptz, 'Field 1', 'upcoming', 'semifinal'),
-- Final
(NULL, NULL, '2025-10-03 20:00:00'::timestamptz, 'Field 1', 'upcoming', 'final');

-- Verify the fixtures were added
SELECT 'Added fixtures:' as status;
SELECT 
  f.id,
  ta.name as team_a_name,
  tb.name as team_b_name,
  f.date,
  f.venue,
  f.stage
FROM fixtures f
LEFT JOIN teams ta ON f.team_a = ta.id
LEFT JOIN teams tb ON f.team_b = tb.id
WHERE f.date >= '2025-09-01'
ORDER BY f.date;

-- Add helpful note about knockout fixtures
SELECT 'Note: Knockout stage fixtures (semifinals and final) have been created as placeholders. They will need to be updated with the actual teams once the group stage is complete.' as info;

-- Create enhanced fixtures features
-- Add additional columns to fixtures table if they don't exist
DO $$
BEGIN
  -- Add match_report column for post-match summaries
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'fixtures' AND column_name = 'match_report') THEN
    ALTER TABLE fixtures ADD COLUMN match_report TEXT;
    RAISE NOTICE 'Added match_report column';
  END IF;

  -- Add player_of_match column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'fixtures' AND column_name = 'player_of_match') THEN
    ALTER TABLE fixtures ADD COLUMN player_of_match UUID REFERENCES players(id);
    RAISE NOTICE 'Added player_of_match column';
  END IF;

  -- Add weather conditions
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'fixtures' AND column_name = 'weather') THEN
    ALTER TABLE fixtures ADD COLUMN weather TEXT;
    RAISE NOTICE 'Added weather column';
  END IF;

  -- Add attendance count
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'fixtures' AND column_name = 'attendance') THEN
    ALTER TABLE fixtures ADD COLUMN attendance INTEGER;
    RAISE NOTICE 'Added attendance column';
  END IF;

  -- Add referee name
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'fixtures' AND column_name = 'referee') THEN
    ALTER TABLE fixtures ADD COLUMN referee TEXT;
    RAISE NOTICE 'Added referee column';
  END IF;

  -- Add live commentary/notes
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'fixtures' AND column_name = 'live_updates') THEN
    ALTER TABLE fixtures ADD COLUMN live_updates JSONB DEFAULT '[]'::jsonb;
    RAISE NOTICE 'Added live_updates column';
  END IF;
END $$;

-- Create fixture notifications table
CREATE TABLE IF NOT EXISTS fixture_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fixture_id UUID REFERENCES fixtures(id) ON DELETE CASCADE,
  team_id UUID REFERENCES teams(id),
  notification_type TEXT CHECK (notification_type IN ('reminder', 'lineup_due', 'match_start', 'result')),
  scheduled_for TIMESTAMPTZ NOT NULL,
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for notification queries
CREATE INDEX IF NOT EXISTS idx_fixture_notifications_scheduled ON fixture_notifications(scheduled_for) WHERE sent_at IS NULL;

-- Enable RLS on fixture_notifications
ALTER TABLE fixture_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Public can read fixture notifications" ON fixture_notifications
  FOR SELECT USING (true);

-- Create a function to automatically schedule fixture notifications
CREATE OR REPLACE FUNCTION schedule_fixture_notifications()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'upcoming' AND NEW.date IS NOT NULL THEN
    -- Schedule reminder 24 hours before
    INSERT INTO fixture_notifications (fixture_id, team_id, notification_type, scheduled_for)
    VALUES 
      (NEW.id, NEW.team_a, 'reminder', NEW.date - INTERVAL '24 hours'),
      (NEW.id, NEW.team_b, 'reminder', NEW.date - INTERVAL '24 hours'),
      -- Lineup due 2 hours before
      (NEW.id, NEW.team_a, 'lineup_due', NEW.date - INTERVAL '2 hours'),
      (NEW.id, NEW.team_b, 'lineup_due', NEW.date - INTERVAL '2 hours'),
      -- Match start notification
      (NEW.id, NEW.team_a, 'match_start', NEW.date),
      (NEW.id, NEW.team_b, 'match_start', NEW.date)
    ON CONFLICT DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic notification scheduling
DROP TRIGGER IF EXISTS schedule_fixture_notifications_trigger ON fixtures;
CREATE TRIGGER schedule_fixture_notifications_trigger
AFTER INSERT OR UPDATE OF date, status ON fixtures
FOR EACH ROW
EXECUTE FUNCTION schedule_fixture_notifications();

-- Create a view for upcoming fixtures with full details
CREATE OR REPLACE VIEW upcoming_fixtures_detailed AS
SELECT 
  f.*,
  ta.name as team_a_name,
  ta.logo as team_a_logo,
  tb.name as team_b_name,
  tb.logo as team_b_logo,
  pom.name as player_of_match_name,
  EXTRACT(EPOCH FROM (f.date - NOW())) / 3600 as hours_until_match
FROM fixtures f
LEFT JOIN teams ta ON f.team_a = ta.id
LEFT JOIN teams tb ON f.team_b = tb.id
LEFT JOIN players pom ON f.player_of_match = pom.id
WHERE f.status = 'upcoming' 
  AND f.date > NOW()
ORDER BY f.date ASC;

-- Grant permissions
GRANT SELECT ON fixture_notifications TO anon, authenticated;
GRANT SELECT ON upcoming_fixtures_detailed TO anon, authenticated;
EOF < /dev/null