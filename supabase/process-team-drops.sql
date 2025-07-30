-- Process Ready Freddie and Karcher team drops
-- This will move their players to the supplemental pool

-- First, let's see which teams are Ready Freddie and Karcher
SELECT id, name, slug FROM teams WHERE LOWER(name) LIKE '%ready%freddie%' OR LOWER(name) LIKE '%karcher%';

-- Mark Ready Freddie as inactive (replace with actual team ID)
UPDATE teams 
SET active = false, dropped_at = NOW()
WHERE LOWER(name) LIKE '%ready%freddie%';

-- Mark Karcher as inactive (replace with actual team ID)
UPDATE teams 
SET active = false, dropped_at = NOW()
WHERE LOWER(name) LIKE '%karcher%';

-- Move Ready Freddie players to supplemental pool
INSERT INTO supplemental_players (player_id, rank_estimate, preferred_teammate_id)
SELECT p.id, p.rank_estimate, p.preferred_teammate_id
FROM players p
JOIN teams t ON p.team_id = t.id
WHERE LOWER(t.name) LIKE '%ready%freddie%';

-- Move Karcher players to supplemental pool
INSERT INTO supplemental_players (player_id, rank_estimate, preferred_teammate_id)
SELECT p.id, p.rank_estimate, p.preferred_teammate_id
FROM players p
JOIN teams t ON p.team_id = t.id
WHERE LOWER(t.name) LIKE '%karcher%';

-- Clear team assignments for players from dropped teams
UPDATE players p
SET team_id = NULL
FROM teams t
WHERE p.team_id = t.id 
  AND (LOWER(t.name) LIKE '%ready%freddie%' OR LOWER(t.name) LIKE '%karcher%');

-- Recalculate team strengths
SELECT update_team_strength();

-- Show current team status
SELECT 
  t.name,
  t.active,
  COUNT(p.id) as player_count,
  t.team_strength_score
FROM teams t
LEFT JOIN players p ON t.id = p.team_id
GROUP BY t.id, t.name, t.active, t.team_strength_score
ORDER BY t.active DESC, player_count ASC;