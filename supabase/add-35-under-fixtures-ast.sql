-- Add 35 & Under Fixtures to the tournament with correct AST times
-- Times are in Atlantic Standard Time (UTC-4) for Trinidad and Tobago

-- Set timezone for this session to Atlantic Standard Time
SET TIME ZONE 'America/Port_of_Spain';

-- First ensure we have the right team names
UPDATE teams SET name = 'Aioli/Spirit Mas' WHERE LOWER(name) = 'aioli' OR name = 'Aioli/Spirit Mas';

-- Clear existing fixtures for September 2025 to avoid duplicates
DELETE FROM fixtures 
WHERE date >= '2025-09-01' AND date < '2025-10-31'
AND (team_a IN (SELECT id FROM teams WHERE active = true) 
     OR team_b IN (SELECT id FROM teams WHERE active = true));

-- Insert 35 & Under fixtures with correct AST times
INSERT INTO fixtures (team_a, team_b, date, venue, status, stage) VALUES
-- Tuesday, September 2, 2025
((SELECT id FROM teams WHERE name = 'Aioli/Spirit Mas' LIMIT 1), 
 (SELECT id FROM teams WHERE name = 'WAM' LIMIT 1), 
 '2025-09-02 17:40:00-04'::timestamptz, 'South Field', 'upcoming', 'group'),

((SELECT id FROM teams WHERE name = 'Bliss' LIMIT 1), 
 (SELECT id FROM teams WHERE name = 'Mini Bar' LIMIT 1), 
 '2025-09-02 19:00:00-04'::timestamptz, 'Trinre Field (West)', 'upcoming', 'group'),

((SELECT id FROM teams WHERE name = 'FoodDrop' LIMIT 1), 
 (SELECT id FROM teams WHERE name = 'Full Barrel' LIMIT 1), 
 '2025-09-02 19:40:00-04'::timestamptz, 'East Field', 'upcoming', 'group'),

-- Friday, September 5, 2025
((SELECT id FROM teams WHERE name = 'Bliss' LIMIT 1), 
 (SELECT id FROM teams WHERE name = 'FoodDrop' LIMIT 1), 
 '2025-09-05 18:20:00-04'::timestamptz, 'East Field', 'upcoming', 'group'),

((SELECT id FROM teams WHERE name = 'Mini Bar' LIMIT 1), 
 (SELECT id FROM teams WHERE name = 'Aioli/Spirit Mas' LIMIT 1), 
 '2025-09-05 19:40:00-04'::timestamptz, 'South Field', 'upcoming', 'group'),

((SELECT id FROM teams WHERE name = 'WAM' LIMIT 1), 
 (SELECT id FROM teams WHERE name = 'Full Barrel' LIMIT 1), 
 '2025-09-05 20:20:00-04'::timestamptz, 'Trinre Field (West)', 'upcoming', 'group'),

-- Tuesday, September 9, 2025
((SELECT id FROM teams WHERE name = 'WAM' LIMIT 1), 
 (SELECT id FROM teams WHERE name = 'Bliss' LIMIT 1), 
 '2025-09-09 18:20:00-04'::timestamptz, 'East Field', 'upcoming', 'group'),

((SELECT id FROM teams WHERE name = 'Mini Bar' LIMIT 1), 
 (SELECT id FROM teams WHERE name = 'FoodDrop' LIMIT 1), 
 '2025-09-09 19:00:00-04'::timestamptz, 'East Field', 'upcoming', 'group'),

((SELECT id FROM teams WHERE name = 'Aioli/Spirit Mas' LIMIT 1), 
 (SELECT id FROM teams WHERE name = 'Full Barrel' LIMIT 1), 
 '2025-09-09 20:20:00-04'::timestamptz, 'East Field', 'upcoming', 'group'),

-- Friday, September 12, 2025
((SELECT id FROM teams WHERE name = 'FoodDrop' LIMIT 1), 
 (SELECT id FROM teams WHERE name = 'Aioli/Spirit Mas' LIMIT 1), 
 '2025-09-12 17:40:00-04'::timestamptz, 'South Field', 'upcoming', 'group'),

((SELECT id FROM teams WHERE name = 'Mini Bar' LIMIT 1), 
 (SELECT id FROM teams WHERE name = 'WAM' LIMIT 1), 
 '2025-09-12 19:00:00-04'::timestamptz, 'East Field', 'upcoming', 'group'),

((SELECT id FROM teams WHERE name = 'Full Barrel' LIMIT 1), 
 (SELECT id FROM teams WHERE name = 'Bliss' LIMIT 1), 
 '2025-09-12 20:20:00-04'::timestamptz, 'South Field', 'upcoming', 'group'),

-- Tuesday, September 16, 2025
((SELECT id FROM teams WHERE name = 'FoodDrop' LIMIT 1), 
 (SELECT id FROM teams WHERE name = 'WAM' LIMIT 1), 
 '2025-09-16 18:20:00-04'::timestamptz, 'Trinre Field (West)', 'upcoming', 'group'),

((SELECT id FROM teams WHERE name = 'Aioli/Spirit Mas' LIMIT 1), 
 (SELECT id FROM teams WHERE name = 'Bliss' LIMIT 1), 
 '2025-09-16 19:00:00-04'::timestamptz, 'East Field', 'upcoming', 'group'),

((SELECT id FROM teams WHERE name = 'Full Barrel' LIMIT 1), 
 (SELECT id FROM teams WHERE name = 'Mini Bar' LIMIT 1), 
 '2025-09-16 19:40:00-04'::timestamptz, 'South Field', 'upcoming', 'group'),

