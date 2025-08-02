-- Check the actual structure of the trades table
SELECT 'Current trades table columns:' as status;
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'trades'
ORDER BY ordinal_position;

-- Check if the table has the expected columns
SELECT 'Checking for required columns:' as status;
SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'trades' AND column_name = 'from_team_id') 
    THEN 'from_team_id column EXISTS' 
    ELSE 'from_team_id column MISSING' 
  END as from_team_check,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'trades' AND column_name = 'to_team_id') 
    THEN 'to_team_id column EXISTS' 
    ELSE 'to_team_id column MISSING' 
  END as to_team_check;

-- If columns are missing, let's check what columns DO exist
SELECT 'All table columns in public schema:' as status;
SELECT 
  t.table_name,
  array_agg(c.column_name ORDER BY c.ordinal_position) as columns
FROM information_schema.tables t
JOIN information_schema.columns c ON t.table_name = c.table_name
WHERE t.table_schema = 'public' 
  AND t.table_name IN ('trades', 'trade_items', 'trade_players')
GROUP BY t.table_name
ORDER BY t.table_name;

-- Force schema cache refresh by making a small change
-- This is a Supabase-specific workaround for schema cache issues
COMMENT ON TABLE trades IS 'Updated at ' || NOW()::TEXT;