import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  // In development/build warning if keys are not loaded yet
  console.warn('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY');
}

/**
 * Public anon Supabase client for client-side queries and public reads
 * Governed strictly by Supabase Row Level Security (RLS) policies.
 */
export const supabase = createClient(
  supabaseUrl || '',
  supabaseAnonKey || ''
);
