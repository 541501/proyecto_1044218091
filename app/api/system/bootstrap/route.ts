import { NextRequest, NextResponse } from 'next/server';
import { runMigrations } from '@/lib/pgMigrate';
import { getSupabaseAdmin } from '@/lib/supabase';
import { getSystemMode, clearSystemModeCache, recordAudit } from '@/lib/dataService';
import * as seedReader from '@/lib/seedReader';

// Use the Supabase secret key from the Vercel Marketplace integration as a
// fallback so the bootstrap endpoint stays protected without provisioning an
// extra env var. Set ADMIN_BOOTSTRAP_SECRET to override.
const BOOTSTRAP_SECRET =
  process.env.ADMIN_BOOTSTRAP_SECRET || process.env.ClassSport_SUPABASE_SECRET_KEY;

export async function POST(req: NextRequest) {
  try {
    // Verify bootstrap secret
    const { secret } = await req.json();
    if (secret !== BOOTSTRAP_SECRET) {
      return NextResponse.json({ error: 'Invalid bootstrap secret' }, { status: 403 });
    }

    // Run migrations
    const appliedMigrations = await runMigrations();

    // Clear mode cache to re-detect live mode
    clearSystemModeCache();

    // PostgREST schema cache may lag behind DDL — wait a moment so inserts succeed.
    await new Promise((r) => setTimeout(r, 1500));

    // Insert seed data into Postgres (idempotent: upsert on primary key)
    const supabase = getSupabaseAdmin();
    const insertResults: Record<string, { inserted: number; error?: string }> = {};

    async function upsert(table: string, rows: any[]) {
      if (rows.length === 0) {
        insertResults[table] = { inserted: 0 };
        return;
      }
      const { error, data } = await supabase.from(table).upsert(rows, { onConflict: 'id' }).select();
      insertResults[table] = { inserted: data?.length ?? 0, error: error?.message };
      if (error) console.error(`[bootstrap] upsert ${table} failed:`, error);
    }

    const seedBlocks = await seedReader.getBlocks();
    await upsert(
      'blocks',
      seedBlocks.map((b) => ({
        id: b.id,
        name: b.name,
        code: b.code,
        is_active: b.is_active,
        created_at: b.created_at,
      })),
    );

    const seedSlots = await seedReader.getSlots();
    await upsert(
      'slots',
      seedSlots.map((s) => ({
        id: s.id,
        name: s.name,
        start_time: s.start_time,
        end_time: s.end_time,
        order_index: s.order_index,
        is_active: s.is_active,
      })),
    );

    const seedRooms = await seedReader.getRooms();
    await upsert(
      'rooms',
      seedRooms.map((r) => ({
        id: r.id,
        block_id: r.block_id,
        code: r.code,
        type: r.type,
        capacity: r.capacity,
        equipment: r.equipment,
        is_active: r.is_active,
        created_at: r.created_at,
        updated_at: r.updated_at,
      })),
    );

    const seedUsers = await seedReader.getUsers();
    const adminUser = seedUsers.find((u) => u.role === 'admin');
    if (adminUser) {
      await upsert('users', [
        {
          id: adminUser.id,
          name: adminUser.name,
          email: adminUser.email,
          password_hash: adminUser.password_hash,
          role: adminUser.role,
          is_active: adminUser.is_active,
          must_change_password: adminUser.must_change_password,
          created_at: adminUser.created_at,
        },
      ]);
    }

    // Record bootstrap in audit
    const auditUser = adminUser || {
      id: '00000000-0000-0000-0000-000000000001',
      email: 'admin@classsport.edu.co',
      role: 'admin' as const,
    };
    await recordAudit({
      user_id: auditUser.id,
      user_email: auditUser.email,
      user_role: auditUser.role,
      action: 'bootstrap',
      entity: 'system',
      summary: 'Sistema bootstrapped: migrations aplicadas, bloques/salones/franjas insertados',
    });

    return NextResponse.json({
      success: true,
      appliedMigrations,
      seed: insertResults,
      message: 'Bootstrap completed. System is now in live mode.',
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Bootstrap failed';
    console.error('[bootstrap]', err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
