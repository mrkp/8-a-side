-- First, let's verify these player names exist and see exact matches
-- This helps avoid issues with name variations

-- Check all the drafted players
WITH draft_picks AS (
  SELECT name, 'Full Barrel' as drafted_to FROM (VALUES 
    ('galt'), ('ben williams'), ('peterson')
  ) AS t(name)
  UNION ALL
  SELECT name, 'FoodDrop' as drafted_to FROM (VALUES 
    ('ross darlington'), ('dillon abraham'), ('tyrese williams')
  ) AS t(name)
  UNION ALL
  SELECT name, 'Bliss' as drafted_to FROM (VALUES 
    ('scott fanovich'), ('john delima')
  ) AS t(name)
  UNION ALL
  SELECT name, 'WAM' as drafted_to FROM (VALUES 
    ('justin brooks'), ('jelanie bynoe')
  ) AS t(name)
  UNION ALL
  SELECT name, 'Aioli' as drafted_to FROM (VALUES 
    ('charles hadden'), ('kristoff headly')
  ) AS t(name)
  UNION ALL
  SELECT name, 'Minibar' as drafted_to FROM (VALUES 
    ('john murray'), ('paul fitz'), ('jp abraham')
  ) AS t(name)
)
SELECT 
  dp.name as draft_name,
  dp.drafted_to,
  p.id,
  p.name as actual_name,
  p.rank_estimate,
  t.name as current_team,
  CASE 
    WHEN p.id IS NULL THEN 'NOT FOUND'
    WHEN LOWER(p.name) = LOWER(dp.name) THEN 'EXACT MATCH'
    ELSE 'PARTIAL MATCH'
  END as match_status
FROM draft_picks dp
LEFT JOIN players p ON LOWER(p.name) LIKE '%' || LOWER(dp.name) || '%'
LEFT JOIN teams t ON p.team_id = t.id
ORDER BY dp.drafted_to, dp.name;

-- Also check if these players are in supplemental_players
SELECT 
  p.name,
  sp.rank_estimate,
  sp.drafted_to_team_id,
  t.name as drafted_to_team
FROM supplemental_players sp
JOIN players p ON sp.player_id = p.id
LEFT JOIN teams t ON sp.drafted_to_team_id = t.id
ORDER BY p.name;