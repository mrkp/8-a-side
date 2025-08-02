-- Top Assists View
CREATE OR REPLACE VIEW top_assists AS
SELECT 
    p.id,
    p.name,
    p.image_url,
    p.rank,
    t.name as team_name,
    t.id as team_id,
    COUNT(e.id) as assists
FROM players p
JOIN teams t ON p.team_id = t.id
JOIN events e ON e.assist_player_id = p.id
WHERE e.type = 'goal'
GROUP BY p.id, p.name, p.image_url, p.rank, t.name, t.id
ORDER BY assists DESC, p.name ASC;

-- Hat-tricks View (3+ goals in a single match)
CREATE OR REPLACE VIEW hat_tricks AS
SELECT 
    p.id as player_id,
    p.name as player_name,
    p.image_url,
    p.rank,
    t.name as team_name,
    f.id as fixture_id,
    f.date as match_date,
    ta.name as team_a_name,
    tb.name as team_b_name,
    COUNT(e.id) as goals_in_match
FROM events e
JOIN players p ON e.player_id = p.id
JOIN teams t ON p.team_id = t.id
JOIN fixtures f ON e.fixture_id = f.id
JOIN teams ta ON f.team_a = ta.id
JOIN teams tb ON f.team_b = tb.id
WHERE e.type = 'goal'
GROUP BY p.id, p.name, p.image_url, p.rank, t.name, f.id, f.date, ta.name, tb.name
HAVING COUNT(e.id) >= 3
ORDER BY goals_in_match DESC, f.date DESC;

-- Clean Sheets View (goalkeepers/teams with 0 goals conceded in completed matches)
CREATE OR REPLACE VIEW clean_sheets AS
WITH team_clean_sheets AS (
    SELECT 
        t.id as team_id,
        t.name as team_name,
        t.logo as team_logo,
        COUNT(DISTINCT f.id) as clean_sheet_count
    FROM teams t
    JOIN fixtures f ON (f.team_a = t.id OR f.team_b = t.id)
    WHERE f.status = 'completed'
    AND (
        (f.team_a = t.id AND (f.score->>'teamB')::int = 0) OR
        (f.team_b = t.id AND (f.score->>'teamA')::int = 0)
    )
    GROUP BY t.id, t.name, t.logo
)
SELECT * FROM team_clean_sheets
ORDER BY clean_sheet_count DESC, team_name ASC;

-- Goals + Assists Combined View
CREATE OR REPLACE VIEW goals_assists_combined AS
WITH player_goals AS (
    SELECT 
        p.id,
        COUNT(e.id) as goals
    FROM players p
    LEFT JOIN events e ON e.player_id = p.id AND e.type = 'goal'
    GROUP BY p.id
),
player_assists AS (
    SELECT 
        p.id,
        COUNT(e.id) as assists
    FROM players p
    LEFT JOIN events e ON e.assist_player_id = p.id AND e.type = 'goal'
    GROUP BY p.id
)
SELECT 
    p.id,
    p.name,
    p.image_url,
    p.rank,
    t.name as team_name,
    t.id as team_id,
    COALESCE(pg.goals, 0) as goals,
    COALESCE(pa.assists, 0) as assists,
    COALESCE(pg.goals, 0) + COALESCE(pa.assists, 0) as total_contributions
FROM players p
JOIN teams t ON p.team_id = t.id
LEFT JOIN player_goals pg ON p.id = pg.id
LEFT JOIN player_assists pa ON p.id = pa.id
WHERE COALESCE(pg.goals, 0) + COALESCE(pa.assists, 0) > 0
ORDER BY total_contributions DESC, goals DESC, p.name ASC;

-- Fastest Goals View (goals scored in first 5 minutes)
CREATE OR REPLACE VIEW fastest_goals AS
SELECT 
    e.id as event_id,
    p.name as player_name,
    p.image_url,
    p.rank,
    t.name as team_name,
    e.minute,
    f.date as match_date,
    ta.name as team_a_name,
    tb.name as team_b_name
FROM events e
JOIN players p ON e.player_id = p.id
JOIN teams t ON p.team_id = t.id
JOIN fixtures f ON e.fixture_id = f.id
JOIN teams ta ON f.team_a = ta.id
JOIN teams tb ON f.team_b = tb.id
WHERE e.type = 'goal' AND e.minute <= 5
ORDER BY e.minute ASC, f.date DESC;

-- Most Goals in a Match View
CREATE OR REPLACE VIEW highest_scoring_matches AS
SELECT 
    f.id as fixture_id,
    f.date,
    ta.name as team_a_name,
    tb.name as team_b_name,
    ta.logo as team_a_logo,
    tb.logo as team_b_logo,
    (f.score->>'teamA')::int as team_a_score,
    (f.score->>'teamB')::int as team_b_score,
    (f.score->>'teamA')::int + (f.score->>'teamB')::int as total_goals
FROM fixtures f
JOIN teams ta ON f.team_a = ta.id
JOIN teams tb ON f.team_b = tb.id
WHERE f.status = 'completed'
AND (f.score->>'teamA')::int + (f.score->>'teamB')::int > 0
ORDER BY total_goals DESC, f.date DESC
LIMIT 10;

-- Own Goals View
CREATE OR REPLACE VIEW own_goals_leaderboard AS
SELECT 
    p.id,
    p.name,
    p.image_url,
    p.rank,
    t.name as team_name,
    COUNT(e.id) as own_goals
FROM players p
JOIN teams t ON p.team_id = t.id
JOIN events e ON e.player_id = p.id
WHERE e.type = 'own_goal'
GROUP BY p.id, p.name, p.image_url, p.rank, t.name
ORDER BY own_goals DESC, p.name ASC;