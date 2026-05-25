import { NextRequest, NextResponse } from 'next/server';
import { getSystemMode, listUsers, getBlocks, getSlots, getRooms } from '@/lib/dataService';
import { getAppliedMigrations, getPendingMigrations } from '@/lib/pgMigrate';
import { getSupabaseAdmin } from '@/lib/supabase';

function envPresent(...names: string[]): boolean {
  return names.some((n) => Boolean(process.env[n]));
}

async function pingSupabase(): Promise<'connected' | 'unreachable' | 'not_configured'> {
  const hasUrl = envPresent(
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_ClassSport_SUPABASE_URL',
    'ClassSport_SUPABASE_URL',
  );
  const hasKey = envPresent('SUPABASE_SERVICE_ROLE_KEY', 'ClassSport_SUPABASE_SERVICE_ROLE_KEY');
  if (!hasUrl || !hasKey) return 'not_configured';

  try {
    const supabase = getSupabaseAdmin();
    // PostgREST root: returns OpenAPI JSON when credentials work, even with no tables.
    const { error } = await supabase.from('_migrations').select('filename').limit(1);
    // PGRST205 = table does not exist (acceptable — DB is reachable)
    if (!error || error.code === 'PGRST205' || /does not exist/i.test(error.message)) {
      return 'connected';
    }
    return 'unreachable';
  } catch {
    return 'unreachable';
  }
}

export async function GET(_req: NextRequest) {
  try {
    const mode = await getSystemMode();
    const supabase = await pingSupabase();

    let appliedMigrations: string[] = [];
    let pendingMigrations: string[] = [];
    try {
      appliedMigrations = await getAppliedMigrations();
      pendingMigrations = await getPendingMigrations();
    } catch (err) {
      console.warn('[diagnose] Could not fetch migrations:', err);
    }

    let users = 0,
      blocks = 0,
      slots = 0,
      rooms = 0;

    if (mode === 'live') {
      try {
        users = (await listUsers()).length;
        blocks = (await getBlocks()).length;
        slots = (await getSlots()).length;
        rooms = (await getRooms()).length;
      } catch (err) {
        console.warn('[diagnose] Could not fetch counts:', err);
      }
    }

    return NextResponse.json({
      mode,
      supabase,
      jwt: envPresent('JWT_SECRET', 'ClassSport_SUPABASE_JWT_SECRET') ? 'configured' : 'not_configured',
      database_url: envPresent(
        'DATABASE_URL',
        'ClassSport_POSTGRES_URL_NON_POOLING',
        'ClassSport_POSTGRES_URL',
      )
        ? 'configured'
        : 'not_configured',
      migrations: {
        applied: appliedMigrations.length,
        pending: pendingMigrations.length,
        appliedList: appliedMigrations,
        pendingList: pendingMigrations,
      },
      tables: { users, blocks, slots, rooms },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Diagnostic failed';
    console.error('[diagnose] Error:', message, err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
