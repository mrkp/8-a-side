-- Set custom draft order for supplemental picks
-- Order: FoodDrop, Full Barrel, Aioli, WAM, Bliss, Minibar

-- First, let's identify the teams
SELECT id, name, slug FROM teams WHERE active = true ORDER BY name;

-- Create a temporary table for the draft order
CREATE TEMP TABLE custom_draft_order (
  position INTEGER,
  team_name TEXT
);

-- Insert the custom order
INSERT INTO custom_draft_order (position, team_name) VALUES
  (1, 'FoodDrop'),
  (2, 'Full Barrel'),
  (3, 'Aioli'),
  (4, 'WAM'),
  (5, 'Bliss'),
  (6, 'Minibar');

-- Update the supplemental_draft_order view to use custom ordering
CREATE OR REPLACE VIEW supplemental_draft_order AS
WITH team_mapping AS (
  -- Map team names (handle variations)
  SELECT 
    t.id,
    t.name as original_name,
    CASE 
      WHEN LOWER(t.name) LIKE '%food%drop%' OR LOWER(t.name) LIKE '%fooddrop%' THEN 'FoodDrop'
      WHEN LOWER(t.name) LIKE '%full%barrel%' OR LOWER(t.name) LIKE '%fullbarrel%' THEN 'Full Barrel'
      WHEN LOWER(t.name) LIKE '%aioli%' THEN 'Aioli'
      WHEN LOWER(t.name) LIKE '%wam%' THEN 'WAM'
      WHEN LOWER(t.name) LIKE '%bliss%' THEN 'Bliss'
      WHEN LOWER(t.name) LIKE '%minibar%' OR LOWER(t.name) LIKE '%mini%bar%' THEN 'Minibar'
      ELSE t.name
    END as normalized_name
  FROM teams t
  WHERE t.active = true
),
team_stats AS (
  SELECT 
    tm.id,
    tm.original_name as name,
    tm.normalized_name,
    COUNT(p.id) as player_count,
    COALESCE(t.team_strength_score, 2.5) as strength_score
  FROM team_mapping tm
  JOIN teams t ON tm.id = t.id
  LEFT JOIN players p ON t.id = p.team_id
  GROUP BY tm.id, tm.original_name, tm.normalized_name, t.team_strength_score
)
SELECT 
  ts.id,
  ts.name,
  ts.player_count,
  ts.strength_score,
  COALESCE(cdo.position, 999) as draft_position
FROM team_stats ts
LEFT JOIN custom_draft_order cdo ON ts.normalized_name = cdo.team_name
ORDER BY draft_position, ts.name;

-- Show the updated draft order
SELECT * FROM supplemental_draft_order;

-- Also create a function to get draft order for the app
CREATE OR REPLACE FUNCTION get_supplemental_draft_order()
RETURNS TABLE (
  id UUID,
  name TEXT,
  player_count INTEGER,
  strength_score NUMERIC,
  draft_position INTEGER
) AS $$
BEGIN
  RETURN QUERY
  WITH team_mapping AS (
    SELECT 
      t.id,
      t.name as original_name,
      CASE 
        WHEN LOWER(t.name) LIKE '%food%drop%' OR LOWER(t.name) LIKE '%fooddrop%' THEN 'FoodDrop'
        WHEN LOWER(t.name) LIKE '%full%barrel%' OR LOWER(t.name) LIKE '%fullbarrel%' THEN 'Full Barrel'
        WHEN LOWER(t.name) LIKE '%aioli%' THEN 'Aioli'
        WHEN LOWER(t.name) LIKE '%wam%' THEN 'WAM'
        WHEN LOWER(t.name) LIKE '%bliss%' THEN 'Bliss'
        WHEN LOWER(t.name) LIKE '%minibar%' OR LOWER(t.name) LIKE '%mini%bar%' THEN 'Minibar'
        ELSE t.name
      END as normalized_name
    FROM teams t
    WHERE t.active = true
  ),
  custom_order AS (
    SELECT * FROM (VALUES
      (1, 'FoodDrop'),
      (2, 'Full Barrel'),
      (3, 'Aioli'),
      (4, 'WAM'),
      (5, 'Bliss'),
      (6, 'Minibar')
    ) AS t(position, team_name)
  ),
  team_stats AS (
    SELECT 
      tm.id,
      tm.original_name as name,
      tm.normalized_name,
      COUNT(p.id) as player_count,
      COALESCE(t.team_strength_score, 2.5) as strength_score
    FROM team_mapping tm
    JOIN teams t ON tm.id = t.id
    LEFT JOIN players p ON t.id = p.team_id
    GROUP BY tm.id, tm.original_name, tm.normalized_name, t.team_strength_score
  )
  SELECT 
    ts.id,
    ts.name,
    ts.player_count::INTEGER,
    ts.strength_score,
    COALESCE(co.position, 999)::INTEGER as draft_position
  FROM team_stats ts
  LEFT JOIN custom_order co ON ts.normalized_name = co.team_name
  ORDER BY draft_position, ts.name;
END;
$$ LANGUAGE plpgsql;

-- Verify the order
SELECT * FROM get_supplemental_draft_order();