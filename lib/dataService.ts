/**
 * ClassSport — DataService
 * ÚNICO punto de acceso a datos desde la aplicación.
 * Encapsula Supabase (live), seed.json (seed), y Vercel Blob (auditoría).
 * NUNCA se importa supabase.ts, blobAudit.ts directamente fuera de este módulo.
 */

import * as bcrypt from 'bcryptjs';
import { getSupabaseAdmin } from './supabase';
import * as blobAudit from './blobAudit';
import * as seedReader from './seedReader';
import * as pgMigrate from './pgMigrate';
import { User, SafeUser, LoginRequest, CreateUserRequest, UpdateUserRequest, ChangePasswordRequest, JWTPayload } from './types';

// ============================================================================
// SYSTEM MODE — Determines whether to read from seed or Postgres
// ============================================================================

let systemMode: 'seed' | 'live' | null = null;

export async function getSystemMode(): Promise<'seed' | 'live'> {
  if (systemMode) {
    return systemMode;
  }

  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from('_migrations')
      .select('count')
      .limit(1);

    // If we can query, we're in live mode
    systemMode = 'live';
  } catch (err) {
    // If table doesn't exist or connection fails, we're in seed mode
    systemMode = 'seed';
  }

  return systemMode;
}

/**
 * Clear system mode cache (used in tests and after bootstrap).
 */
export function clearSystemModeCache() {
  systemMode = null;
}

// ============================================================================
// USER OPERATIONS
// ============================================================================

export async function getUserByEmail(email: string): Promise<User | null> {
  const mode = await getSystemMode();

  if (mode === 'seed') {
    return seedReader.getUserByEmail(email);
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      // No rows returned
      return null;
    }
    throw error;
  }

  return data;
}

export async function getUserById(id: string): Promise<User | null> {
  const mode = await getSystemMode();

  if (mode === 'seed') {
    const users = await seedReader.getUsers();
    return users.find((u) => u.id === id) || null;
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    throw error;
  }

  return data;
}

export function toSafeUser(user: User): SafeUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    is_active: user.is_active,
    must_change_password: user.must_change_password,
    last_login_at: user.last_login_at,
  };
}

/**
 * Create a new user (admin only).
 * Generates a random temporary password.
 */
export async function createUser(data: CreateUserRequest & { temporaryPassword: string }): Promise<SafeUser & { temporaryPassword: string }> {
  const mode = await getSystemMode();

  if (mode === 'seed') {
    throw new Error('Cannot create users in seed mode. Bootstrap first.');
  }

  const passwordHash = await bcrypt.hash(data.temporaryPassword, 10);

  const supabase = getSupabaseAdmin();
  const { data: user, error } = await supabase
    .from('users')
    .insert([
      {
        name: data.name,
        email: data.email,
        password_hash: passwordHash,
        role: data.role,
        is_active: true,
        must_change_password: true,
      },
    ])
    .select()
    .single();

  if (error) {
    throw error;
  }

  return {
    ...toSafeUser(user),
    temporaryPassword: data.temporaryPassword,
  };
}

/**
 * Update user data (admin only).
 */
export async function updateUser(id: string, data: UpdateUserRequest): Promise<SafeUser> {
  const mode = await getSystemMode();

  if (mode === 'seed') {
    throw new Error('Cannot update users in seed mode.');
  }

  const supabase = getSupabaseAdmin();
  const { data: user, error } = await supabase
    .from('users')
    .update(data)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return toSafeUser(user);
}

/**
 * List all users (admin only).
 */
export async function listUsers(): Promise<SafeUser[]> {
  const mode = await getSystemMode();

  if (mode === 'seed') {
    const users = await seedReader.getUsers();
    return users.map(toSafeUser);
  }

  const supabase = getSupabaseAdmin();
  const { data: users, error } = await supabase.from('users').select('*').order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return users.map(toSafeUser);
}

// ============================================================================
// AUDIT OPERATIONS
// ============================================================================

export async function recordAudit(entry: Omit<blobAudit.AuditEntry, 'id' | 'timestamp'>): Promise<void> {
  const auditEntry: blobAudit.AuditEntry = {
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    ...entry,
  };

  await blobAudit.appendAudit(auditEntry);
}

export async function readAuditMonth(yyyymm: string): Promise<blobAudit.AuditEntry[]> {
  return blobAudit.readAuditMonth(yyyymm);
}

// ============================================================================
// BLOCKS, SLOTS, ROOMS — Placeholder for Fase 3
// ============================================================================

export async function getBlocks() {
  const mode = await getSystemMode();
  if (mode === 'seed') {
    return seedReader.getBlocks();
  }
  const supabase = getSupabaseAdmin();
  const { data } = await supabase.from('blocks').select('*').eq('is_active', true);
  return data || [];
}

export async function getSlots() {
  const mode = await getSystemMode();
  if (mode === 'seed') {
    return seedReader.getSlots();
  }
  const supabase = getSupabaseAdmin();
  const { data } = await supabase.from('slots').select('*').eq('is_active', true).order('order_index');
  return data || [];
}

export async function getRooms(filters?: { blockId?: string; isActive?: boolean }) {
  const mode = await getSystemMode();
  if (mode === 'seed') {
    let rooms = await seedReader.getRooms();
    if (filters?.blockId) {
      rooms = rooms.filter((r) => r.block_id === filters.blockId);
    }
    if (filters?.isActive !== undefined) {
      rooms = rooms.filter((r) => r.is_active === filters.isActive);
    }
    return rooms;
  }

  const supabase = getSupabaseAdmin();
  let query = supabase.from('rooms').select('*');

  if (filters?.blockId) {
    query = query.eq('block_id', filters.blockId);
  }

  if (filters?.isActive !== undefined) {
    query = query.eq('is_active', filters.isActive);
  }

  const { data } = await query;
  return data || [];
}

export async function getRoomById(id: string) {
  const mode = await getSystemMode();
  if (mode === 'seed') {
    const rooms = await seedReader.getRooms();
    return rooms.find((r) => r.id === id) || null;
  }

  const supabase = getSupabaseAdmin();
  const { data } = await supabase.from('rooms').select('*').eq('id', id).single();
  return data || null;
}
