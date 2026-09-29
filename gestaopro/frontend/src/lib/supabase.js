import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!url || url.includes('SEU-PROJETO')) {
  console.warn('⚠️  Configure VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY em frontend/.env');
}

// Chave "anon": pode ficar no frontend, é protegida pelas regras de RLS do Supabase.
export const supabase = createClient(url, anonKey);
