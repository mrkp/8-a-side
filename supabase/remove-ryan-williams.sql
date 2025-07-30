-- Remove Ryan Williams from younger division
-- He registered for 36-45 (older) division but was mistakenly placed in younger division

-- First, let's find Ryan Williams
SELECT 
  p.id, 
  p.name, 
  p.team_id,
  t.name as team_name,
  t.active as team_active,
  sp.id as supplemental_id
FROM players p
LEFT JOIN teams t ON p.team_id = t.id
LEFT JOIN supplemental_players sp ON p.id = sp.player_id
WHERE LOWER(p.name) LIKE '%ryan%williams%' OR LOWER(p.name) LIKE '%ryan williams%';

-- Remove Ryan Williams from the younger division
DO $$
DECLARE
  ryan_id UUID;
  ryan_team_id UUID;
  ryan_supplemental_id UUID;
BEGIN
  -- Find Ryan Williams
  SELECT p.id, p.team_id, sp.id 
  INTO ryan_id, ryan_team_id, ryan_supplemental_id
  FROM players p
  LEFT JOIN supplemental_players sp ON p.id = sp.player_id
  WHERE LOWER(p.name) LIKE '%ryan%williams%' OR LOWER(p.name) LIKE '%ryan williams%'
  LIMIT 1;
  
  IF ryan_id IS NOT NULL THEN
    RAISE NOTICE 'Found Ryan Williams with ID: %', ryan_id;
    
    -- Remove from supplemental pool if present
    IF ryan_supplemental_id IS NOT NULL THEN
      DELETE FROM supplemental_players WHERE id = ryan_supplemental_id;
      RAISE NOTICE 'Removed Ryan Williams from supplemental draft pool';
    END IF;
    
    -- Remove from any votes he may have received or given
    DELETE FROM player_votes WHERE voter_id = ryan_id OR subject_id = ryan_id;
    RAISE NOTICE 'Removed Ryan Williams from voting records';
    
    -- Remove from draft history
    DELETE FROM draft_history WHERE player_id = ryan_id;
    RAISE NOTICE 'Removed Ryan Williams from draft history';
    
    -- Clear his team assignment if any
    UPDATE players SET team_id = NULL WHERE id = ryan_id;
    
    -- Finally, remove the player record
    DELETE FROM players WHERE id = ryan_id;
    RAISE NOTICE 'Ryan Williams has been removed from the younger division';
    
    -- Recalculate team strengths if he was on a team
    IF ryan_team_id IS NOT NULL THEN
      PERFORM update_team_strength();
      RAISE NOTICE 'Updated team strength calculations';
    END IF;
  ELSE
    RAISE NOTICE 'Ryan Williams not found in the database';
  END IF;
END $$;

-- Show updated supplemental pool
SELECT 
  p.name as player_name,
  COALESCE(p.rank_estimate, p.rank, 'U') as rank,
  CASE 
    WHEN sp.drafted_to_team_id IS NOT NULL THEN 'DRAFTED'
    ELSE 'AVAILABLE'
  END as status
FROM supplemental_players sp
JOIN players p ON sp.player_id = p.id
WHERE sp.drafted_to_team_id IS NULL
ORDER BY 
  CASE COALESCE(p.rank_estimate, p.rank)
    WHEN 'A' THEN 1
    WHEN 'B' THEN 2
    WHEN 'C' THEN 3
    ELSE 4
  END,
  p.name;

-- Show updated team counts
SELECT 
  t.name as team_name,
  COUNT(p.id) as player_count,
  t.active
FROM teams t
LEFT JOIN players p ON t.id = p.team_id
GROUP BY t.id, t.name, t.active
ORDER BY t.active DESC, player_count ASC;