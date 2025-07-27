-- Enable real-time for the tables that need it

-- Drop and recreate the publication to ensure it's fresh
DROP PUBLICATION IF EXISTS supabase_realtime CASCADE;
CREATE PUBLICATION supabase_realtime;

-- Add tables to the real-time publication
ALTER PUBLICATION supabase_realtime ADD TABLE fixtures;
ALTER PUBLICATION supabase_realtime ADD TABLE events;
ALTER PUBLICATION supabase_realtime ADD TABLE players;
ALTER PUBLICATION supabase_realtime ADD TABLE teams;

-- Enable real-time for specific tables via Supabase's replica identity
ALTER TABLE fixtures REPLICA IDENTITY FULL;
ALTER TABLE events REPLICA IDENTITY FULL;
ALTER TABLE players REPLICA IDENTITY FULL;
ALTER TABLE teams REPLICA IDENTITY FULL;