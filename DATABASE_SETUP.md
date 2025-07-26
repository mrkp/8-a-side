# Database Setup Guide

## Step 1: Create Database Schema

1. Go to your Supabase Dashboard: https://supabase.com/dashboard/project/[your-project-id]
2. Click on "SQL Editor" in the left sidebar
3. Click "New query"
4. Copy and paste the entire contents of `/supabase/schema.sql` into the editor
5. Click "Run" (or press Cmd/Ctrl + Enter)

You should see a success message indicating all tables, indexes, policies, and functions were created.

**Note**: The schema uses PostgreSQL's native UUID type for all entity IDs. UUIDs are auto-generated for all tables.

## Step 2: Initialize Data

1. Make sure your development server is running:
   ```bash
   npm run dev
   ```

2. Open your browser and go to: http://localhost:3000/init-db

3. You'll see a page with:
   - A warning that this will clear existing data
   - An "Initialize Database" button

4. Click "Initialize Database"

5. The page will show progress as it:
   - Clears any existing data
   - Inserts 8 teams
   - Inserts 70 players assigned to their respective teams

6. When complete, you'll see "✅ Database initialized successfully!"

## Step 3: Verify Setup

1. Go to http://localhost:3000
2. You should see all 8 teams listed
3. Click "View Tournament Overview →" to see all teams and players
4. Click on any team to view and manage their roster
5. Try ranking some players (A, B, or C)
6. Try proposing a trade to another team

## Teams and Initial Rosters

### Aioli (9 players)
- Adrian Almandoz
- Garvin Harripersad
- Dominic Chong
- Fazil Salim
- Gagan Kataria
- Hakeem Norfus
- Ihsan Hamoui
- Jesse Lalla
- Jesse Persad

### Wam! (9 players)
- Joel Ogeer
- Jonathan Low (B)
- Joshua Joseph (B)
- Joshua Mitchell
- Justin Pinder
- Kairab Maharaj
- Keegan Superville
- Kieran Rampersad
- Liam Gomez

### FoodDrop (8 players)
- Liam Jarvis (C)
- Lindon Ragoonanan
- Luke Habib
- Luke Ramdeen (A)
- Mario Pereira
- Mark Perreira
- Mark Samaroo
- Martin Seeterram (B)

### Bliss (9 players)
- Matisse Nunes
- Matthew Pantin
- Nathan Duncan
- Nick Rouse (B)
- Patrick O'Brien
- Sean De Silva
- Richard Fifi
- Shane Singh
- Stefan Young

### Karcher (8 players)
- Charles Hadden
- Sheaun Sarju
- Simon Clarke
- Stephen Clarke
- Stephen Hooper (B)
- Stephen Seetaram
- Suraj
- Timothy Riley

### Full Barrel (9 players)
- Timothy Shafique
- Tommy Dolphy
- Uriah Roopnarine
- Vivin Ramoutar
- William Ramcharan
- Yakeem Mitchell
- Yanick Ramlal
- Yasir Phillip
- David Isava

### Ready Freddie (9 players)
- Aaron Ali
- Aatif Ali
- Adam Khan
- Adrian Seunarine
- Afraz Ali
- Aidan Lakhan
- Alan Reid
- Aldane King
- Aleem Hosein

### Mini Bar (9 players)
- Alistair Bobb
- Ameer Ali
- Andel Harley
- Andrew Davis
- Andrew De Gannes
- Andrew Jagbir
- Andrew McBurnie
- Andrew Poon
- Andrew Reyes

## Troubleshooting

If you encounter errors during schema creation:
- Make sure you're using the correct Supabase project
- Check that UUID extension is enabled (the schema should handle this automatically)
- Verify your Supabase credentials in `.env.local`

If the init-db page shows errors:
- Check browser console for detailed error messages
- Ensure your Supabase anon key has proper permissions
- Try running the schema creation again