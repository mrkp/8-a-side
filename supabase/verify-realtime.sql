-- Verify and enable real-time for required tables

-- Check if real-time is enabled on tables
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('fixtures', 'events', 'players', 'teams');

-- Check current publications
SELECT * FROM pg_publication_tables WHERE pubname = 'supabase_realtime';

-- Ensure replica identity is set correctly
ALTER TABLE fixtures REPLICA IDENTITY FULL;
ALTER TABLE events REPLICA IDENTITY FULL;
ALTER TABLE players REPLICA IDENTITY FULL;
ALTER TABLE teams REPLICA IDENTITY FULL;

-- Recreate the publication with all required tables
DROP PUBLICATION IF EXISTS supabase_realtime CASCADE;
CREATE PUBLICATION supabase_realtime FOR TABLE fixtures, events, players, teams;

-- Grant necessary permissions
GRANT SELECT ON fixtures TO anon, authenticated;
GRANT SELECT ON events TO anon, authenticated;
GRANT SELECT ON players TO anon, authenticated;
GRANT SELECT ON teams TO anon, authenticated;

-- Verify the publication was created correctly
SELECT * FROM pg_publication_tables WHERE pubname = 'supabase_realtime';