-- Friday, September 19, 2025
((SELECT id FROM teams WHERE name = 'Full Barrel' LIMIT 1), 
 (SELECT id FROM teams WHERE name = 'FoodDrop' LIMIT 1), 
 '2025-09-19 19:00:00-04'::timestamptz, 'South Field', 'upcoming', 'group'),

((SELECT id FROM teams WHERE name = 'WAM' LIMIT 1), 
 (SELECT id FROM teams WHERE name = 'Aioli/Spirit Mas' LIMIT 1), 
 '2025-09-19 19:40:00-04'::timestamptz, 'Trinre Field (West)', 'upcoming', 'group'),

((SELECT id FROM teams WHERE name = 'Mini Bar' LIMIT 1), 
 (SELECT id FROM teams WHERE name = 'Bliss' LIMIT 1), 
 '2025-09-19 20:20:00-04'::timestamptz, 'East Field', 'upcoming', 'group'),

-- Tuesday, September 23, 2025
((SELECT id FROM teams WHERE name = 'FoodDrop' LIMIT 1), 
 (SELECT id FROM teams WHERE name = 'Bliss' LIMIT 1), 
 '2025-09-23 18:20:00-04'::timestamptz, 'South Field', 'upcoming', 'group'),

((SELECT id FROM teams WHERE name = 'Full Barrel' LIMIT 1), 
 (SELECT id FROM teams WHERE name = 'WAM' LIMIT 1), 
 '2025-09-23 19:00:00-04'::timestamptz, 'East Field', 'upcoming', 'group'),

((SELECT id FROM teams WHERE name = 'Aioli/Spirit Mas' LIMIT 1), 
 (SELECT id FROM teams WHERE name = 'Mini Bar' LIMIT 1), 
 '2025-09-23 20:20:00-04'::timestamptz, 'Trinre Field (West)', 'upcoming', 'group'),

-- Friday, September 26, 2025
((SELECT id FROM teams WHERE name = 'Full Barrel' LIMIT 1), 
 (SELECT id FROM teams WHERE name = 'Aioli/Spirit Mas' LIMIT 1), 
 '2025-09-26 17:40:00-04'::timestamptz, 'South Field', 'upcoming', 'group'),

((SELECT id FROM teams WHERE name = 'Bliss' LIMIT 1), 
 (SELECT id FROM teams WHERE name = 'WAM' LIMIT 1), 
 '2025-09-26 19:00:00-04'::timestamptz, 'East Field', 'upcoming', 'group'),

((SELECT id FROM teams WHERE name = 'FoodDrop' LIMIT 1), 
 (SELECT id FROM teams WHERE name = 'Mini Bar' LIMIT 1), 
 '2025-09-26 19:40:00-04'::timestamptz, 'East Field', 'upcoming', 'group'),

-- Tuesday, September 30, 2025
((SELECT id FROM teams WHERE name = 'Aioli/Spirit Mas' LIMIT 1), 
 (SELECT id FROM teams WHERE name = 'FoodDrop' LIMIT 1), 
 '2025-09-30 17:40:00-04'::timestamptz, 'South Field', 'upcoming', 'group'),

((SELECT id FROM teams WHERE name = 'Bliss' LIMIT 1), 
 (SELECT id FROM teams WHERE name = 'Full Barrel' LIMIT 1), 
 '2025-09-30 19:00:00-04'::timestamptz, 'Trinre Field (West)', 'upcoming', 'group'),

((SELECT id FROM teams WHERE name = 'WAM' LIMIT 1), 
 (SELECT id FROM teams WHERE name = 'Mini Bar' LIMIT 1), 
 '2025-09-30 19:40:00-04'::timestamptz, 'East Field', 'upcoming', 'group'),

-- Friday, October 3, 2025 - Knockout Stage
-- Semi-finals and Final placeholders
(NULL, NULL, '2025-10-03 20:20:00-04'::timestamptz, 'South Field', 'upcoming', 'semifinal'),
(NULL, NULL, '2025-10-03 20:20:00-04'::timestamptz, 'Trinre Field (West)', 'upcoming', 'semifinal'),
(NULL, NULL, '2025-10-03 20:20:00-04'::timestamptz, 'East Field', 'upcoming', 'final');

-- Add timezone info column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'fixtures' AND column_name = 'timezone') THEN
    ALTER TABLE fixtures ADD COLUMN timezone TEXT DEFAULT 'America/Port_of_Spain';
  END IF;
END $$;

-- Update all fixtures to have Trinidad timezone
UPDATE fixtures SET timezone = 'America/Port_of_Spain' WHERE timezone IS NULL;

-- Verify the fixtures were added with correct times
SELECT 'Added 35 & Under fixtures:' as status;
SELECT 
  f.id,
  ta.name as team_a_name,
  tb.name as team_b_name,
  f.date AT TIME ZONE 'America/Port_of_Spain' as local_time,
  to_char(f.date AT TIME ZONE 'America/Port_of_Spain', 'Day, Mon DD @ HH12:MI AM') as formatted_time,
  f.venue,
  f.stage
FROM fixtures f
LEFT JOIN teams ta ON f.team_a = ta.id
LEFT JOIN teams tb ON f.team_b = tb.id
WHERE f.date >= '2025-09-01'
  AND (
    ta.name IN ('Aioli/Spirit Mas', 'WAM', 'Bliss', 'Mini Bar', 'FoodDrop', 'Full Barrel')
    OR tb.name IN ('Aioli/Spirit Mas', 'WAM', 'Bliss', 'Mini Bar', 'FoodDrop', 'Full Barrel')
    OR (ta.name IS NULL AND tb.name IS NULL AND f.stage IN ('semifinal', 'final'))
  )
ORDER BY f.date;

-- Reset timezone
RESET TIME ZONE;