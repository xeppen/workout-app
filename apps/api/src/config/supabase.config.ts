// src/config/supabase.config.ts
import { createClient } from '@supabase/supabase-js';

export function getSupabaseClient() {
  if (process.env.NODE_ENV === 'test') {
    return null;
  }

  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_KEY) {
    throw new Error('SUPABASE_URL and SUPABASE_KEY must be set');
  }

  return createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
}

export let supabase = null;

if (process.env.NODE_ENV !== 'test') {
  supabase = getSupabaseClient();
}
