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
const supabaseKey = envVars.SUPABASE_SERVICE_ROLE_KEY || envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkRealtimeSettings() {
  console.log('Testing real-time functionality...\n')

  try {
    // Test subscribing to events table
    console.log('1. Setting up real-time subscription to events table...')
    
    const channel = supabase
      .channel('test-events-channel')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'events'
        },
        (payload) => {
          console.log('Real-time event received:', payload)
        }
      )
      .subscribe((status) => {
        console.log('Subscription status:', status)
        
        if (status === 'SUBSCRIBED') {
          console.log('✅ Successfully subscribed to events table real-time updates')
          
          // Clean up after 5 seconds
          setTimeout(() => {
            supabase.removeChannel(channel)
            console.log('\nTest completed. Channel removed.')
            process.exit(0)
          }, 5000)
        } else if (status === 'CHANNEL_ERROR') {
          console.error('❌ Failed to subscribe. Real-time might not be enabled for the events table.')
          console.log('\nTo enable real-time for the events table:')
          console.log('1. Go to your Supabase dashboard')
          console.log('2. Navigate to Database > Replication')
          console.log('3. Enable replication for the "events" table')
          process.exit(1)
        }
      })

    // Also test fixtures table
    console.log('\n2. Testing fixtures table subscription...')
    const fixtureChannel = supabase
      .channel('test-fixtures-channel')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'fixtures'
        },
        (payload) => {
          console.log('Fixture update received:', payload)
        }
      )
      .subscribe((status) => {
        console.log('Fixtures subscription status:', status)
      })

  } catch (error) {
    console.error('Error:', error)
  }
}

checkRealtimeSettings()