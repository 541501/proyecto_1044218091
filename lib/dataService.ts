/**
 * ClassSport — DataService
 * ÚNICO punto de acceso a datos desde la aplicación.
 * Encapsula Supabase y la auditoría (audit_log).
 * NUNCA se importa supabase.ts ni auditService.ts directamente fuera de este módulo.
 */

import * as bcrypt from 'bcryptjs';
import { getSupabaseAdmin } from './supabase';
import * as auditService from './auditService';
import {
  User,
  SafeUser,
  CreateUserRequest,
  UpdateUserRequest,
  Block,
  Slot,
  Room,
  Reservation,
  ReservationWithDetails,
  ReservationFilters,
  CreateRoomRequest,
  UpdateRoomRequest,
  CreateReservationRequest,
} from './types';

// ============================================================================
// SYSTEM MODE — Compatibilidad. El sistema siempre está en modo "live".
// ============================================================================

export async function getSystemMode(): Promise<'live'> {
  return 'live';
}

// Retro-compatibilidad para llamadas antiguas (no-op).
export function clearSystemModeCache(): void {
  /* noop — el sistema siempre opera en modo live */
}

// ============================================================================
// USER OPERATIONS
// ============================================================================

export async function getUserByEmail(email: string): Promise<User | null> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }
  return data;
}

export async function getUserById(id: string): Promise<User | null> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
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

export async function createUser(
  data: CreateUserRequest & { temporaryPassword: string },
): Promise<SafeUser & { temporaryPassword: string }> {
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

  if (error) throw error;

  return { ...toSafeUser(user), temporaryPassword: data.temporaryPassword };
}

export async function updateUser(
  id: string,
  data: UpdateUserRequest & { password_hash?: string },
): Promise<SafeUser> {
  const supabase = getSupabaseAdmin();
  const { data: user, error } = await supabase
    .from('users')
    .update(data)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return toSafeUser(user);
}

export async function deleteUser(id: string): Promise<void> {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase
    .from('users')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

export async function listUsers(): Promise<SafeUser[]> {
  const supabase = getSupabaseAdmin();
  const { data: users, error } = await supabase
    .from('users')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (users ?? []).map(toSafeUser);
}

// ============================================================================
// AUDIT OPERATIONS
// ============================================================================

export async function recordAudit(entry: auditService.AuditEntryInput): Promise<void> {
  await auditService.appendAudit(entry);
}

export async function listAudit(filters: auditService.AuditFilters = {}) {
  return auditService.listAudit(filters);
}

// ============================================================================
// BLOCKS, SLOTS, ROOMS
// ============================================================================

export async function getBlocks(): Promise<Block[]> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('blocks')
    .select('*')
    .is('is_active', true);
  if (error) console.error('[getBlocks]', error);
  return (data ?? []) as Block[];
}

export async function getSlots(): Promise<Slot[]> {
  const supabase = getSupabaseAdmin();
  const { data } = await supabase
    .from('slots')
    .select('*')
    .is('is_active', true)
    .order('order_index');
  return (data ?? []) as Slot[];
}

export async function getRooms(filters?: {
  blockId?: string;
  isActive?: boolean;
}): Promise<Room[]> {
  const supabase = getSupabaseAdmin();
  let query = supabase.from('rooms').select('*');
  if (filters?.blockId) query = query.eq('block_id', filters.blockId);
  if (filters?.isActive !== undefined) query = query.is('is_active', filters.isActive);
  const { data, error } = await query;
  if (error) console.error('[getRooms]', error);
  return (data ?? []) as Room[];
}

export async function getRoomById(id: string): Promise<Room | null> {
  const supabase = getSupabaseAdmin();
  const { data } = await supabase.from('rooms').select('*').eq('id', id).single();
  return (data as Room) ?? null;
}

