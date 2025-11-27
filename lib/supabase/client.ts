import { createClientComponentClient } from '@supabase/supabase-js'
import { Database } from './types'

export const createClient = () => {
  return createClientComponentClient<Database>()
}
