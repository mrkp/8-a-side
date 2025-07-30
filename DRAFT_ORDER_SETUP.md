# Supplemental Draft Order Setup

## Original Friday Night Draft Order
Based on the original team selection from Friday night, the supplemental draft order has been set as:

1. **FoodDrop** - Should pick C player first
2. **Full Barrel** - Should pick C player first  
3. **Aioli**
4. **WAM**
5. **Bliss**
6. **Minibar**

## Important Notes

### For First Two Picks (FoodDrop & Full Barrel)
- These teams are trusted to select C-rated players with their first picks
- The interface will highlight C-rated players in yellow during their turns
- A warning message will remind them to pick C players

### How to Apply the Custom Draft Order

Run this SQL in your Supabase dashboard:
```sql
-- Execute the custom draft order script
/Users/markp/qpcc/8-a-side/supabase/set-custom-draft-order.sql
```

This will:
1. Create a custom draft order function
2. Override the automatic draft order (which was based on team strength)
3. Set the specific order as agreed

### Visual Indicators in the App

When using the supplemental draft at `/admin/supplemental`:
- First two picks will see a yellow warning box asking them to pick C players
- C-rated players will be highlighted in yellow for the first two picks
- The draft order shown will match the Friday night order

### After Running the Draft

Once all supplemental players are drafted:
1. Teams should have balanced rosters
2. Food Drop and Full Barrel will have added C players first
3. Remaining teams can pick based on their preferences

## Troubleshooting

If team names don't match exactly:
- The script handles variations (e.g., "Food Drop" vs "FoodDrop")
- Check the team names in the database if issues persist
- Update the name matching logic in the SQL script if needed