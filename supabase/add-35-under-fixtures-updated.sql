-- Add 35 & Under Fixtures to the tournament
-- Based on the user's fixture data for September 2025

-- First ensure we have the right team names
UPDATE teams SET name = 'Aioli/Spirit Mas' WHERE LOWER(name) = 'aioli' OR name = 'Aioli/Spirit Mas';

-- Create a temporary table to map team names to IDs
WITH team_mapping AS (
  SELECT 
    id,
    name,
    CASE 
      WHEN name = 'Aioli/Spirit Mas' THEN 'Aioli/Spirit Mas'
      WHEN name = 'WAM' THEN 'WAM'
      WHEN name = 'Bliss' THEN 'Bliss'
      WHEN name = 'Mini Bar' THEN 'Mini Bar'
      WHEN name = 'FoodDrop' THEN 'FoodDrop'
      WHEN name = 'Full Barrel' THEN 'Full Barrel'
      ELSE name
    END as match_name
  FROM teams
  WHERE active = true
)
SELECT * FROM team_mapping;

-- Clear existing fixtures for September 2025 to avoid duplicates
DELETE FROM fixtures 
WHERE date >= '2025-09-01' AND date < '2025-10-01'
AND (team_a IN (SELECT id FROM teams WHERE active = true) 
     OR team_b IN (SELECT id FROM teams WHERE active = true));

-- Insert 35 & Under fixtures
INSERT INTO fixtures (team_a, team_b, date, venue, status, stage) VALUES
-- Tuesday, September 2, 2025
((SELECT id FROM teams WHERE name = 'Aioli/Spirit Mas' LIMIT 1), 
 (SELECT id FROM teams WHERE name = 'WAM' LIMIT 1), 
 '2025-09-02 17:40:00'::timestamptz, 'South Field', 'upcoming', 'group'),

((SELECT id FROM teams WHERE name = 'Bliss' LIMIT 1), 
 (SELECT id FROM teams WHERE name = 'Mini Bar' LIMIT 1), 
 '2025-09-02 19:00:00'::timestamptz, 'Trinre Field (West)', 'upcoming', 'group'),

((SELECT id FROM teams WHERE name = 'FoodDrop' LIMIT 1), 
 (SELECT id FROM teams WHERE name = 'Full Barrel' LIMIT 1), 
 '2025-09-02 19:40:00'::timestamptz, 'East Field', 'upcoming', 'group'),

-- Friday, September 5, 2025
((SELECT id FROM teams WHERE name = 'Bliss' LIMIT 1), 
 (SELECT id FROM teams WHERE name = 'FoodDrop' LIMIT 1), 
 '2025-09-05 18:20:00'::timestamptz, 'East Field', 'upcoming', 'group'),

((SELECT id FROM teams WHERE name = 'Mini Bar' LIMIT 1), 
 (SELECT id FROM teams WHERE name = 'Aioli/Spirit Mas' LIMIT 1), 
 '2025-09-05 19:40:00'::timestamptz, 'South Field', 'upcoming', 'group'),

((SELECT id FROM teams WHERE name = 'WAM' LIMIT 1), 
 (SELECT id FROM teams WHERE name = 'Full Barrel' LIMIT 1), 
 '2025-09-05 20:20:00'::timestamptz, 'Trinre Field (West)', 'upcoming', 'group'),

-- Tuesday, September 9, 2025
((SELECT id FROM teams WHERE name = 'WAM' LIMIT 1), 
 (SELECT id FROM teams WHERE name = 'Bliss' LIMIT 1), 
 '2025-09-09 18:20:00'::timestamptz, 'East Field', 'upcoming', 'group'),

((SELECT id FROM teams WHERE name = 'Mini Bar' LIMIT 1), 
 (SELECT id FROM teams WHERE name = 'FoodDrop' LIMIT 1), 
 '2025-09-09 19:00:00'::timestamptz, 'East Field', 'upcoming', 'group'),

((SELECT id FROM teams WHERE name = 'Aioli/Spirit Mas' LIMIT 1), 
 (SELECT id FROM teams WHERE name = 'Full Barrel' LIMIT 1), 
 '2025-09-09 20:20:00'::timestamptz, 'East Field', 'upcoming', 'group'),

-- Friday, September 12, 2025
((SELECT id FROM teams WHERE name = 'FoodDrop' LIMIT 1), 
 (SELECT id FROM teams WHERE name = 'Aioli/Spirit Mas' LIMIT 1), 
 '2025-09-12 17:40:00'::timestamptz, 'South Field', 'upcoming', 'group'),

((SELECT id FROM teams WHERE name = 'Mini Bar' LIMIT 1), 
 (SELECT id FROM teams WHERE name = 'WAM' LIMIT 1), 
 '2025-09-12 19:00:00'::timestamptz, 'East Field', 'upcoming', 'group'),

((SELECT id FROM teams WHERE name = 'Full Barrel' LIMIT 1), 
 (SELECT id FROM teams WHERE name = 'Bliss' LIMIT 1), 
 '2025-09-12 20:20:00'::timestamptz, 'South Field', 'upcoming', 'group'),

-- Tuesday, September 16, 2025
((SELECT id FROM teams WHERE name = 'FoodDrop' LIMIT 1), 
 (SELECT id FROM teams WHERE name = 'WAM' LIMIT 1), 
 '2025-09-16 18:20:00'::timestamptz, 'Trinre Field (West)', 'upcoming', 'group'),

((SELECT id FROM teams WHERE name = 'Aioli/Spirit Mas' LIMIT 1), 
 (SELECT id FROM teams WHERE name = 'Bliss' LIMIT 1), 
 '2025-09-16 19:00:00'::timestamptz, 'East Field', 'upcoming', 'group'),

