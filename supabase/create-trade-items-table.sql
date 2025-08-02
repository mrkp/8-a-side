-- Create trade_items table if it doesn't exist
-- This is needed for the enhanced trading system

-- First check if the table exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'trade_items') THEN
    -- Create trade_items table for flexible trade components
    CREATE TABLE trade_items (
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
    CREATE INDEX idx_trade_items_trade ON trade_items(trade_id);
    CREATE INDEX idx_trade_items_player ON trade_items(player_id) WHERE item_type = 'player';
    
    RAISE NOTICE 'trade_items table created successfully';
  ELSE
    RAISE NOTICE 'trade_items table already exists';
  END IF;
END $$;

-- Add missing columns to trades table if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'trades' AND column_name = 'trade_type') THEN
    ALTER TABLE trades ADD COLUMN trade_type TEXT CHECK (trade_type IN ('standard', 'three_team', 'conditional')) DEFAULT 'standard';
    RAISE NOTICE 'Added trade_type column to trades table';
  END IF;
END $$;

-- Test that everything works
SELECT 'Trade tables ready for use' as status;