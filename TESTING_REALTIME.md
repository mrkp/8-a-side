# Testing Real-time Updates on Scoreboard

## The Issue (FIXED)
The scoreboard at `/scoreboard/[fixtureId]` was not updating in real-time when goals are scored. This has been fixed!

### What was wrong:
- The useEffect hook had too many dependencies causing infinite re-renders
- Subscriptions were being created and immediately destroyed in a loop
- This prevented real-time updates from working properly

## What We've Done to Fix It

1. **Created a robust real-time hook** (`/src/hooks/useRealtimeFixture.ts`)
   - Handles Supabase real-time subscriptions
   - Includes automatic polling as a fallback (every 3 seconds)
   - Better error handling and connection status tracking

2. **Refactored the scoreboard** to use a client component
   - Split into server component (`page.tsx`) and client component (`scoreboard-client.tsx`)
   - Uses the new real-time hook for better reliability

3. **Added debugging utilities** (`/src/utils/debug-realtime.ts`)
   - Helps diagnose connection issues
   - Tests WebSocket connectivity

4. **SQL script for real-time setup** (`/supabase/verify-realtime.sql`)
   - Ensures tables have proper replica identity
   - Sets up publication for real-time

## How to Test

1. **Open the scoreboard in one browser tab:**
   ```
   http://localhost:3001/scoreboard/04894c51-ebbf-4051-a0d1-3c87316a873e
   ```

2. **Open the admin scoring page in another tab:**
   ```
   http://localhost:3001/admin/score
   ```

3. **In the admin page:**
   - Select the match
   - Start the match if it's not already live
   - Add a goal for either team
   - Select the player who scored
   - Optionally select who assisted
   - Click "Record Goal"

4. **Check the scoreboard tab:**
   - The score should update within 3 seconds (due to polling fallback)
   - You should see the goal celebration animation
   - The goal scorer should appear under the team name

## Check Browser Console

In the scoreboard tab, open the browser console (F12) and look for:
- "Successfully subscribed to fixture updates"
- "Successfully subscribed to events"
- "Fixture UPDATE received:" messages when scores change
- "New event INSERT received:" messages when goals are scored

## If Real-time Still Doesn't Work

1. **The polling fallback will ensure updates every 3 seconds**
   - This is automatic and doesn't require any action

2. **Check Supabase Dashboard:**
   - Go to your Supabase project dashboard
   - Navigate to Database → Replication
   - Ensure "fixtures" and "events" tables are enabled for real-time

3. **Manual Enable Real-time (if needed):**
   In Supabase SQL editor, run:
   ```sql
   -- Enable real-time for tables
   ALTER PUBLICATION supabase_realtime ADD TABLE fixtures;
   ALTER PUBLICATION supabase_realtime ADD TABLE events;
   ```

## Notes
- The browser console errors about "runtime.lastError" are from browser extensions and can be ignored
- Real-time requires WebSocket connections which might be blocked by some firewalls/proxies
- The 3-second polling ensures the scoreboard stays updated even if real-time fails