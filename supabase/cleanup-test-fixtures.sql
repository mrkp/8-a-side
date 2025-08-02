-- First, let's check what fixtures we have from July
SELECT 
    f.id,
    f.date,
    ta.name as team_a,
    tb.name as team_b,
    f.status,
    f.score
FROM fixtures f
JOIN teams ta ON f.team_a = ta.id
JOIN teams tb ON f.team_b = tb.id
WHERE date >= '2024-07-01' AND date < '2024-08-01'
ORDER BY date;

-- Check team stats to see the current state
SELECT 
    name,
    stats
FROM teams
WHERE stats IS NOT NULL
ORDER BY name;

-- Check if we have any goal events from July fixtures
SELECT 
    ge.id,
    p.name as player,
    t.name as team,
    f.date,
    ge.minute
FROM goal_events ge
JOIN players p ON ge.player_id = p.id
JOIN teams t ON ge.team_id = t.id
JOIN fixtures f ON ge.fixture_id = f.id
WHERE f.date >= '2024-07-01' AND date < '2024-08-01';

-- Clean up the test data
-- First, delete goal events from July fixtures
DELETE FROM goal_events
WHERE fixture_id IN (
    SELECT id FROM fixtures 
    WHERE date >= '2024-07-01' AND date < '2024-08-01'
);

-- Delete the July fixtures themselves
DELETE FROM fixtures
WHERE date >= '2024-07-01' AND date < '2024-08-01';

-- Reset team stats to clean state
UPDATE teams
SET stats = jsonb_build_object(
    'played', 0,
    'won', 0,
    'drawn', 0,
    'lost', 0,
    'gf', 0,
    'ga', 0,
    'gd', 0,
    'points', 0
)
WHERE stats IS NOT NULL;

-- Reset player goals and assists
UPDATE players
SET goals = 0, assists = 0
WHERE goals > 0 OR assists > 0;

-- Verify the cleanup
SELECT 'Fixtures remaining:' as check_type, COUNT(*) as count 
FROM fixtures
WHERE date >= '2024-07-01' AND date < '2024-08-01'
UNION ALL
SELECT 'Teams with non-zero stats:', COUNT(*) 
FROM teams
WHERE (stats->>'played')::int > 0
UNION ALL
SELECT 'Players with goals:', COUNT(*)
FROM players
WHERE goals > 0
UNION ALL
SELECT 'Players with assists:', COUNT(*)
FROM players
WHERE assists > 0;