import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.warn('⚠️  Faltam SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY no backend/.env');
}

// Usa a service_role key: só o backend pode ver isto, nunca o browser.
export const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);
