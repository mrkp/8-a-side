import { createClient } from '@/utils/supabase/client'

export function debugRealtime() {
  const supabase = createClient()
  
  // Check if WebSocket is connecting
  const realtimeSocket = (supabase as any).realtime?.socket
  if (realtimeSocket) {
    console.log('WebSocket state:', realtimeSocket.readyState)
    console.log('WebSocket URL:', realtimeSocket.url)
  }
  
  // List all active channels
  const channels = (supabase as any).realtime?.channels || []
  console.log('Active channels:', channels.length)
  channels.forEach((channel: any, index: number) => {
    console.log(`Channel ${index}:`, {
      topic: channel.topic,
      state: channel.state,
      joined: channel.joined,
      bindings: channel.bindings?.length || 0
    })
  })
  
  // Check Supabase configuration
  console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
  console.log('Real-time enabled:', (supabase as any).realtime?.params?.eventsPerSecond)
}

export function testRealtimeConnection() {
  const supabase = createClient()
  
  console.log('Testing real-time connection...')
  
  const testChannel = supabase
    .channel('connection-test')
    .on('presence', { event: 'sync' }, () => {
      console.log('Presence sync successful')
    })
    .subscribe((status, err) => {
      console.log('Test channel status:', status)
      if (err) console.error('Test channel error:', err)
      
      if (status === 'SUBSCRIBED') {
        console.log('✅ Real-time connection successful')
        // Clean up test channel
        setTimeout(() => {
          supabase.removeChannel(testChannel)
          console.log('Test channel removed')
        }, 1000)
      }
    })
}