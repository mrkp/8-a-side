# Vercel Deployment Setup

## Environment Variables

You need to add the following environment variables in your Vercel project settings:

1. Go to your Vercel project dashboard
2. Navigate to Settings → Environment Variables
3. Add these variables:

```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

Make sure to:
- Add them for all environments (Production, Preview, Development)
- Use the same values from your `.env.local` file
- Click "Save" after adding each variable

## Post-Deployment Steps

After deployment:

1. **Initialize the Database**:
   - First, run the schema from `/supabase/schema.sql` in your Supabase SQL Editor
   - Then visit `https://your-vercel-app.vercel.app/init-db`
   - Click "Initialize Database" to populate teams and players

2. **Verify the App**:
   - Go to your app URL
   - Select a team
   - Try ranking players and creating trades

## Build Warning

The webpack warning about "Serializing big strings" is just a performance notice and won't affect your deployment. It's safe to ignore.

## Domain Setup (Optional)

If you have a custom domain:
1. Go to Settings → Domains in Vercel
2. Add your domain
3. Follow the DNS configuration instructions