((SELECT id FROM teams WHERE name = 'Full Barrel' LIMIT 1), 
 (SELECT id FROM teams WHERE name = 'Mini Bar' LIMIT 1), 
 '2025-09-16 19:40:00'::timestamptz, 'South Field', 'upcoming', 'group'),

-- Friday, September 19, 2025
((SELECT id FROM teams WHERE name = 'Full Barrel' LIMIT 1), 
 (SELECT id FROM teams WHERE name = 'FoodDrop' LIMIT 1), 
 '2025-09-19 19:00:00'::timestamptz, 'South Field', 'upcoming', 'group'),

((SELECT id FROM teams WHERE name = 'WAM' LIMIT 1), 
 (SELECT id FROM teams WHERE name = 'Aioli/Spirit Mas' LIMIT 1), 
 '2025-09-19 19:40:00'::timestamptz, 'Trinre Field (West)', 'upcoming', 'group'),

((SELECT id FROM teams WHERE name = 'Mini Bar' LIMIT 1), 
 (SELECT id FROM teams WHERE name = 'Bliss' LIMIT 1), 
 '2025-09-19 20:20:00'::timestamptz, 'East Field', 'upcoming', 'group'),

-- Tuesday, September 23, 2025
((SELECT id FROM teams WHERE name = 'FoodDrop' LIMIT 1), 
 (SELECT id FROM teams WHERE name = 'Bliss' LIMIT 1), 
 '2025-09-23 18:20:00'::timestamptz, 'South Field', 'upcoming', 'group'),

((SELECT id FROM teams WHERE name = 'Full Barrel' LIMIT 1), 
 (SELECT id FROM teams WHERE name = 'WAM' LIMIT 1), 
 '2025-09-23 19:00:00'::timestamptz, 'East Field', 'upcoming', 'group'),

((SELECT id FROM teams WHERE name = 'Aioli/Spirit Mas' LIMIT 1), 
 (SELECT id FROM teams WHERE name = 'Mini Bar' LIMIT 1), 
 '2025-09-23 20:20:00'::timestamptz, 'Trinre Field (West)', 'upcoming', 'group'),

-- Friday, September 26, 2025
((SELECT id FROM teams WHERE name = 'Full Barrel' LIMIT 1), 
 (SELECT id FROM teams WHERE name = 'Aioli/Spirit Mas' LIMIT 1), 
 '2025-09-26 17:40:00'::timestamptz, 'South Field', 'upcoming', 'group'),

((SELECT id FROM teams WHERE name = 'Bliss' LIMIT 1), 
 (SELECT id FROM teams WHERE name = 'WAM' LIMIT 1), 
 '2025-09-26 19:00:00'::timestamptz, 'East Field', 'upcoming', 'group'),

((SELECT id FROM teams WHERE name = 'FoodDrop' LIMIT 1), 
 (SELECT id FROM teams WHERE name = 'Mini Bar' LIMIT 1), 
 '2025-09-26 19:40:00'::timestamptz, 'East Field', 'upcoming', 'group'),

-- Tuesday, September 30, 2025
((SELECT id FROM teams WHERE name = 'Aioli/Spirit Mas' LIMIT 1), 
 (SELECT id FROM teams WHERE name = 'FoodDrop' LIMIT 1), 
 '2025-09-30 17:40:00'::timestamptz, 'South Field', 'upcoming', 'group'),

((SELECT id FROM teams WHERE name = 'Bliss' LIMIT 1), 
 (SELECT id FROM teams WHERE name = 'Full Barrel' LIMIT 1), 
 '2025-09-30 19:00:00'::timestamptz, 'Trinre Field (West)', 'upcoming', 'group'),

((SELECT id FROM teams WHERE name = 'WAM' LIMIT 1), 
 (SELECT id FROM teams WHERE name = 'Mini Bar' LIMIT 1), 
 '2025-09-30 19:40:00'::timestamptz, 'East Field', 'upcoming', 'group');

-- October 3 finals will be added later when teams are determined
-- These are placeholders for now
INSERT INTO fixtures (team_a, team_b, date, venue, status, stage) VALUES
(NULL, NULL, '2025-10-03 20:20:00'::timestamptz, 'South Field', 'upcoming', 'semifinal'),
(NULL, NULL, '2025-10-03 20:20:00'::timestamptz, 'Trinre Field (West)', 'upcoming', 'semifinal'),
(NULL, NULL, '2025-10-03 20:20:00'::timestamptz, 'East Field', 'upcoming', 'final');

-- Verify the fixtures were added
SELECT 'Added 35 & Under fixtures:' as status;
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
  AND (
    ta.name IN ('Aioli/Spirit Mas', 'WAM', 'Bliss', 'Mini Bar', 'FoodDrop', 'Full Barrel')
    OR tb.name IN ('Aioli/Spirit Mas', 'WAM', 'Bliss', 'Mini Bar', 'FoodDrop', 'Full Barrel')
    OR (ta.name IS NULL AND tb.name IS NULL AND f.stage IN ('semifinal', 'final'))
  )
ORDER BY f.date;

-- Count summary
SELECT 'Summary:' as status;
SELECT 
  COUNT(*) as total_fixtures,
  COUNT(CASE WHEN stage = 'group' THEN 1 END) as group_stage,
  COUNT(CASE WHEN stage IN ('semifinal', 'final') THEN 1 END) as knockout_stage
FROM fixtures f
WHERE f.date >= '2025-09-01' AND f.date < '2025-11-01';