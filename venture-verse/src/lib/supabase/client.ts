import { createClientComponentClient } from '@supabase/ssr'
import { Database } from '../database.types'

export function createClient() {
  return createClientComponentClient<Database>()
}