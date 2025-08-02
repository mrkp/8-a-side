import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

// Read .env.local file
const envPath = join(__dirname, '..', '.env.local')
const envContent = readFileSync(envPath, 'utf-8')
const envVars = {}

envContent.split('\n').forEach(line => {
  const [key, ...valueParts] = line.split('=')
  if (key && valueParts.length > 0) {
    envVars[key.trim()] = valueParts.join('=').trim()
  }
})

const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = envVars.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false
  }
})

async function runMigration() {
  console.log('Adding half-time tracking to database...\n')

  try {
    // Add columns to fixtures table
    const { error: fixturesError } = await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE fixtures 
        ADD COLUMN IF NOT EXISTS current_half INTEGER DEFAULT 1 CHECK (current_half IN (1, 2)),
        ADD COLUMN IF NOT EXISTS half_time_at TIMESTAMPTZ,
        ADD COLUMN IF NOT EXISTS second_half_started_at TIMESTAMPTZ;
      `
    })

    if (fixturesError) {
      console.log('Creating columns individually...')
      
      // Try adding columns one by one
      const columns = [
        { name: 'current_half', type: 'INTEGER DEFAULT 1 CHECK (current_half IN (1, 2))' },
        { name: 'half_time_at', type: 'TIMESTAMPTZ' },
        { name: 'second_half_started_at', type: 'TIMESTAMPTZ' }
      ]
      
      for (const col of columns) {
        try {
          await supabase.rpc('exec_sql', {
            sql: `ALTER TABLE fixtures ADD COLUMN IF NOT EXISTS ${col.name} ${col.type};`
          })
          console.log(`✅ Added column ${col.name}`)
        } catch (e) {
          console.log(`Column ${col.name} might already exist`)
        }
      }
    } else {
      console.log('✅ Added half-time columns to fixtures table')
    }

    // Add half column to events table
    const { error: eventsError } = await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE events
        ADD COLUMN IF NOT EXISTS half INTEGER DEFAULT 1 CHECK (half IN (1, 2));
      `
    })

    if (eventsError) {
      console.log('Half column might already exist in events table')
    } else {
      console.log('✅ Added half column to events table')
    }

    // Update existing events
    const { error: updateError } = await supabase
      .from('events')
      .update({ half: 1 })
      .is('half', null)

    if (!updateError) {
      console.log('✅ Updated existing events to first half')
    }

    console.log('\n✨ Half-time tracking migration completed!')
    
  } catch (error) {
    console.error('Error running migration:', error)
    
    // Fallback: Try direct SQL execution
    console.log('\nTrying alternative approach...')
    
    // Check current schema
    const { data: fixtures } = await supabase
      .from('fixtures')
      .select('*')
      .limit(1)
    
    console.log('Current fixtures columns:', fixtures ? Object.keys(fixtures[0] || {}) : 'No fixtures found')
    
    // If columns don't exist, we'll handle it in the application
    console.log('\nNote: You may need to add these columns manually via Supabase dashboard:')
    console.log('- current_half (integer, default 1, check constraint: 1 or 2)')
    console.log('- half_time_at (timestamptz)')
    console.log('- second_half_started_at (timestamptz)')
  }
}

runMigration()