export async function createRoom(userId: string, data: CreateRoomRequest): Promise<Room> {
  const supabase = getSupabaseAdmin();
  try {
    const { data: room, error } = await supabase
      .from('rooms')
      .insert([
        {
          block_id: data.block_id,
          code: data.code,
          type: data.type,
          capacity: data.capacity,
          equipment: data.equipment || null,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        const err = new Error('Ya existe un salón con este código en el bloque') as any;
        err.code = 'DUPLICATE_ROOM_CODE';
        throw err;
      }
      throw error;
    }

    await recordAudit({
      user_id: userId,
      user_email: 'unknown',
      user_role: 'admin',
      operation: 'INSERT',
      entity: 'room',
      entity_id: room.id,
      summary: `Salón creado: ${data.code} en bloque ${data.block_id}`,
    });

    return room;
  } catch (err) {
    console.error('[createRoom] Error:', err);
    throw err;
  }
}

export async function updateRoom(
  id: string,
  userId: string,
  data: UpdateRoomRequest,
): Promise<Room> {
  const supabase = getSupabaseAdmin();
  const updateData: any = { updated_at: new Date().toISOString() };
  if (data.code !== undefined) updateData.code = data.code;
  if (data.type !== undefined) updateData.type = data.type;
  if (data.capacity !== undefined) updateData.capacity = data.capacity;
  if (data.equipment !== undefined) updateData.equipment = data.equipment;
  if (data.is_active !== undefined) updateData.is_active = data.is_active;

  try {
    const { data: room, error } = await supabase
      .from('rooms')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        throw new Error('Ya existe un salón con este código en el bloque');
      }
      throw error;
    }

    await recordAudit({
      user_id: userId,
      user_email: 'unknown',
      user_role: 'admin',
      operation: 'UPDATE',
      entity: 'room',
      entity_id: id,
      summary: `Salón actualizado: ${room.code}`,
    });

    return room;
  } catch (err) {
    console.error('[updateRoom] Error:', err);
    throw err;
  }
}

export async function deactivateRoom(
  id: string,
  _userId: string,
): Promise<{ warningCount: number }> {
  const supabase = getSupabaseAdmin();
  const today = new Date().toISOString().split('T')[0];

  const { data: futureReservations, error } = await supabase
    .from('reservations')
    .select('id', { count: 'exact' })
    .eq('room_id', id)
    .eq('status', 'confirmada')
    .gte('reservation_date', today);

  if (error) throw error;
  return { warningCount: futureReservations?.length ?? 0 };
}

export async function confirmDeactivateRoom(id: string, userId: string): Promise<Room> {
  const supabase = getSupabaseAdmin();
  try {
    const { data: room, error } = await supabase
      .from('rooms')
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;

    await recordAudit({
      user_id: userId,
      user_email: 'unknown',
      user_role: 'admin',
      operation: 'UPDATE',
      entity: 'room',
      entity_id: id,
      summary: `Salón desactivado: ${room.code}`,
    });

    return room;
  } catch (err) {
    console.error('[confirmDeactivateRoom] Error:', err);
    throw err;
  }
}

// ============================================================================
// RESERVATIONS
// ============================================================================

export async function getReservations(
  filters?: ReservationFilters,
): Promise<ReservationWithDetails[]> {
  const supabase = getSupabaseAdmin();
  let query = supabase.from('reservations').select(`
    *,
    room:rooms(*),
    slot:slots(*),
    professor:users!professor_id(*)
  `);

  if (filters?.roomId) query = query.eq('room_id', filters.roomId);
  if (filters?.blockId) {
    const { data: roomsInBlock } = await supabase
      .from('rooms')
      .select('id')
      .eq('block_id', filters.blockId);
    const roomIds = roomsInBlock?.map((r) => r.id) ?? [];
    if (roomIds.length > 0) query = query.in('room_id', roomIds);
  }
  if (filters?.date) query = query.eq('reservation_date', filters.date);
  if (filters?.from && filters?.to) {
    query = query.gte('reservation_date', filters.from).lte('reservation_date', filters.to);
  }
  if (filters?.professorId) query = query.eq('professor_id', filters.professorId);
  if (filters?.status) query = query.eq('status', filters.status);

  const { data, error } = await query;
  if (error) {
    console.error('[getReservations] Error:', error);
    return [];
  }
  return (data ?? []).map((res: any) => ({
    ...res,
    professorName: res.professor?.name || 'Profesor Desconocido',
    block: res.room?.block_id,
  }));
}

export async function getMyReservations(
  userId: string,
  filters?: ReservationFilters,
): Promise<ReservationWithDetails[]> {
  return getReservations({ ...filters, professorId: userId });
}

