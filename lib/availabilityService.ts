/**
 * lib/availabilityService.ts
 * 
 * Servicio de disponibilidad en tiempo real
 * Construye calendarios semanales y calcula disponibilidad por bloque
 */

import 'server-only';
import { 
  WeeklyCalendar, 
  BlockAvailability, 
  SlotCellState,
  Slot,
  Room,
  Block,
  Reservation,
  ReservationWithDetails 
} from './types';
import { getSlots, getRooms, getRoomById, getReservations, getBlocks } from './dataService';

/**
 * Construye el calendario semanal de un salón
 * Para cada día (lun-vie) y cada franja horaria:
 * - 'libre' si no hay reserva
 * - 'ocupada' si hay reserva activa
 * - 'pasada' si la fecha es <= hoy
 */
export async function buildWeeklyCalendar(
  roomId: string,
  weekStart: string  // ISO date string (Monday)
): Promise<WeeklyCalendar> {
  const slots = await getSlots();
  const room = await getRoomById(roomId);
  
  if (!room) {
    throw new Error(`Salón no encontrado: ${roomId}`);
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const startDate = new Date(weekStart);
  const days: Date[] = [];
  
  // Generar 6 días (lunes a sábado)
  for (let i = 0; i < 6; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    date.setHours(0, 0, 0, 0);
    days.push(date);
  }

  // Obtener todas las reservas de la semana para este salón
  const reservations = await getReservations({
    roomId,
    from: weekStart,
    to: new Date(days[days.length - 1].getTime() + 86400000).toISOString().split('T')[0]
  });

  // Mapear reservas para búsqueda rápida
  const reservationMap = new Map<string, ReservationWithDetails>();
  reservations.forEach((res: ReservationWithDetails) => {
    const key = `${res.reservation_date}|${res.slot_id}`;
    if (res.status === 'confirmada') {
      reservationMap.set(key, res);
    }
  });

  // Construir grilla
  const calendar: WeeklyCalendar = {
    roomId,
    roomCode: room.code,
    blockId: room.block_id,
    weekStart,
    days: days.map(date => ({
      date: date.toISOString().split('T')[0],
      dayName: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sab'][date.getDay() === 0 ? 6 : date.getDay() - 1],
      slots: slots.map((slot: Slot) => {
        const dateKey = date.toISOString().split('T')[0];
        const reservationKey = `${dateKey}|${slot.id}`;
        const reservation = reservationMap.get(reservationKey);
        
        let state: SlotCellState;
        
        if (date < today || date.toISOString().split('T')[0] === today.toISOString().split('T')[0]) {
          // Hoy o fecha pasada
          if (reservation) {
            state = 'ocupada_pasada';
          } else {
            state = 'pasada';
          }
        } else {
          // Futuro
          state = reservation ? 'ocupada' : 'libre';
        }

        return {
          slotId: slot.id,
          slotName: slot.name,
          startTime: slot.start_time,
          endTime: slot.end_time,
          state,
          reservation: reservation ? {
            id: reservation.id,
            professorName: reservation.professorName || 'Profesor',
            subject: reservation.subject,
            groupName: reservation.group_name,
            professorTag: reservation.professor_name || undefined
          } : undefined
        };
      })
    }))
  };

  return calendar;
}

/**
 * Calcula disponibilidad de un bloque para una fecha específica
 * Retorna conteo de salones libres y ocupados
 */
export async function getBlockAvailability(
  blockId: string,
  date: string  // ISO date string
): Promise<BlockAvailability> {
  const rooms = await getRooms({ 
    blockId,
    isActive: true 
  });

  // Obtener todas las reservas del día para todos los salones del bloque
  const reservations = await getReservations({
    blockId,
    date
  });

  // Mapear reservas por salón
  const reservedRoomIds = new Set(
    reservations
      .filter((r: ReservationWithDetails) => r.status === 'confirmada')
      .map((r: ReservationWithDetails) => r.room_id)
  );

  const availableCount = rooms.filter((r: Room) => !reservedRoomIds.has(r.id)).length;
  const occupiedCount = rooms.length - availableCount;

  return {
    blockId,
    date,
    totalRooms: rooms.length,
    availableRooms: availableCount,
    occupiedRooms: occupiedCount,
    availabilityPercentage: rooms.length > 0 
      ? Math.round((availableCount / rooms.length) * 100)
      : 0
  };
}

/**
 * Calcula disponibilidad de todos los bloques para una fecha
 */
export async function getAllBlocksAvailability(date: string): Promise<BlockAvailability[]> {
  const blocks = await getBlocks();
  
  const availabilities = await Promise.all(
    blocks.map((block: Block) => getBlockAvailability(block.id, date))
  );

  return availabilities;
}
