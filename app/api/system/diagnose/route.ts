import { NextRequest, NextResponse } from 'next/server';
import { getSystemMode, clearSystemModeCache, listUsers, getBlocks, getSlots, getRooms } from '@/lib/dataService';
import { getAppliedMigrations, getPendingMigrations } from '@/lib/pgMigrate';

export async function GET(req: NextRequest) {
  try {
    const mode = await getSystemMode();

    // Gather diagnostic information
    let appliedMigrations: any[] = [];
    let pendingMigrations: string[] = [];

    if (mode === 'live') {
      try {
        appliedMigrations = await getAppliedMigrations();
        pendingMigrations = await getPendingMigrations();
      } catch (err) {
        console.warn('[diagnose] Could not fetch migrations:', err);
      }
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
      supabase: mode === 'live' ? 'connected' : 'not_configured',
      blob: process.env.BLOB_READ_WRITE_TOKEN ? 'configured' : 'not_configured',
      jwt: process.env.JWT_SECRET ? 'configured' : 'not_configured',
      database_url: process.env.DATABASE_URL ? 'configured' : 'not_configured',
      migrations: {
        applied: appliedMigrations.length,
        pending: pendingMigrations.length,
        appliedList: appliedMigrations,
        pendingList: pendingMigrations,
      },
      tables: {
        users,
        blocks,
        slots,
        rooms,
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Diagnostic failed';
    console.error('[diagnose] Error:', message, err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
