# QPCC 8-A-SIDE Football Tournament Draft & Trade Manager

## Project Overview

A web application for managing the QPCC 8-A-SIDE Football Tournament where sponsor teams draft and trade players. Built with Next.js 14 (App Router), TypeScript, Supabase, and shadcn/ui.

## Key Features

### 1. Team Management
- 8 sponsor teams manage their roster of players
- Each team has secure authentication (team-specific login)
- Teams can only modify their own data

### 2. Player Ranking System
- Players assigned ranks: A (elite), B (strong), C (average), or unranked
- Visual indicators for player quality
- Sortable player lists by rank

### 3. Trading System
- Teams propose trades (player swaps)
- Trade proposals include:
  - Players offered from proposing team
  - Players requested from target team
  - Optional notes/comments
- Target team can accept or decline trades
- Accepted trades automatically swap players
- Trade history and audit log

### 4. Views
- **Team Dashboard**: Manage your roster, view/propose trades
- **Tournament View**: See all teams and their ranked players
- **Trade Center**: Active trades, trade history
- **Admin Panel**: Tournament organizer controls

## Technical Architecture

### Frontend Structure
```
src/
├── app/
│   ├── (auth)/           # Authentication routes
│   │   ├── login/
│   │   └── register/
│   ├── (dashboard)/      # Protected routes
│   │   ├── team/         # Team management
│   │   ├── trades/       # Trade center
│   │   └── tournament/   # Tournament overview
│   ├── admin/            # Admin panel
│   └── api/              # API routes (if needed)
├── components/
│   ├── ui/               # shadcn components
│   ├── auth/             # Auth components
│   ├── team/             # Team-specific components
│   └── trades/           # Trade components
├── lib/
│   ├── supabase/         # Supabase client & utilities
│   ├── utils/            # Helper functions
│   └── types/            # TypeScript types
└── hooks/                # Custom React hooks
```

### Database Schema (Supabase)

```sql
-- Teams table
CREATE TABLE teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Players table
CREATE TABLE players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  team_id UUID REFERENCES teams(id),
  rank CHAR(1) CHECK (rank IN ('A', 'B', 'C', NULL)),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trades table
CREATE TABLE trades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_team_id UUID REFERENCES teams(id) NOT NULL,
  to_team_id UUID REFERENCES teams(id) NOT NULL,
  status TEXT CHECK (status IN ('pending', 'accepted', 'declined', 'cancelled')) DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  responded_at TIMESTAMPTZ
);

-- Trade players junction table
CREATE TABLE trade_players (
  trade_id UUID REFERENCES trades(id) ON DELETE CASCADE,
  player_id UUID REFERENCES players(id),
  direction TEXT CHECK (direction IN ('from', 'to')) NOT NULL,
  PRIMARY KEY (trade_id, player_id)
);

-- Trade history (audit log)
CREATE TABLE trade_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trade_id UUID REFERENCES trades(id),
  action TEXT NOT NULL,
  team_id UUID REFERENCES teams(id),
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Row Level Security (RLS)

```sql
-- Teams can only update their own players
ALTER TABLE players ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Teams can view all players" ON players
  FOR SELECT USING (true);

CREATE POLICY "Teams can update own players" ON players
  FOR UPDATE USING (team_id = auth.uid());

-- Trade policies
ALTER TABLE trades ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Teams can view trades involving them" ON trades
  FOR SELECT USING (
    from_team_id = auth.uid() OR to_team_id = auth.uid()
  );

CREATE POLICY "Teams can create trades" ON trades
  FOR INSERT WITH CHECK (from_team_id = auth.uid());

CREATE POLICY "Teams can update trades sent to them" ON trades
  FOR UPDATE USING (to_team_id = auth.uid() AND status = 'pending');
```

### Authentication Flow

1. Each team has a unique login (email/password or magic link)
2. Supabase Auth handles authentication
3. Team ID stored in JWT claims
4. Middleware protects routes requiring authentication
5. RLS ensures data security at database level

### Real-time Features

- Live trade notifications using Supabase Realtime
- Instant roster updates when trades are accepted
- Tournament leaderboard updates

### State Management

- Server Components for initial data loading
- React Query or SWR for client-side data fetching
- Optimistic updates for better UX
- Supabase subscriptions for real-time updates

## Development Workflow

### Using Production Database Locally

1. **Install Supabase CLI**
   ```bash
   npm install -g supabase
   ```

2. **Link to production project**
   ```bash
   supabase link --project-ref [your-project-ref]
   ```

3. **Pull schema and migrations**
   ```bash
   supabase db pull
   ```

4. **Set up environment variables**
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your-project-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-key
   ```

5. **Generate types**
   ```bash
   supabase gen types typescript --linked > src/lib/supabase/types.ts
   ```

### Deployment

1. Push to GitHub
2. Vercel automatically deploys
3. Database migrations handled via Supabase Dashboard or CLI

## API Endpoints (Server Actions)

### Team Actions
- `getTeam(teamId)` - Get team details
- `updatePlayerRank(playerId, rank)` - Update player ranking

### Trade Actions
- `proposeTrade(tradeData)` - Create new trade proposal
- `respondToTrade(tradeId, response)` - Accept/decline trade
- `cancelTrade(tradeId)` - Cancel pending trade
- `getTradeHistory(teamId)` - Get team's trade history

### Tournament Actions
- `getTournamentOverview()` - All teams and players
- `getPlayerStats()` - Player statistics

## Component Examples

### Player Card
```typescript
interface PlayerCardProps {
  player: Player
  onRankChange?: (rank: string) => void
  selectable?: boolean
  selected?: boolean
  onSelect?: () => void
}
```

### Trade Proposal
```typescript
interface TradeProposalProps {
  fromTeam: Team
  toTeam: Team
  onSubmit: (trade: TradeData) => void
}
```

## Security Considerations

1. **Authentication**: Mandatory for all team operations
2. **Authorization**: RLS ensures teams can only modify their data
3. **Input Validation**: Zod schemas for all inputs
4. **Rate Limiting**: Prevent spam trades
5. **Audit Logging**: Track all trade activities

## Performance Optimizations

1. **Static Generation**: Tournament overview page
2. **Dynamic Rendering**: Team dashboards
3. **Parallel Data Loading**: Multiple Supabase queries
4. **Optimistic Updates**: Instant UI feedback
5. **Image Optimization**: Team logos and player photos

## Testing Strategy

1. **Unit Tests**: Utility functions and hooks
2. **Integration Tests**: API routes and database operations
3. **E2E Tests**: Critical user flows (login, trade, accept)
4. **Visual Regression**: Component screenshots

## Monitoring

1. **Vercel Analytics**: Page performance
2. **Supabase Dashboard**: Database metrics
3. **Error Tracking**: Sentry integration
4. **User Analytics**: Track feature usage

## Future Enhancements

1. **Draft System**: Initial player selection process
2. **Trade Deadline**: Time-based trade restrictions
3. **Player Stats**: Performance tracking
4. **Mobile App**: React Native version
5. **Notifications**: Email/SMS for trade proposals
6. **Advanced Analytics**: Trade value calculations