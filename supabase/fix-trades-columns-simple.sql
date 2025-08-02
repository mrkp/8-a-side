-- Fix trades table structure if columns are missing

-- Add from_team_id if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'trades' AND column_name = 'from_team_id') THEN
    ALTER TABLE trades ADD COLUMN from_team_id UUID REFERENCES teams(id) NOT NULL;
    RAISE NOTICE 'Added from_team_id column';
  ELSE
    RAISE NOTICE 'from_team_id column already exists';
  END IF;
END $$;

-- Add to_team_id if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'trades' AND column_name = 'to_team_id') THEN
    ALTER TABLE trades ADD COLUMN to_team_id UUID REFERENCES teams(id) NOT NULL;
    RAISE NOTICE 'Added to_team_id column';
  ELSE
    RAISE NOTICE 'to_team_id column already exists';
  END IF;
END $$;

-- Add trade_type if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'trades' AND column_name = 'trade_type') THEN
    ALTER TABLE trades ADD COLUMN trade_type TEXT CHECK (trade_type IN ('standard', 'three_team', 'conditional')) DEFAULT 'standard';
    RAISE NOTICE 'Added trade_type column';
  ELSE
    RAISE NOTICE 'trade_type column already exists';
  END IF;
END $$;

-- Add indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_trades_from_team ON trades(from_team_id);
CREATE INDEX IF NOT EXISTS idx_trades_to_team ON trades(to_team_id);

-- Force schema cache refresh with a simple comment
COMMENT ON TABLE trades IS 'Schema updated for trading system';

-- Verify final structure
SELECT 'Final trades table structure:' as status;
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'trades'
ORDER BY ordinal_position;