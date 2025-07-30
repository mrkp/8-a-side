-- Two-phase draft order setup
-- Phase 1: FoodDrop and Full Barrel pick C players
-- Phase 2: Open draft with new order

-- Drop existing function to avoid return type conflicts
DROP FUNCTION IF EXISTS get_draft_team_for_pick(INTEGER);

-- Create a function to determine draft order based on pick number
CREATE FUNCTION get_draft_team_for_pick(pick_number INTEGER)
RETURNS TABLE (
  team_id UUID,
  team_name TEXT,
  phase TEXT,
  expected_player_type TEXT
) AS $$
BEGIN
  -- Phase 1: First two picks are C players
  IF pick_number = 1 THEN
    RETURN QUERY
    SELECT t.id, t.name, 'C_PICKS'::TEXT, 'C'::TEXT
    FROM teams t
    WHERE LOWER(t.name) LIKE '%food%drop%' OR LOWER(t.name) LIKE '%fooddrop%'
    LIMIT 1;
  ELSIF pick_number = 2 THEN
    RETURN QUERY
    SELECT t.id, t.name, 'C_PICKS'::TEXT, 'C'::TEXT
    FROM teams t
    WHERE LOWER(t.name) LIKE '%full%barrel%' OR LOWER(t.name) LIKE '%fullbarrel%'
    LIMIT 1;
  ELSE
    -- Phase 2: Open draft (picks 3+)
    -- Calculate position in the repeating cycle
    DECLARE
      phase2_position INTEGER;
      team_pattern TEXT;
    BEGIN
      phase2_position := ((pick_number - 3) % 6) + 1;
      
      team_pattern := CASE phase2_position
        WHEN 1 THEN '%food%drop%'
        WHEN 2 THEN '%minibar%'
        WHEN 3 THEN '%full%barrel%'
        WHEN 4 THEN '%bliss%'
        WHEN 5 THEN '%wam%'
        WHEN 6 THEN '%aioli%'
      END;
      
      RETURN QUERY
      SELECT t.id, t.name, 'OPEN_DRAFT'::TEXT, 'ANY'::TEXT
      FROM teams t
      WHERE LOWER(t.name) LIKE team_pattern
      LIMIT 1;
    END;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Drop the view first if it exists to avoid type conflicts
DROP VIEW IF EXISTS supplemental_draft_order;

-- Create the supplemental draft order view
CREATE VIEW supplemental_draft_order AS
WITH pick_sequence AS (
  -- Generate pick numbers 1-12 (2 C picks + 10 open picks for initial display)
  SELECT generate_series(1, 12) as pick_num
),
draft_assignments AS (
  SELECT 
    ps.pick_num,
    dt.team_id,
    dt.team_name,
    dt.phase,
    dt.expected_player_type
  FROM pick_sequence ps
  CROSS JOIN LATERAL get_draft_team_for_pick(ps.pick_num) dt
),
team_stats AS (
  SELECT 
    t.id,
    t.name,
    COUNT(p.id)::BIGINT as player_count,
    COALESCE(t.team_strength_score, 2.5) as strength_score
  FROM teams t
  LEFT JOIN players p ON t.id = p.team_id
  WHERE t.active = true
  GROUP BY t.id, t.name, t.team_strength_score
)
SELECT DISTINCT ON (da.pick_num)
  ts.id,
  ts.name,
  ts.player_count,
  ts.strength_score,
  da.pick_num::BIGINT as draft_position,
  da.phase,
  da.expected_player_type
FROM draft_assignments da
JOIN team_stats ts ON da.team_id = ts.id
ORDER BY da.pick_num;

-- Drop existing function to avoid return type conflicts
DROP FUNCTION IF EXISTS get_supplemental_draft_order();

-- Function for the app to use
CREATE FUNCTION get_supplemental_draft_order()
RETURNS TABLE (
  id UUID,
  name TEXT,
  player_count BIGINT,
  strength_score NUMERIC,
  draft_position BIGINT
) AS $$
DECLARE
  current_pick INTEGER;
BEGIN
  -- Get the current pick number based on drafted players
  SELECT COUNT(*) + 1 INTO current_pick
  FROM supplemental_players
  WHERE drafted_to_team_id IS NOT NULL;
  
  -- Return the team that should pick now
  RETURN QUERY
  WITH next_team AS (
    SELECT * FROM get_draft_team_for_pick(current_pick)
  ),
  team_stats AS (
    SELECT 
      t.id,
      t.name,
      COUNT(p.id) as player_count,
      COALESCE(t.team_strength_score, 2.5) as strength_score
    FROM teams t
    LEFT JOIN players p ON t.id = p.team_id
    WHERE t.active = true
    GROUP BY t.id, t.name, t.team_strength_score
  )
  SELECT 
    ts.id,
    ts.name,
    ts.player_count::BIGINT,
    ts.strength_score,
    current_pick::BIGINT as draft_position
  FROM next_team nt
  JOIN team_stats ts ON nt.team_id = ts.id;
END;
$$ LANGUAGE plpgsql;

-- Drop existing function to avoid return type conflicts
DROP FUNCTION IF EXISTS get_full_draft_order_display();

-- Helper function to get the full draft order for display
CREATE FUNCTION get_full_draft_order_display()
RETURNS TABLE (
  pick_number INTEGER,
  team_name TEXT,
  phase TEXT,
  expected_player_type TEXT,
  is_current BOOLEAN
) AS $$
DECLARE
  current_pick INTEGER;
BEGIN
  -- Get current pick number
  SELECT COUNT(*) + 1 INTO current_pick
  FROM supplemental_players
  WHERE drafted_to_team_id IS NOT NULL;
  
  RETURN QUERY
  WITH pick_sequence AS (
    SELECT generate_series(1, 20) as pick_num -- Show first 20 picks
  )
  SELECT 
    ps.pick_num,
    dt.team_name,
    dt.phase,
    dt.expected_player_type,
    (ps.pick_num = current_pick) as is_current
  FROM pick_sequence ps
  CROSS JOIN LATERAL get_draft_team_for_pick(ps.pick_num) dt
  ORDER BY ps.pick_num;
END;
$$ LANGUAGE plpgsql;

-- Test the draft order
SELECT * FROM get_full_draft_order_display() LIMIT 14;