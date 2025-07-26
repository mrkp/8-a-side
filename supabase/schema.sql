-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Teams table
CREATE TABLE IF NOT EXISTS teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Players table
CREATE TABLE IF NOT EXISTS players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
  rank CHAR(1) CHECK (rank IN ('A', 'B', 'C') OR rank IS NULL),
  is_professional BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(name, team_id)
);

-- Trades table
CREATE TABLE IF NOT EXISTS trades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_team_id UUID REFERENCES teams(id) NOT NULL,
  to_team_id UUID REFERENCES teams(id) NOT NULL,
  status TEXT CHECK (status IN ('pending', 'accepted', 'declined', 'cancelled')) DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  responded_at TIMESTAMPTZ
);

-- Trade players junction table
CREATE TABLE IF NOT EXISTS trade_players (
  trade_id UUID REFERENCES trades(id) ON DELETE CASCADE,
  player_id UUID REFERENCES players(id),
  direction TEXT CHECK (direction IN ('from', 'to')) NOT NULL,
  PRIMARY KEY (trade_id, player_id)
);

-- Trade history (audit log)
CREATE TABLE IF NOT EXISTS trade_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trade_id UUID REFERENCES trades(id),
  action TEXT NOT NULL,
  team_id UUID REFERENCES teams(id),
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_players_team_id ON players(team_id);
CREATE INDEX idx_trades_from_team ON trades(from_team_id);
CREATE INDEX idx_trades_to_team ON trades(to_team_id);
CREATE INDEX idx_trades_status ON trades(status);
CREATE INDEX idx_trade_players_player ON trade_players(player_id);

-- Row Level Security
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE trades ENABLE ROW LEVEL SECURITY;
ALTER TABLE trade_players ENABLE ROW LEVEL SECURITY;
ALTER TABLE trade_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies (Open access since we're not using authentication)

-- Teams: Public access
CREATE POLICY "Teams are publicly accessible" ON teams
  FOR ALL USING (true);

-- Players: Public access
CREATE POLICY "Players are publicly accessible" ON players
  FOR ALL USING (true);

-- Trades: Public access
CREATE POLICY "Trades are publicly accessible" ON trades
  FOR ALL USING (true);

-- Trade players: Public access
CREATE POLICY "Trade players are publicly accessible" ON trade_players
  FOR ALL USING (true);

-- Trade history: Public access
CREATE POLICY "Trade history is publicly accessible" ON trade_history
  FOR ALL USING (true);

-- Functions

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers
CREATE TRIGGER update_players_updated_at BEFORE UPDATE ON players
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_trades_updated_at BEFORE UPDATE ON trades
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to handle accepted trades
CREATE OR REPLACE FUNCTION handle_accepted_trade()
RETURNS TRIGGER AS $$
BEGIN
  -- Only process when status changes to accepted
  IF NEW.status = 'accepted' AND OLD.status = 'pending' THEN
    -- Update responded_at
    NEW.responded_at = NOW();
    
    -- Swap players between teams
    -- Move 'from' players to 'to' team
    UPDATE players 
    SET team_id = NEW.to_team_id
    WHERE id IN (
      SELECT player_id FROM trade_players 
      WHERE trade_id = NEW.id AND direction = 'from'
    );
    
    -- Move 'to' players to 'from' team  
    UPDATE players 
    SET team_id = NEW.from_team_id
    WHERE id IN (
      SELECT player_id FROM trade_players 
      WHERE trade_id = NEW.id AND direction = 'to'
    );
    
    -- Log to trade history
    INSERT INTO trade_history (trade_id, action, team_id, metadata)
    VALUES (NEW.id, 'accepted', NEW.to_team_id, 
      jsonb_build_object('accepted_at', NOW())
    );
  END IF;
  
  -- Log declined trades
  IF NEW.status = 'declined' AND OLD.status = 'pending' THEN
    NEW.responded_at = NOW();
    INSERT INTO trade_history (trade_id, action, team_id, metadata)
    VALUES (NEW.id, 'declined', NEW.to_team_id, 
      jsonb_build_object('declined_at', NOW())
    );
  END IF;
  
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER handle_trade_status_change
  BEFORE UPDATE ON trades
  FOR EACH ROW
  EXECUTE FUNCTION handle_accepted_trade();