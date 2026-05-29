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
  UserRole,
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
  const normalizedEmail = email.toLowerCase();
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', normalizedEmail)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      console.log('[getUserByEmail] No user found for email:', normalizedEmail);
      return null;
    }
    console.error('[getUserByEmail] Error fetching user:', normalizedEmail, error);
    throw error;
  }
  console.log('[getUserByEmail] User found:', normalizedEmail);
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
  const normalizedEmail = data.email.toLowerCase();

  // Check if there's an inactive user with this email to reactivate
  const { data: inactiveUser } = await supabase
    .from('users')
    .select('*')
    .eq('email', normalizedEmail)
    .eq('is_active', false)
    .maybeSingle(); // Use maybeSingle to avoid error if no result

  // If we found an inactive user, reactivate it
  if (inactiveUser) {
    const { data: user, error } = await supabase
      .from('users')
      .update({
        name: data.name,
        password_hash: passwordHash,
        role: data.role,
        is_active: true,
        must_change_password: true,
      })
      .eq('id', inactiveUser.id)
      .select()
      .single();

    if (error) throw error;
    return { ...toSafeUser(user), temporaryPassword: data.temporaryPassword };
  }

  // Try to create new user
  let createResult = await supabase
    .from('users')
    .insert([
      {
        name: data.name,
        email: normalizedEmail,
        password_hash: passwordHash,
        role: data.role,
        is_active: true,
        must_change_password: true,
      },
    ])
    .select()
    .single();

  // If unique constraint violation, try to update existing active user
  if (createResult.error && createResult.error.code === '23505') {
    const { data: existingUser } = await supabase
      .from('users')
      .select('*')
      .eq('email', normalizedEmail)
      .maybeSingle();

    if (existingUser) {
      const updateResult = await supabase
        .from('users')
        .update({
          name: data.name,
          password_hash: passwordHash,
          role: data.role,
          is_active: true,
          must_change_password: true,
        })
        .eq('id', existingUser.id)
        .select()
        .single();

      if (updateResult.error) throw updateResult.error;
      return { ...toSafeUser(updateResult.data), temporaryPassword: data.temporaryPassword };
    }
  }

  if (createResult.error) throw createResult.error;

  return { ...toSafeUser(createResult.data), temporaryPassword: data.temporaryPassword };
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
  // Soft delete: marcar como inactivo en lugar de eliminar
  const { error } = await supabase
    .from('users')
    .update({ is_active: false })
    .eq('id', id);

  if (error) throw error;
}

