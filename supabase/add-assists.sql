-- Add assist tracking to events table
ALTER TABLE events 
ADD COLUMN assist_player_id UUID REFERENCES players(id);

-- Create index for assist lookups
CREATE INDEX idx_events_assist_player ON events(assist_player_id);

-- Update the update_player_goals function to also track assists
CREATE OR REPLACE FUNCTION update_player_stats()
RETURNS TRIGGER AS $$
BEGIN
  -- Update goal scorer
  IF NEW.type IN ('goal', 'own_goal') AND NEW.type = 'goal' THEN
    UPDATE players 
    SET goals = goals + 1
    WHERE id = NEW.player_id;
  END IF;
  
  -- Update assist provider
  IF NEW.assist_player_id IS NOT NULL THEN
    UPDATE players 
    SET assists = COALESCE(assists, 0) + 1
    WHERE id = NEW.assist_player_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add assists column to players if it doesn't exist
ALTER TABLE players 
ADD COLUMN IF NOT EXISTS assists INTEGER DEFAULT 0;

-- Drop old trigger and create new one
DROP TRIGGER IF EXISTS update_player_goals_trigger ON events;

CREATE TRIGGER update_player_stats_trigger
AFTER INSERT ON events
FOR EACH ROW
EXECUTE FUNCTION update_player_stats();