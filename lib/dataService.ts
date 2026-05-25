/**
 * ClassSport — DataService
 * ÚNICO punto de acceso a datos desde la aplicación.
 * Encapsula Supabase (live), seed.json (seed) y la auditoría (tabla audit_log).
 * NUNCA se importa supabase.ts ni auditService.ts directamente fuera de este módulo.
 */

import * as bcrypt from 'bcryptjs';
import { getSupabaseAdmin } from './supabase';
import * as auditService from './auditService';
import * as seedReader from './seedReader';
import * as pgMigrate from './pgMigrate';
import { 
  User, 
  SafeUser, 
  LoginRequest, 
  CreateUserRequest, 
  UpdateUserRequest, 
  ChangePasswordRequest, 
  JWTPayload,
  Block,
  Slot,
  Room,
  Reservation,
  ReservationWithDetails,
  RoomFilters,
  ReservationFilters,
  CreateRoomRequest,
  UpdateRoomRequest,
  CreateReservationRequest
} from './types';

// ============================================================================
// SYSTEM MODE — Determines whether to read from seed or Postgres
// ============================================================================

let systemMode: 'seed' | 'live' | null = null;

export async function getSystemMode(): Promise<'seed' | 'live'> {
  if (systemMode) {
    return systemMode;
  }

  // 1) Live first: if `_migrations` exists in Postgres, the bootstrap ran → live.
  try {
    const supabase = getSupabaseAdmin();
    const { error } = await supabase
      .from('_migrations')
      .select('filename')
      .limit(1);

    if (!error) {
      systemMode = 'live';
      return 'live';
    }
  } catch (err) {
    // fall through to seed fallback
  }

  // 2) Fallback: seed.json drives initial admin login until bootstrap runs.
  systemMode = 'seed';
  return 'seed';
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
export async function updateUser(id: string, data: UpdateUserRequest & { password_hash?: string }): Promise<SafeUser> {
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

export async function recordAudit(entry: auditService.AuditEntryInput): Promise<void> {
  await auditService.appendAudit(entry);
}

export async function listAudit(filters: auditService.AuditFilters = {}) {
  return auditService.listAudit(filters);
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
  const { data, error } = await supabase.from('blocks').select('*').is('is_active', true);
  if (error) console.error('[getBlocks]', error);
  return data || [];
}

export async function getSlots() {
  const mode = await getSystemMode();
  if (mode === 'seed') {
    return seedReader.getSlots();
  }
  const supabase = getSupabaseAdmin();
  const { data } = await supabase.from('slots').select('*').is('is_active', true).order('order_index');
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
    query = query.is('is_active', filters.isActive);
  }

  const { data, error } = await query;
  if (error) console.error('[getRooms] error=', error);
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

/**
 * Crea un nuevo salón en el bloque especificado
 * Captura error UNIQUE(block_id, code) y retorna 409 apropiadamente
 */
export async function createRoom(userId: string, data: CreateRoomRequest): Promise<Room> {
  const mode = await getSystemMode();
  
  if (mode === 'seed') {
    throw new Error('No se pueden crear salones en modo seed');
  }

  const supabase = getSupabaseAdmin();
  
  try {
    const { data: room, error } = await supabase
      .from('rooms')
      .insert([{
        block_id: data.block_id,
        code: data.code,
        type: data.type,
        capacity: data.capacity,
        equipment: data.equipment || null,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) {
      // Check if it's a UNIQUE constraint violation on (block_id, code)
      if (error.code === '23505') {
        const err = new Error('Ya existe un salón con este código en el bloque') as any;
        err.code = 'DUPLICATE_ROOM_CODE';
        throw err;
      }
      throw error;
    }

    // Record audit
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

/**
 * Actualiza un salón existente
 */
export async function updateRoom(id: string, userId: string, data: UpdateRoomRequest): Promise<Room> {
  const mode = await getSystemMode();
  
  if (mode === 'seed') {
    throw new Error('No se pueden actualizar salones en modo seed');
  }

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

/**
 * Desactiva un salón — primero verifica si hay reservas futuras (RN-10)
 * Retorna { warningCount: N } si hay reservas futuras
 */
export async function deactivateRoom(id: string, userId: string): Promise<{ warningCount: number }> {
  const mode = await getSystemMode();
  
  if (mode === 'seed') {
    throw new Error('No se pueden desactivar salones en modo seed');
  }

  const supabase = getSupabaseAdmin();
  const today = new Date().toISOString().split('T')[0];

  // Contar reservas futuras confirmadas
  const { data: futureReservations, error } = await supabase
    .from('reservations')
    .select('id', { count: 'exact' })
    .eq('room_id', id)
    .eq('status', 'confirmada')
    .gte('reservation_date', today);

  if (error) {
    throw error;
  }

  const warningCount = futureReservations?.length || 0;
  
  return { warningCount };
}

/**
 * Confirma la desactivación de un salón (después de que admin confirma advertencia)
 */
export async function confirmDeactivateRoom(id: string, userId: string): Promise<Room> {
  const mode = await getSystemMode();
  
  if (mode === 'seed') {
    throw new Error('No se pueden desactivar salones en modo seed');
  }

  const supabase = getSupabaseAdmin();

  try {
    const { data: room, error } = await supabase
      .from('rooms')
      .update({ 
        is_active: false,
        updated_at: new Date().toISOString()
      })
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
// RESERVATIONS — Placeholder for Fase 4
// ============================================================================

export async function getReservations(filters?: ReservationFilters): Promise<ReservationWithDetails[]> {
  const mode = await getSystemMode();

  if (mode === 'seed') {
    // In seed mode, return empty array for now
    return [];
  }

  const supabase = getSupabaseAdmin();
  let query = supabase
    .from('reservations')
    .select(`
      *,
      room:rooms(*),
      slot:slots(*),
      professor:users!professor_id(*)
    `);

  if (filters?.roomId) {
    query = query.eq('room_id', filters.roomId);
  }

  if (filters?.blockId) {
    // Join through rooms to filter by block
    const { data: roomsInBlock } = await supabase
      .from('rooms')
      .select('id')
      .eq('block_id', filters.blockId);
    
    const roomIds = roomsInBlock?.map(r => r.id) || [];
    if (roomIds.length > 0) {
      query = query.in('room_id', roomIds);
    }
  }

  if (filters?.date) {
    query = query.eq('reservation_date', filters.date);
  }

  if (filters?.from && filters?.to) {
    query = query
      .gte('reservation_date', filters.from)
      .lte('reservation_date', filters.to);
  }

  if (filters?.professorId) {
    query = query.eq('professor_id', filters.professorId);
  }

  if (filters?.status) {
    query = query.eq('status', filters.status);
  }

  const { data, error } = await query;

  if (error) {
    console.error('[getReservations] Error:', error);
    return [];
  }

  return (data || []).map((res: any) => ({
    ...res,
    professorName: res.professor?.name || 'Profesor Desconocido',
    block: res.room?.block_id
  }));
}

export async function getMyReservations(userId: string, filters?: ReservationFilters): Promise<ReservationWithDetails[]> {
  return getReservations({
    ...filters,
    professorId: userId
  });
}

export async function createReservation(userId: string, data: CreateReservationRequest): Promise<Reservation> {
  const mode = await getSystemMode();
  
  if (mode === 'seed') {
    throw new Error('No se pueden crear reservas en modo seed');
  }

  // Import reservationService functions
  const { validateReservationRules, checkConflict } = await import('./reservationService');

  // (1) Validate business rules: RN-02 (weekday), RN-03 (max 60 days ahead)
  const validationErrors = validateReservationRules(data.reservation_date);
  if (validationErrors.length > 0) {
    const err = new Error(validationErrors[0]) as any;
    err.code = 'VALIDATION_ERROR';
    err.details = validationErrors;
    throw err;
  }

  // (2) Check for existing conflict
  const conflict = await checkConflict(data.room_id, data.slot_id, data.reservation_date);
  if (conflict) {
    const err = new Error('Conflicto de reserva') as any;
    err.code = 'CONFLICT';
    err.conflict = conflict;
    throw err;
  }

  const supabase = getSupabaseAdmin();
  
  try {
    // (3) INSERT into reservations
    const { data: reservation, error } = await supabase
      .from('reservations')
      .insert([{
        room_id: data.room_id,
        slot_id: data.slot_id,
        professor_id: userId,
        reservation_date: data.reservation_date,
        subject: data.subject,
        group_name: data.group_name,
        status: 'confirmada',
        created_by: userId,
        created_at: new Date().toISOString()
      }])
      .select()
      .single();

    // (4) Handle race condition: if Postgres rejects due to UNIQUE partial
    if (error) {
      if (error.code === '23505') {
        // UNIQUE violation on the partial index
        const raceErr = new Error('Conflicto de reserva') as any;
        raceErr.code = 'RACE_CONDITION';
        throw raceErr;
      }
      throw error;
    }

    // (5) Record audit
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
    
    // Re-throw validation and conflict errors with special codes
    if (err.code === 'VALIDATION_ERROR' || err.code === 'CONFLICT' || err.code === 'RACE_CONDITION') {
      throw err;
    }
    
    throw err;
  }
}

export async function cancelReservation(
  id: string,
  userId: string,
  role: string,
  reason?: string
): Promise<Reservation> {
  const mode = await getSystemMode();
  
  if (mode === 'seed') {
    throw new Error('No se pueden cancelar reservas en modo seed');
  }

  const supabase = getSupabaseAdmin();

  try {
    // Fetch the reservation first to validate permissions and date
    const { data: reservation, error: fetchError } = await supabase
      .from('reservations')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !reservation) {
      throw new Error('Reserva no encontrada');
    }

    // RN-05: Verify ownership for 'profesor' role
    if (role === 'profesor' && reservation.professor_id !== userId) {
      const err = new Error('No tienes permisos para cancelar esta reserva') as any;
      err.code = 'FORBIDDEN';
      throw err;
    }

    // RN-04: For 'profesor', cannot cancel reservations today or in the past
    if (role === 'profesor') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const reservationDate = new Date(reservation.reservation_date);
      reservationDate.setHours(0, 0, 0, 0);

      if (reservationDate <= today) {
        const err = new Error('No se pueden cancelar reservas del día actual o del pasado') as any;
        err.code = 'INVALID_CANCELLATION_DATE';
        throw err;
      }
    }

    // For coordinador and admin: reason is required
    if ((role === 'coordinador' || role === 'admin') && !reason) {
      const err = new Error('El motivo de cancelación es obligatorio para coordinadores y administradores') as any;
      err.code = 'MISSING_REASON';
      throw err;
    }

    // Perform the cancellation
    const { data: canceledReservation, error } = await supabase
      .from('reservations')
      .update({
        status: 'cancelada',
        cancellation_reason: reason || null,
        cancelled_by: userId,
        cancelled_at: new Date().toISOString()
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

    return canceledReservation;
  } catch (err: any) {
    console.error('[cancelReservation] Error:', err);
    
    // Re-throw with preserved error codes
    if (err.code === 'FORBIDDEN' || err.code === 'INVALID_CANCELLATION_DATE' || err.code === 'MISSING_REASON') {
      throw err;
    }
    
    throw err;
  }
}

/**
 * Obtiene un reporte de ocupación de salones para un rango de fechas
 * 
 * Retorna un array de OccupancyReportRow con información del profesor, materia,
 * grupo, salón, bloque, franja, etc. para todas las reservas confirmadas en el rango.
 * 
 * @param from Fecha inicio (YYYY-MM-DD) inclusive
 * @param to Fecha fin (YYYY-MM-DD) inclusive
 * @param blockId (Opcional) ID del bloque para filtrar. Si no se proporciona, devuelve todos
 * @returns Array de filas de reporte
 */
export async function getOccupancyReport(from: string, to: string, blockId?: string): Promise<any[]> {
  const mode = await getSystemMode();

  if (mode === 'seed') {
    return [];
  }

  const supabase = getSupabaseAdmin();

  try {
    // Query: SELECT de reservations con JOINs a rooms, blocks, slots, users
    let query = supabase
      .from('reservations')
      .select(`
        id,
        reservation_date,
        subject,
        group_name,
        status,
        room:rooms(
          id,
          code,
          block_id,
          block:blocks(
            id,
            name
          )
        ),
        slot:slots(
          id,
          name
        ),
        professor:users!professor_id(
          id,
          name
        )
      `)
      .eq('status', 'confirmada')
      .gte('reservation_date', from)
      .lte('reservation_date', to);

    // Filter by block if provided
    if (blockId) {
      // Get room IDs in the specified block
      const { data: roomsInBlock } = await supabase
        .from('rooms')
        .select('id')
        .eq('block_id', blockId);

      const roomIds = roomsInBlock?.map(r => r.id) || [];
      if (roomIds.length > 0) {
        query = query.in('room_id', roomIds);
      } else {
        // No rooms in block, return empty
        return [];
      }
    }

    const { data, error } = await query.order('reservation_date', { ascending: true });

    if (error) {
      console.error('[getOccupancyReport] Error:', error);
      return [];
    }

    // Transform the data to OccupancyReportRow format
    return (data || []).map((row: any) => ({
      fecha: row.reservation_date,
      bloque: row.room?.block?.name || 'Desconocido',
      salon: row.room?.code || 'Desconocido',
      codigo: row.room?.code || 'Desconocido',
      franja: row.slot?.name || 'Desconocido',
      profesor: row.professor?.name || 'Profesor Desconocido',
      materia: row.subject || 'N/A',
      grupo: row.group_name || 'N/A',
      estado: 'confirmada'
    }));
  } catch (err: any) {
    console.error('[getOccupancyReport] Error:', err);
    return [];
  }
}
