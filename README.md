# 8-a-Side Tournament Draft & Trade Manager

A web application for managing an 8-a-side cricket tournament with team-based player trading.

## Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Set up Supabase Database

1. Go to your [Supabase project SQL Editor](https://supabase.com/dashboard/project/_/sql)
2. Run the schema creation script from `supabase/schema.sql`
3. Run the seed data script from `supabase/seed.sql`

### 3. Environment Variables

The `.env.local` file is already configured with the production Supabase credentials.

### 4. Run the development server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## Features

- **Team Management**: 8 sponsor teams manage their players
- **Player Rankings**: Assign A/B/C rankings to players
- **Trading System**: Propose and accept/decline trades between teams
- **Tournament View**: See all teams and their players
- **Real-time Updates**: Changes reflected instantly across all users

## Teams

1. Aioli
2. Wam!
3. FoodDrop
4. Bliss
5. Karcher
6. Full Barrel
7. Ready Freddie
8. Mini Bar

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- Supabase (PostgreSQL + Auth + Realtime)
- Tailwind CSS + shadcn/ui
- Vercel (deployment)

## Database Schema

See `supabase/schema.sql` for the complete database structure including:
- Teams table
- Players table with ranking system
- Trades table with status tracking
- Trade history for audit logging
- Row Level Security policies

## Development

The app uses the production Supabase database directly. Any changes made locally will affect the production data.

## Deployment

Push to GitHub and Vercel will automatically deploy. The Supabase environment variables are already configured.