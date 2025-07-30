# Two-Phase Supplemental Draft System

## Overview
The supplemental draft now operates in two distinct phases to ensure fair team balancing:

### Phase 1: C Player Selection
**Purpose**: Ensure teams that need C-rated players get them first
**Teams & Order**:
1. **FoodDrop** - Must pick a C player
2. **Full Barrel** - Must pick a C player

### Phase 2: Open Draft
**Purpose**: Regular draft where teams can pick any available player
**Order** (repeating):
1. FoodDrop
2. Minibar
3. Full Barrel
4. Bliss
5. WAM
6. Aioli

## How It Works

### Phase 1 (Picks 1-2)
- Only C-rated players are highlighted in yellow
- Interface shows "Phase 1: C Player Selection" badge
- Warning appears if non-C player is selected
- Draft confirmation will warn if wrong player type is chosen

### Phase 2 (Picks 3+)
- All players available for selection
- Standard draft rules apply
- Teams pick in the rotating order shown above
- Order repeats until all players are drafted

## Visual Indicators

1. **Draft Status Panel**:
   - Shows current phase (Phase 1 or Phase 2)
   - Yellow warning box during Phase 1
   - Current picking team highlighted

2. **Player Cards**:
   - C-rated players highlighted in yellow during Phase 1
   - Normal appearance during Phase 2

3. **Draft Order Display**:
   - Phase 1 picks shown separately with "C" badge
   - Phase 2 picks shown with "Any" badge
   - Current pick highlighted in primary color

## Implementation

To apply this draft system, run:
```sql
/Users/markp/qpcc/8-a-side/supabase/set-two-phase-draft-order.sql
```

This creates:
- `get_draft_team_for_pick()` - Determines which team picks at any position
- `get_supplemental_draft_order()` - Returns current picking team
- `get_full_draft_order_display()` - Shows complete draft order for UI

## Example Draft Sequence

1. **Pick 1**: FoodDrop (must pick C)
2. **Pick 2**: Full Barrel (must pick C)
3. **Pick 3**: FoodDrop (any player)
4. **Pick 4**: Minibar (any player)
5. **Pick 5**: Full Barrel (any player)
6. **Pick 6**: Bliss (any player)
7. **Pick 7**: WAM (any player)
8. **Pick 8**: Aioli (any player)
9. **Pick 9**: FoodDrop (any player)
10. **Pick 10**: Minibar (any player)
... and so on

The Phase 2 order continues rotating through all 6 teams until all supplemental players are drafted.