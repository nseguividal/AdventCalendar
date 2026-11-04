import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

function cleanSupabaseUrl(url: string | undefined): string {
  if (!url) return ''
  // Strip trailing /rest/v1 or trailing slashes if user copied REST URL instead of Project URL
  return url.replace(/\/rest\/v1\/?$/, '').replace(/\/+$/, '')
}

const supabaseUrl = cleanSupabaseUrl(process.env.NEXT_PUBLIC_SUPABASE_URL)
const supabaseAnonKey = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '').trim()

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)
