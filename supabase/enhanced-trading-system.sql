-- Enhanced Trading System Schema
-- Supports multi-player trades, draft picks, and trade analytics

-- Create trade_items table for flexible trade components
CREATE TABLE IF NOT EXISTS trade_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trade_id UUID REFERENCES trades(id) ON DELETE CASCADE,
  item_type TEXT CHECK (item_type IN ('player', 'draft_pick', 'cash')) DEFAULT 'player',
  from_team BOOLEAN NOT NULL, -- true if from proposing team, false if from receiving team
  player_id UUID REFERENCES players(id),
  draft_year INTEGER,
  draft_round INTEGER,
  cash_amount DECIMAL(10,2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT valid_item CHECK (
    (item_type = 'player' AND player_id IS NOT NULL) OR
    (item_type = 'draft_pick' AND draft_year IS NOT NULL AND draft_round IS NOT NULL) OR
    (item_type = 'cash' AND cash_amount IS NOT NULL)
  )
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_trade_items_trade ON trade_items(trade_id);
CREATE INDEX IF NOT EXISTS idx_trade_items_player ON trade_items(player_id) WHERE item_type = 'player';

-- Create trade evaluations table
CREATE TABLE IF NOT EXISTS trade_evaluations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trade_id UUID REFERENCES trades(id) ON DELETE CASCADE,
  team_id UUID REFERENCES teams(id),
  strength_before DECIMAL(3,2),
  strength_after DECIMAL(3,2),
  strength_change DECIMAL(3,2),
  evaluation_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_trade_evaluations_trade ON trade_evaluations(trade_id);

-- Add new columns to trades table
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'trades' AND column_name = 'trade_deadline') THEN
    ALTER TABLE trades ADD COLUMN trade_deadline TIMESTAMPTZ;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'trades' AND column_name = 'counter_offer_to') THEN
    ALTER TABLE trades ADD COLUMN counter_offer_to UUID REFERENCES trades(id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'trades' AND column_name = 'trade_type') THEN
    ALTER TABLE trades ADD COLUMN trade_type TEXT CHECK (trade_type IN ('standard', 'three_team', 'conditional')) DEFAULT 'standard';
  END IF;
END $$;

-- Create function to evaluate trade impact
CREATE OR REPLACE FUNCTION evaluate_trade_impact(p_trade_id UUID)
RETURNS TABLE (
  team_id UUID,
  team_name TEXT,
  players_gained TEXT[],
  players_lost TEXT[],
  strength_before DECIMAL(3,2),
  strength_after DECIMAL(3,2),
  strength_change DECIMAL(3,2)
) AS $$
DECLARE
  v_from_team_id UUID;
  v_to_team_id UUID;
BEGIN
  -- Get teams involved
  SELECT from_team_id, to_team_id INTO v_from_team_id, v_to_team_id
  FROM trades WHERE id = p_trade_id;
  
  -- Calculate for proposing team
  RETURN QUERY
  WITH current_strength AS (
    SELECT t.id, t.name, t.team_strength_score
    FROM teams t
    WHERE t.id = v_from_team_id
  ),
  trade_details AS (
    SELECT 
      ti.from_team,
      array_agg(p.name) FILTER (WHERE ti.from_team = false) as players_gained,
      array_agg(p.name) FILTER (WHERE ti.from_team = true) as players_lost
    FROM trade_items ti
    LEFT JOIN players p ON ti.player_id = p.id
    WHERE ti.trade_id = p_trade_id AND ti.item_type = 'player'
    GROUP BY ti.from_team
  ),
  simulated_roster AS (
    -- Current roster minus outgoing players plus incoming players
    SELECT 
      AVG(CASE COALESCE(p.rank_estimate, p.rank)
        WHEN 'A' THEN 1.0
        WHEN 'B' THEN 2.0
        WHEN 'C' THEN 3.0
        ELSE 3.5
      END) as new_strength
    FROM players p
    WHERE p.team_id = v_from_team_id
      AND p.id NOT IN (
        SELECT player_id FROM trade_items 
        WHERE trade_id = p_trade_id AND from_team = true AND item_type = 'player'
      )
    UNION ALL
    SELECT 
      CASE COALESCE(p.rank_estimate, p.rank)
        WHEN 'A' THEN 1.0
        WHEN 'B' THEN 2.0
        WHEN 'C' THEN 3.0
        ELSE 3.5
      END
    FROM trade_items ti
    JOIN players p ON ti.player_id = p.id
    WHERE ti.trade_id = p_trade_id AND ti.from_team = false AND ti.item_type = 'player'
  )
  SELECT 
    cs.id,
    cs.name,
    COALESCE(td_gain.players_gained, ARRAY[]::TEXT[]),
    COALESCE(td_lose.players_lost, ARRAY[]::TEXT[]),
    cs.team_strength_score,
    ROUND(AVG(sr.new_strength)::numeric, 2),
    ROUND((cs.team_strength_score - AVG(sr.new_strength))::numeric, 2) -- Lower is better, so negative means improvement
  FROM current_strength cs
  CROSS JOIN simulated_roster sr
  LEFT JOIN trade_details td_gain ON td_gain.from_team = false
  LEFT JOIN trade_details td_lose ON td_lose.from_team = true
  GROUP BY cs.id, cs.name, cs.team_strength_score, td_gain.players_gained, td_lose.players_lost;
  
  -- Calculate for receiving team (similar logic with reversed from_team flags)
  -- ... (similar calculation for to_team)
  
