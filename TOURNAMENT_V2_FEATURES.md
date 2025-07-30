# QPCC Tournament V2 - New Features Guide

## Overview
The QPCC 8-A-Side tournament has been enhanced with team balancing features to handle team drops and ensure fair competition.

## What's New

### 1. Player Skill Ranking System (`/admin/rank`)
- **Purpose**: Create fair team rankings based on peer voting
- **How it works**:
  - Each player can vote on other players' skill levels (A/B/C)
  - System calculates average rankings from all votes
  - Rankings help determine team strength

### 2. Team Strength Analysis (`/admin/teams`)
- **Purpose**: View and balance team strengths
- **Features**:
  - Visual team strength scores (1.0 = strongest, 3.0 = weakest)
  - Color-coded strength indicators
  - Shows teams that need more players
  - Identifies imbalanced teams

### 3. Supplemental Draft (`/admin/supplemental`)
- **Purpose**: Fairly distribute players from dropped teams
- **Draft Order**:
  1. Teams with fewer players pick first
  2. Among equal sizes, weaker teams pick first
- **Features**:
  - Shows player preferences (who they want to play with)
  - Displays player rankings
  - Real-time draft interface

### 4. Team Drops Handled
- **Ready Freddie** and **Karcher** have been marked as dropped
- Their players are now in the supplemental draft pool
- Remaining 6 teams can draft these players

## Database Setup

### To apply the new schema:
1. Run the tournament v2 schema:
```sql
-- In Supabase SQL editor, run:
/Users/markp/qpcc/8-a-side/supabase/tournament-v2-schema.sql
```

2. Process the team drops:
```sql
-- In Supabase SQL editor, run:
/Users/markp/qpcc/8-a-side/supabase/process-team-drops.sql
```

## How to Use

### For Admins:

1. **Start with Player Rankings** (`/admin/rank`)
   - Have all players vote on each other's skill levels
   - This creates the foundation for fair team balancing

2. **Check Team Balance** (`/admin/teams`)
   - View current team strengths
   - Identify which teams need more players
   - See the overall league balance

3. **Run Supplemental Draft** (`/admin/supplemental`)
   - Distribute players from dropped teams
   - Follow the automatic draft order
   - Respect player preferences where possible

4. **Manage Trades** (`/admin/trades`)
   - Review trade proposals
   - Ensure trades maintain team balance
   - Approve or reject based on fairness

### Key Concepts:

- **Team Strength Score**: 
  - 1.0-1.5 = Very Strong (mostly A players)
  - 1.5-2.0 = Strong
  - 2.0-2.5 = Balanced
  - 2.5-3.0 = Weak
  - 3.0+ = Needs support

- **Player Rankings**:
  - A = Elite players
  - B = Strong players
  - C = Average players

- **Draft Priority**:
  - Teams with fewer players get priority
  - Weaker teams pick before stronger teams

## Next Steps

1. Have all players complete skill voting
2. Run the supplemental draft to distribute ex-Ready Freddie and Karcher players
3. Generate fixtures for 6-team tournament
4. Begin matches!

## Technical Details

### New Database Tables:
- `player_votes` - Stores skill voting data
- `supplemental_players` - Tracks players available for draft
- `team_requests` - Handles team drop requests
- `draft_history` - Records all draft picks

### New Views:
- `player_rankings` - Calculated player rankings
- `team_strength` - Team balance metrics
- `supplemental_draft_order` - Draft pick order

### Updated Tables:
- `players` - Added rank_estimate, preferred_teammate_id
- `teams` - Added team_strength_score, active status, division