-- Simple check of trades table structure
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'trades' 
ORDER BY ordinal_position;