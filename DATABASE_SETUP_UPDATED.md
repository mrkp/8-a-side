# Database Setup Guide

## Quick Start

1. Go to [Supabase SQL Editor](https://supabase.com/dashboard/project/hsxtkklhmwztsssuzrkz/sql/new)
2. Run the schema script: Copy and paste contents from `supabase/schema.sql`
3. Run the seed script: Copy and paste contents from `supabase/seed-updated.sql`

## Verifying Setup

After running the scripts, you should see:
- 6 teams in the `teams` table
- Players distributed across teams
- Empty trades tables ready for use

## Manual Data Entry

If you prefer to add data manually through the Supabase UI:

### Teams (6 total)
1. Aioli (aioli@8aside.com)
2. WAM (wam@8aside.com)
3. FoodDrop (fooddrop@8aside.com)
4. Bliss (bliss@8aside.com)
5. Full Barrel (fullbarrel@8aside.com)
6. Mini Bar (minibar@8aside.com)

### Players by Team

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

### WAM (9 players)
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

## Player Rankings
- A = Elite players (1 player: Luke Ramdeen)
- B = Strong players (5 players)
- C = Average players (1 player: Liam Jarvis)
- Unranked = Most players start unranked

## Notes
- All players start unassigned to captains and not marked as professionals
- Rankings can be updated through the admin interface
- The tournament now runs with 6 teams after supplemental draft