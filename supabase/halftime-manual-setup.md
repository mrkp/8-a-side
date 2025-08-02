# Half-Time Feature Database Setup

To enable the half-time functionality, you need to add the following columns to your Supabase database:

## 1. Update the `fixtures` table

Add these columns:
- `current_half` - INTEGER, default: 1, check constraint: value IN (1, 2)
- `half_time_at` - TIMESTAMPTZ, nullable
- `second_half_started_at` - TIMESTAMPTZ, nullable

SQL commands:
```sql
ALTER TABLE fixtures 
ADD COLUMN current_half INTEGER DEFAULT 1 CHECK (current_half IN (1, 2));

ALTER TABLE fixtures 
ADD COLUMN half_time_at TIMESTAMPTZ;

ALTER TABLE fixtures 
ADD COLUMN second_half_started_at TIMESTAMPTZ;
```

## 2. Update the `events` table

Add this column:
- `half` - INTEGER, default: 1, check constraint: value IN (1, 2)

SQL command:
```sql
ALTER TABLE events
ADD COLUMN half INTEGER DEFAULT 1 CHECK (half IN (1, 2));

-- Update existing events to be in the first half
UPDATE events SET half = 1 WHERE half IS NULL;
```

## How to apply these changes:

1. Go to your Supabase Dashboard
2. Navigate to the SQL Editor
3. Run each command above
4. Or use the Table Editor to add columns manually with the specified constraints

The application is already updated to use these columns for tracking match halves.