export async function listUsers(): Promise<SafeUser[]> {
  const supabase = getSupabaseAdmin();
  const { data: users, error } = await supabase
    .from('users')
    .select('*')
    .eq('is_active', true)
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
  
  try {
    console.log('[getReservations] Starting with filters:', filters);
    
    let query = supabase.from('reservations').select(`
      *,
      room:rooms(*),
      slot:slots(*),
      professor:users!professor_id(*)
    `);

    if (filters?.roomId) {
      console.log('[getReservations] Filtering by roomId:', filters.roomId);
      query = query.eq('room_id', filters.roomId);
    }
    if (filters?.blockId) {
      console.log('[getReservations] Filtering by blockId:', filters.blockId);
      const { data: roomsInBlock, error: blockError } = await supabase
        .from('rooms')
        .select('id')
        .eq('block_id', filters.blockId);
      if (blockError) {
        console.error('[getReservations] Block error:', blockError);
        return [];
      }
      const roomIds = roomsInBlock?.map((r) => r.id) ?? [];
      if (roomIds.length > 0) query = query.in('room_id', roomIds);
    }
    if (filters?.date) {
      console.log('[getReservations] Filtering by date:', filters.date);
      query = query.eq('reservation_date', filters.date);
    }
    if (filters?.from && filters?.to) {
      console.log('[getReservations] Filtering by date range:', filters.from, 'to', filters.to);
      query = query.gte('reservation_date', filters.from).lte('reservation_date', filters.to);
    }
    if (filters?.professorId) {
      console.log('[getReservations] Filtering by professorId:', filters.professorId);
      query = query.eq('professor_id', filters.professorId);
    }
    if (filters?.status) {
      console.log('[getReservations] Filtering by status:', filters.status);
      query = query.eq('status', filters.status);
    }

    console.log('[getReservations] Executing query...');
    const { data, error } = await query;
    
    if (error) {
      console.error('[getReservations] Supabase error:', error);
      throw error;
    }
    
    console.log('[getReservations] Got data, transforming...');
    const result = (data ?? []).map((res: any) => ({
      ...res,
      professorName: res.professor?.name || 'Profesor Desconocido',
      block: res.room?.block_id,
    }));
    
    console.log('[getReservations] Returning', result.length, 'results');
    return result;
  } catch (error) {
    console.error('[getReservations] Caught error:', error);
    throw error;
  }
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
  userRole: UserRole = 'profesor',
): Promise<Reservation> {
  const { validateReservationRules, checkConflict } = await import('./reservationService');

  console.log('[createReservation] Starting for user:', userId, 'role:', userRole, 'data:', data);

  const validationErrors = validateReservationRules(data.reservation_date);
  if (validationErrors.length > 0) {
    console.log('[createReservation] Validation errors:', validationErrors);
    const err = new Error(validationErrors[0]) as any;
    err.code = 'VALIDATION_ERROR';
    err.details = validationErrors;
    throw err;
  }

  console.log('[createReservation] Checking conflicts...');
  const conflict = await checkConflict(data.room_id, data.slot_id, data.reservation_date);
  if (conflict) {
    console.log('[createReservation] Conflict found:', conflict);
    const err = new Error('Conflicto de reserva') as any;
    err.code = 'CONFLICT';
    err.conflict = conflict;
    throw err;
  }

  console.log('[createReservation] Inserting reservation into database...');
  const supabase = getSupabaseAdmin();
  try {
    // Si se proporciona professor_id (profesor tagueado), usarlo como professor_id
    // Si no, usar userId (quien crea la reserva)
    const professorId = data.professor_id || userId;
    console.log('[createReservation] Using professor_id:', professorId, data.professor_id ? '(tagged professor)' : '(creator)');
    
    // Determinar el status según el rol
    // Profesor: crea solicitud (pendiente)
    // Admin/Coordinador: crea reserva confirmada (confirmada)
    const isCoordinadorOrAdmin = userRole === 'admin' || userRole === 'coordinador' || userRole.startsWith('escuela_');
    const status = userRole === 'profesor' ? 'pendiente' : 'confirmada';
    console.log('[createReservation] Using status:', status, 'for role:', userRole);
    
    const { data: reservation, error } = await supabase
      .from('reservations')
      .insert([
        {
          room_id: data.room_id,
          slot_id: data.slot_id,
          professor_id: professorId,
          reservation_date: data.reservation_date,
          subject: data.subject,
          group_name: data.group_name,
          reason: data.reason || null,
          // TODO: professor_name field should be added after migration 0005 is applied
          // professor_name: data.professor_name || null,
          status: status,
          created_by: userId,
          created_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('[createReservation] Database error:', error);
      if (error.code === '23505') {
        console.log('[createReservation] Race condition detected (unique constraint)');
        const raceErr = new Error('Conflicto de reserva') as any;
        raceErr.code = 'RACE_CONDITION';
        throw raceErr;
      }
      throw error;
    }

    console.log('[createReservation] Recording audit...');
    try {
      const auditSummary = status === 'pendiente' 
        ? `Solicitud de reserva creada: ${data.subject} en salón ${data.room_id} el ${data.reservation_date} (${data.group_name}) - Razón: ${data.reason || 'No especificada'}`
        : `Reserva confirmada creada: ${data.subject} en salón ${data.room_id} el ${data.reservation_date} (${data.group_name})`;
      
      await recordAudit({
        user_id: userId,
        user_email: 'unknown',
        user_role: userRole,
        operation: 'INSERT',
        entity: 'reservation',
        entity_id: reservation.id,
        summary: auditSummary,
      });
    } catch (auditErr) {
      console.error('[createReservation] Audit error (non-blocking):', auditErr);
      // Continue anyway - audit failure shouldn't block reservation creation
    }

    console.log('[createReservation] Successfully created reservation request:', reservation.id);
    return reservation;
  } catch (err: any) {
    console.error('[createReservation] Error:', err);
    throw err;
  }
}

/**
 * Create a recurring reservation with weekly instances
 * Creates the parent reservation and then weekly instances until the end date
 */
export async function createRecurringReservation(
  userId: string,
  data: CreateReservationRequest,
  userRole: UserRole = 'profesor',
): Promise<{ parent: Reservation; instances: Reservation[] }> {
  console.log('[createRecurringReservation] Starting for user:', userId, 'role:', userRole, 'data:', data);

  // First, create the parent reservation (will mark as is_recurring=true)
  const parentReservation = await createReservation(userId, data, userRole);
  console.log('[createRecurringReservation] Parent reservation created:', parentReservation.id);

  if (!data.is_recurring || !data.recurrence_duration_months) {
    return { parent: parentReservation, instances: [] };
  }

  // Calculate end date: start date + duration in months
  const [startYear, startMonth, startDay] = data.reservation_date.split('-').map(Number);
  const startDate = new Date(startYear, startMonth - 1, startDay);
  const endDate = new Date(startYear, startMonth - 1 + data.recurrence_duration_months, startDay);

  console.log('[createRecurringReservation] Creating instances from', startDate.toISOString(), 'to', endDate.toISOString());

  const supabase = getSupabaseAdmin();
  const instances: Reservation[] = [];
  const currentDate = new Date(startDate);

  // Move to next week for first instance
  currentDate.setDate(currentDate.getDate() + 7);

  // Create a new reservation for each week until end date
  while (currentDate < endDate) {
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const day = String(currentDate.getDate()).padStart(2, '0');
    const nextReservationDate = `${year}-${month}-${day}`;

    console.log('[createRecurringReservation] Creating instance for', nextReservationDate);

    try {
      // Check for conflicts on this specific date
      const { validateReservationRules, checkConflict } = await import('./reservationService');
      
      const validationErrors = validateReservationRules(nextReservationDate);
      if (validationErrors.length > 0) {
        console.warn('[createRecurringReservation] Skipping invalid date:', nextReservationDate);
        currentDate.setDate(currentDate.getDate() + 7);
        continue;
      }

      const conflict = await checkConflict(data.room_id, data.slot_id, nextReservationDate);
      if (conflict) {
        console.warn('[createRecurringReservation] Conflict on', nextReservationDate, '- skipping');
        currentDate.setDate(currentDate.getDate() + 7);
        continue;
      }

      const professorId = data.professor_id || userId;
      const status = userRole === 'profesor' ? 'pendiente' : 'confirmada';

      const { data: instance, error } = await supabase
        .from('reservations')
        .insert([
          {
            room_id: data.room_id,
            slot_id: data.slot_id,
            professor_id: professorId,
            reservation_date: nextReservationDate,
            subject: data.subject,
            group_name: data.group_name,
            reason: data.reason || null,
            status: status,
            created_by: userId,
            created_at: new Date().toISOString(),
            parent_reservation_id: parentReservation.id, // Link to parent
          },
        ])
        .select()
        .single();

      if (error) {
        console.warn('[createRecurringReservation] Error creating instance:', error);
      } else if (instance) {
        instances.push(instance);
      }
    } catch (err) {
      console.warn('[createRecurringReservation] Exception creating instance:', err);
    }

    // Move to next week
    currentDate.setDate(currentDate.getDate() + 7);
  }

  console.log('[createRecurringReservation] Created', instances.length, 'instances');

  // Update parent to mark as recurring
  try {
    const endDateStr = `${endDate.getFullYear()}-${String(endDate.getMonth() + 1).padStart(2, '0')}-${String(endDate.getDate()).padStart(2, '0')}`;
    await supabase
      .from('reservations')
      .update({
        is_recurring: true,
        recurrence_end_date: endDateStr,
      })
      .eq('id', parentReservation.id);
    console.log('[createRecurringReservation] Marked parent as recurring');
  } catch (err) {
    console.warn('[createRecurringReservation] Error marking parent:', err);
  }

  return { parent: parentReservation, instances };
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

    const isCoordinador = role === 'coordinador' || role.startsWith('escuela_');
    if ((isCoordinador || role === 'admin') && !reason) {
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

// ============================================================================
// RESERVATION REQUESTS — Workflow de aprobación
// ============================================================================

/**
 * Get all pending reservation requests (for admin panel)
 * Returns requests with professor details and room/slot info
 */
export async function getPendingReservationRequests(): Promise<ReservationWithDetails[]> {
  const supabase = getSupabaseAdmin();
  
  try {
    console.log('[getPendingReservationRequests] Starting...');
    
    const { data, error } = await supabase
      .from('reservations')
      .select(`
        *,
        room:rooms(*),
        slot:slots(*),
        professor:users!professor_id(*)
      `)
      .eq('status', 'pendiente')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('[getPendingReservationRequests] Supabase error:', error);
      throw error;
    }
    
    const result = (data ?? []).map((res: any) => ({
      ...res,
      professorName: res.professor?.name || 'Profesor Desconocido',
      block: res.room?.block_id,
    }));
    
    console.log('[getPendingReservationRequests] Found', result.length, 'pending requests');
    return result;
  } catch (error) {
    console.error('[getPendingReservationRequests] Caught error:', error);
    throw error;
  }
}

/**
 * Approve a pending reservation request
 * Changes status from 'pendiente' to 'confirmada'
 */
export async function approveReservationRequest(
  requestId: string,
  adminId: string,
): Promise<Reservation> {
  const supabase = getSupabaseAdmin();
  
  try {
    console.log('[approveReservationRequest] Approving request:', requestId, 'by admin:', adminId);
    
    // Fetch the request first
    const { data: request, error: fetchError } = await supabase
      .from('reservations')
      .select('*')
      .eq('id', requestId)
      .eq('status', 'pendiente')
      .single();
    
    if (fetchError || !request) {
      console.log('[approveReservationRequest] Request not found or not pending:', requestId);
      const err = new Error('Solicitud no encontrada o no está pendiente') as any;
      err.code = 'NOT_FOUND';
      throw err;
    }
    
    // Update status to 'confirmada'
    const { data: approved, error: updateError } = await supabase
      .from('reservations')
      .update({
        status: 'confirmada',
        approved_by: adminId,
        approved_at: new Date().toISOString(),
      })
      .eq('id', requestId)
      .select()
      .single();
    
    if (updateError) {
      console.error('[approveReservationRequest] Database error:', updateError);
      throw updateError;
    }
    
    // Record audit
    console.log('[approveReservationRequest] Recording audit...');
    try {
      await recordAudit({
        user_id: adminId,
        user_email: 'unknown',
        user_role: 'admin',
        operation: 'UPDATE',
        entity: 'reservation',
        entity_id: requestId,
        summary: `Solicitud de reserva aprobada: ${request.subject} en ${request.reservation_date} - Profesor: ${request.professor_id}`,
      });
    } catch (auditErr) {
      console.error('[approveReservationRequest] Audit error (non-blocking):', auditErr);
    }
    
    console.log('[approveReservationRequest] Request approved successfully:', requestId);
    return approved;
  } catch (err: any) {
    console.error('[approveReservationRequest] Error:', err);
    throw err;
  }
}

/**
 * Reject a pending reservation request
 * Changes status from 'pendiente' to 'rechazada'
 */
export async function rejectReservationRequest(
  requestId: string,
  adminId: string,
  reason: string,
): Promise<Reservation> {
  const supabase = getSupabaseAdmin();
  
  try {
    console.log('[rejectReservationRequest] Rejecting request:', requestId, 'by admin:', adminId);
    
    // Fetch the request first
    const { data: request, error: fetchError } = await supabase
      .from('reservations')
      .select('*')
      .eq('id', requestId)
      .eq('status', 'pendiente')
      .single();
    
    if (fetchError || !request) {
      console.log('[rejectReservationRequest] Request not found or not pending:', requestId);
      const err = new Error('Solicitud no encontrada o no está pendiente') as any;
      err.code = 'NOT_FOUND';
      throw err;
    }
    
    // Update status to 'rechazada'
    const { data: rejected, error: updateError } = await supabase
      .from('reservations')
      .update({
        status: 'rechazada',
        cancellation_reason: reason,
        cancelled_by: adminId,
        cancelled_at: new Date().toISOString(),
      })
      .eq('id', requestId)
      .select()
      .single();
    
    if (updateError) {
      console.error('[rejectReservationRequest] Database error:', updateError);
      throw updateError;
    }
    
    // Record audit
    console.log('[rejectReservationRequest] Recording audit...');
    try {
      await recordAudit({
        user_id: adminId,
        user_email: 'unknown',
        user_role: 'admin',
        operation: 'UPDATE',
        entity: 'reservation',
        entity_id: requestId,
        summary: `Solicitud de reserva rechazada: ${request.subject} en ${request.reservation_date} - Razón: ${reason}`,
      });
    } catch (auditErr) {
      console.error('[rejectReservationRequest] Audit error (non-blocking):', auditErr);
    }
    
    console.log('[rejectReservationRequest] Request rejected successfully:', requestId);
    return rejected;
  } catch (err: any) {
    console.error('[rejectReservationRequest] Error:', err);
    throw err;
  }
}

/**
 * Delete a pending reservation request
 * Only the creator (profesor) can delete their own pending request
 */
export async function deleteReservationRequest(
  requestId: string,
  professorId: string,
): Promise<{ success: boolean; message: string }> {
  const supabase = getSupabaseAdmin();
  
  try {
    console.log('[deleteReservationRequest] Deleting request:', requestId, 'by professor:', professorId);
    
    // Fetch the request first
    const { data: request, error: fetchError } = await supabase
      .from('reservations')
      .select('*')
      .eq('id', requestId)
      .single();
    
    if (fetchError || !request) {
      console.log('[deleteReservationRequest] Request not found:', requestId);
      const err = new Error('Solicitud no encontrada') as any;
      err.code = 'NOT_FOUND';
      throw err;
    }
    
    // Verify it's pending status OR confirmada (if created by this professor)
    if (request.status === 'pendiente') {
      // Can always delete pending requests
      console.log('[deleteReservationRequest] Deleting pending request');
    } else if (request.status === 'confirmada' && request.created_by === professorId) {
      // Can delete confirmada if professor created it (approved request)
      console.log('[deleteReservationRequest] Deleting approved request created by professor');
    } else {
      console.log('[deleteReservationRequest] Request cannot be deleted:', requestId, 'status:', request.status);
      const err = new Error('Solo se pueden borrar solicitudes pendientes o solicitudes aprobadas que hayas creado') as any;
      err.code = 'INVALID_STATUS';
      throw err;
    }
    
    // Verify ownership (professor_id or created_by must match)
    if (request.professor_id !== professorId && request.created_by !== professorId) {
      console.log('[deleteReservationRequest] Professor not owner:', requestId);
      const err = new Error('No tienes permisos para borrar esta solicitud') as any;
      err.code = 'FORBIDDEN';
      throw err;
    }
    
    // Delete the request (actually delete, not soft delete, since it's not confirmed)
    const { error: deleteError } = await supabase
      .from('reservations')
      .delete()
      .eq('id', requestId);
    
    if (deleteError) {
      console.error('[deleteReservationRequest] Database error:', deleteError);
      throw deleteError;
    }
    
    // Record audit
    console.log('[deleteReservationRequest] Recording audit...');
    try {
      await recordAudit({
        user_id: professorId,
        user_email: 'unknown',
        user_role: 'profesor',
        operation: 'DELETE',
        entity: 'reservation',
        entity_id: requestId,
        summary: `Solicitud de reserva eliminada: ${request.subject} en ${request.reservation_date}`,
      });
    } catch (auditErr) {
      console.error('[deleteReservationRequest] Audit error (non-blocking):', auditErr);
    }
    
    console.log('[deleteReservationRequest] Request deleted successfully:', requestId);
    return { success: true, message: 'Solicitud eliminada exitosamente' };
  } catch (err: any) {
    console.error('[deleteReservationRequest] Error:', err);
    throw err;
  }
}
