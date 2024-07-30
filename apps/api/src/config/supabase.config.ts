// src/config/supabase.config.ts
import { createClient } from '@supabase/supabase-js';

let supabase = null;

if (process.env.NODE_ENV !== 'test') {
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_KEY) {
    throw new Error('SUPABASE_URL and SUPABASE_KEY must be set');
  }
  supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
}

export { supabase };
