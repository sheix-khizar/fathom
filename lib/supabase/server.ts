import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Ensure this client is never invoked or bundled into the browser
if (typeof window !== 'undefined') {
  throw new Error('lib/supabase/server.ts cannot be imported or executed in the client browser.');
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.warn('Missing SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_URL in server environment');
}

/**
 * Server-only Supabase client initialized with the SERVICE_ROLE_KEY.
 * Bypasses RLS for secure backend API operations, data ingestion, and seed scripts.
 * MUST NEVER be sent to or imported by client-side code.
 */
export const supabaseAdmin = createClient(
  supabaseUrl || '',
  serviceRoleKey || '',
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  }
);
