import { createClient } from '@supabase/supabase-js';

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.NEXT_PUBLIC_ClassSport_SUPABASE_URL ||
  process.env.ClassSport_SUPABASE_URL ||
  'https://placeholder.supabase.co';

const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_ClassSport_SUPABASE_ANON_KEY ||
  process.env.ClassSport_SUPABASE_ANON_KEY ||
  'placeholder-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Get Supabase client with service role key for admin operations.
 * Used only in bootstrap and dataService for admin queries.
 *
 * Forces `cache: 'no-store'` on the underlying fetch so Next.js's data cache
 * doesn't memoize transactional reads (reservations, availability, etc.).
 */
export function getSupabaseAdmin() {
  const url =
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.NEXT_PUBLIC_ClassSport_SUPABASE_URL ||
    process.env.ClassSport_SUPABASE_URL ||
    'https://placeholder.supabase.co';

  const serviceRoleKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.ClassSport_SUPABASE_SERVICE_ROLE_KEY ||
    'placeholder-service-key';

  return createClient(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input: RequestInfo | URL, init?: RequestInit) =>
        fetch(input, { ...init, cache: 'no-store' }),
    },
  });
}
