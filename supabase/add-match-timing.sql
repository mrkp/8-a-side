-- Add match timing fields to fixtures table
ALTER TABLE fixtures 
ADD COLUMN IF NOT EXISTS started_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS ended_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS paused_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS total_paused_time INTEGER DEFAULT 0; -- in seconds

-- Create an index for faster queries on live matches
CREATE INDEX IF NOT EXISTS idx_fixtures_started_at ON fixtures(started_at) WHERE started_at IS NOT NULL;

-- Function to calculate elapsed match time
CREATE OR REPLACE FUNCTION get_match_elapsed_seconds(
    p_started_at TIMESTAMPTZ,
    p_ended_at TIMESTAMPTZ,
    p_paused_at TIMESTAMPTZ,
    p_total_paused_time INTEGER
) RETURNS INTEGER AS $$
DECLARE
    v_end_time TIMESTAMPTZ;
    v_elapsed_seconds INTEGER;
BEGIN
    -- If match hasn't started, return 0
    IF p_started_at IS NULL THEN
        RETURN 0;
    END IF;
    
    -- Determine the end time (either when match ended or current time)
    IF p_ended_at IS NOT NULL THEN
        v_end_time := p_ended_at;
    ELSIF p_paused_at IS NOT NULL THEN
        v_end_time := p_paused_at;
    ELSE
        v_end_time := NOW();
    END IF;
    
    -- Calculate elapsed seconds
    v_elapsed_seconds := EXTRACT(EPOCH FROM (v_end_time - p_started_at))::INTEGER;
    
    -- Subtract paused time
    v_elapsed_seconds := v_elapsed_seconds - COALESCE(p_total_paused_time, 0);
    
    -- Ensure non-negative
    RETURN GREATEST(0, v_elapsed_seconds);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Example usage:
-- UPDATE fixtures SET started_at = NOW() WHERE id = 'fixture-id' AND status = 'live';
-- UPDATE fixtures SET ended_at = NOW(), status = 'completed' WHERE id = 'fixture-id';

-- To get elapsed time for any fixture:
-- SELECT get_match_elapsed_seconds(started_at, ended_at, paused_at, total_paused_time) as elapsed_seconds FROM fixtures WHERE id = 'fixture-id';