import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

function cleanSupabaseUrl(url: string | undefined): string {
  if (!url) return ''
  return url.replace(/\/rest\/v1\/?$/, '').replace(/\/+$/, '')
}

// This client uses the service role key for admin operations
// Only use this server-side!
export function createAdminClient() {
  return createClient<Database>(
    cleanSupabaseUrl(process.env.NEXT_PUBLIC_SUPABASE_URL),
    (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim()
  )
}
