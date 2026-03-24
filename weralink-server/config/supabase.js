import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_SECRET_KEY } from './env.js';

if (!SUPABASE_URL || !SUPABASE_SECRET_KEY) {
  console.warn("Warning: Missing SUPABASE_URL or SUPABASE_SECRET_KEY environment variables. The Auth client will fail.");
}

export const supabase = createClient(SUPABASE_URL || "", SUPABASE_SECRET_KEY || "", {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});