export async function createReservation(
  userId: string,
  data: CreateReservationRequest,
): Promise<Reservation> {
  const { validateReservationRules, checkConflict } = await import('./reservationService');

  const validationErrors = validateReservationRules(data.reservation_date);
  if (validationErrors.length > 0) {
    const err = new Error(validationErrors[0]) as any;
    err.code = 'VALIDATION_ERROR';
    err.details = validationErrors;
    throw err;
  }

  const conflict = await checkConflict(data.room_id, data.slot_id, data.reservation_date);
  if (conflict) {
    const err = new Error('Conflicto de reserva') as any;
    err.code = 'CONFLICT';
    err.conflict = conflict;
    throw err;
  }

  const supabase = getSupabaseAdmin();
  try {
    const { data: reservation, error } = await supabase
      .from('reservations')
      .insert([
        {
          room_id: data.room_id,
          slot_id: data.slot_id,
          professor_id: userId,
          reservation_date: data.reservation_date,
          subject: data.subject,
          group_name: data.group_name,
          professor_name: data.professor_name || null,
          status: 'confirmada',
          created_by: userId,
          created_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        const raceErr = new Error('Conflicto de reserva') as any;
        raceErr.code = 'RACE_CONDITION';
        throw raceErr;
      }
      throw error;
    }

    await recordAudit({
      user_id: userId,
      user_email: 'unknown',
      user_role: 'profesor',
      operation: 'INSERT',
      entity: 'reservation',
      entity_id: reservation.id,
      summary: `Reserva creada: ${data.subject} en salón ${data.room_id} el ${data.reservation_date} (${data.group_name})`,
    });

    return reservation;
  } catch (err: any) {
    console.error('[createReservation] Error:', err);
    throw err;
  }
}

export async function cancelReservation(
  id: string,
  userId: string,
  role: string,
  reason?: string,
): Promise<Reservation> {
  const supabase = getSupabaseAdmin();
  try {
    const { data: reservation, error: fetchError } = await supabase
      .from('reservations')
      .select('*')
      .eq('id', id)
      .single();
    if (fetchError || !reservation) throw new Error('Reserva no encontrada');

    if (role === 'profesor' && reservation.professor_id !== userId) {
      const err = new Error('No tienes permisos para cancelar esta reserva') as any;
      err.code = 'FORBIDDEN';
      throw err;
    }

    if (role === 'profesor') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const rd = new Date(reservation.reservation_date);
      rd.setHours(0, 0, 0, 0);
      if (rd <= today) {
        const err = new Error('No se pueden cancelar reservas del día actual o del pasado') as any;
        err.code = 'INVALID_CANCELLATION_DATE';
        throw err;
      }
    }

    if ((role === 'coordinador' || role === 'admin') && !reason) {
      const err = new Error(
        'El motivo de cancelación es obligatorio para coordinadores y administradores',
      ) as any;
      err.code = 'MISSING_REASON';
      throw err;
    }

    const { data: canceled, error } = await supabase
      .from('reservations')
      .update({
        status: 'cancelada',
        cancellation_reason: reason || null,
        cancelled_by: userId,
        cancelled_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;

    await recordAudit({
      user_id: userId,
      user_email: 'unknown',
      user_role: role as any,
      operation: 'UPDATE',
      entity: 'reservation',
      entity_id: id,
      summary: `Reserva cancelada: ${reservation.subject} en ${reservation.reservation_date} | Motivo: ${reason || 'N/A'}`,
    });

    return canceled;
  } catch (err: any) {
    console.error('[cancelReservation] Error:', err);
    throw err;
  }
}

// ============================================================================
// REPORTS
// ============================================================================

export async function getOccupancyReport(
  from: string,
  to: string,
  blockId?: string,
): Promise<any[]> {
  const supabase = getSupabaseAdmin();
  try {
    let query = supabase
      .from('reservations')
      .select(
        `
        id,
        reservation_date,
        subject,
        group_name,
        status,
        room:rooms(id, code, block_id, block:blocks(id, name)),
        slot:slots(id, name),
        professor:users!professor_id(id, name)
      `,
      )
      .eq('status', 'confirmada')
      .gte('reservation_date', from)
      .lte('reservation_date', to);

    if (blockId) {
      const { data: roomsInBlock } = await supabase
        .from('rooms')
        .select('id')
        .eq('block_id', blockId);
      const roomIds = roomsInBlock?.map((r) => r.id) ?? [];
      if (roomIds.length > 0) query = query.in('room_id', roomIds);
      else return [];
    }

    const { data, error } = await query.order('reservation_date', { ascending: true });
    if (error) {
      console.error('[getOccupancyReport] Error:', error);
      return [];
    }

    return (data ?? []).map((row: any) => ({
      fecha: row.reservation_date,
      bloque: row.room?.block?.name || 'Desconocido',
      salon: row.room?.code || 'Desconocido',
      codigo: row.room?.code || 'Desconocido',
      franja: row.slot?.name || 'Desconocido',
      profesor: row.professor?.name || 'Profesor Desconocido',
      materia: row.subject || 'N/A',
      grupo: row.group_name || 'N/A',
      estado: 'confirmada',
    }));
  } catch (err: any) {
    console.error('[getOccupancyReport] Error:', err);
    return [];
  }
}