END;
$$ LANGUAGE plpgsql;

-- Create view for active trades with details
CREATE OR REPLACE VIEW active_trades_detailed AS
WITH trade_players_from AS (
  SELECT 
    ti.trade_id,
    STRING_AGG(p.name || ' (' || COALESCE(p.rank_estimate, p.rank, 'U') || ')', ', ') as players
  FROM trade_items ti
  JOIN players p ON ti.player_id = p.id
  WHERE ti.from_team = true AND ti.item_type = 'player'
  GROUP BY ti.trade_id
),
trade_players_to AS (
  SELECT 
    ti.trade_id,
    STRING_AGG(p.name || ' (' || COALESCE(p.rank_estimate, p.rank, 'U') || ')', ', ') as players
  FROM trade_items ti
  JOIN players p ON ti.player_id = p.id
  WHERE ti.from_team = false AND ti.item_type = 'player'
  GROUP BY ti.trade_id
)
SELECT 
  t.id,
  t.created_at,
  t.status,
  t.notes,
  t.trade_deadline,
  ft.name as from_team_name,
  tt.name as to_team_name,
  COALESCE(tpf.players, 'None') as players_offered,
  COALESCE(tpt.players, 'None') as players_requested
FROM trades t
JOIN teams ft ON t.from_team_id = ft.id
JOIN teams tt ON t.to_team_id = tt.id
LEFT JOIN trade_players_from tpf ON t.id = tpf.trade_id
LEFT JOIN trade_players_to tpt ON t.id = tpt.trade_id
WHERE t.status = 'pending'
  AND (t.trade_deadline IS NULL OR t.trade_deadline > NOW())
ORDER BY t.created_at DESC;

-- Create function to execute accepted trades
CREATE OR REPLACE FUNCTION execute_trade(p_trade_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_from_team_id UUID;
  v_to_team_id UUID;
  v_status TEXT;
BEGIN
  -- Get trade details
  SELECT from_team_id, to_team_id, status 
  INTO v_from_team_id, v_to_team_id, v_status
  FROM trades WHERE id = p_trade_id;
  
  -- Verify trade is accepted
  IF v_status != 'accepted' THEN
    RAISE EXCEPTION 'Trade must be accepted before execution';
  END IF;
  
  -- Store evaluation before trade
  INSERT INTO trade_evaluations (trade_id, team_id, strength_before)
  SELECT p_trade_id, id, team_strength_score
  FROM teams WHERE id IN (v_from_team_id, v_to_team_id);
  
  -- Execute player swaps
  -- Move players from proposing team to receiving team
  UPDATE players p
  SET team_id = v_to_team_id
  FROM trade_items ti
  WHERE ti.trade_id = p_trade_id 
    AND ti.from_team = true 
    AND ti.item_type = 'player'
    AND ti.player_id = p.id;
  
  -- Move players from receiving team to proposing team
  UPDATE players p
  SET team_id = v_from_team_id
  FROM trade_items ti
  WHERE ti.trade_id = p_trade_id 
    AND ti.from_team = false 
    AND ti.item_type = 'player'
    AND ti.player_id = p.id;
  
  -- Update team strengths
  PERFORM update_team_strength();
  
  -- Store evaluation after trade
  UPDATE trade_evaluations te
  SET 
    strength_after = t.team_strength_score,
    strength_change = te.strength_before - t.team_strength_score
  FROM teams t
  WHERE te.trade_id = p_trade_id AND te.team_id = t.id;
  
  -- Update trade status
  UPDATE trades 
  SET status = 'completed', updated_at = NOW()
  WHERE id = p_trade_id;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Create trade history view
CREATE OR REPLACE VIEW trade_history_detailed AS
SELECT 
  t.id,
  t.created_at,
  t.updated_at,
  t.status,
  ft.name as from_team_name,
  tt.name as to_team_name,
  te_from.strength_change as from_team_impact,
  te_to.strength_change as to_team_impact,
  COUNT(DISTINCT ti.id) as total_items,
  COUNT(DISTINCT ti.player_id) as players_involved,
  -- Add player details for display
  STRING_AGG(DISTINCT 
    CASE WHEN ti.from_team = true AND ti.item_type = 'player' 
    THEN p.name 
    END, ', '
  ) as players_offered,
  STRING_AGG(DISTINCT 
    CASE WHEN ti.from_team = false AND ti.item_type = 'player' 
    THEN p.name 
    END, ', '
  ) as players_requested
FROM trades t
JOIN teams ft ON t.from_team_id = ft.id
JOIN teams tt ON t.to_team_id = tt.id
LEFT JOIN trade_evaluations te_from ON t.id = te_from.trade_id AND te_from.team_id = t.from_team_id
LEFT JOIN trade_evaluations te_to ON t.id = te_to.trade_id AND te_to.team_id = t.to_team_id
LEFT JOIN trade_items ti ON t.id = ti.trade_id
LEFT JOIN players p ON ti.player_id = p.id
WHERE t.status IN ('completed', 'declined', 'cancelled')
GROUP BY t.id, t.created_at, t.updated_at, t.status, ft.name, tt.name, te_from.strength_change, te_to.strength_change
ORDER BY t.updated_at DESC;