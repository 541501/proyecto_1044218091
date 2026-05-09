/**
 * lib/reservationService.ts
 * 
 * Servicio de gestión de reservas con prevención de conflictos
 * Implementa RN-01 (unicidad), RN-02 (días hábiles), RN-03 (anticipación máxima)
 */

import { ReservationConflict } from './types';
import { getReservations } from './dataService';

/**
 * Valida las reglas de negocio para una fecha de reserva
 * RN-02: Debe ser día hábil (lunes a viernes)
 * RN-03: No más de 60 días de anticipación
 * 
 * Retorna array de errores. Array vacío = validación OK
 */
export function validateReservationRules(dateStr: string): string[] {
  const errors: string[] = [];
  const date = new Date(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  date.setHours(0, 0, 0, 0);

  // RN-02: Verificar que sea día hábil (lunes=1 a viernes=5)
  // 0=domingo, 1=lunes, 2=martes, 3=miércoles, 4=jueves, 5=viernes, 6=sábado
  const dayOfWeek = date.getDay();
  if (dayOfWeek === 0 || dayOfWeek === 6) {
    errors.push('Las reservas solo pueden realizarse de lunes a viernes');
  }

  // RN-03: Verificar que no sea más de 60 días de anticipación
  const daysDiff = Math.ceil((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  if (daysDiff > 60) {
    errors.push('No se pueden reservar franjas con más de 60 días de anticipación');
  }

  // Además: no permitir reservas en el pasado o de hoy
  if (date < today || date.getTime() === today.getTime()) {
    errors.push('No se pueden reservar franjas del día actual o del pasado');
  }

  return errors;
}

/**
 * Verifica si existe una reserva activa (confirmada) para la combinación
 * (room_id, slot_id, reservation_date)
 * 
 * Retorna los datos del conflicto si existe, o null si la franja está libre
 */
export async function checkConflict(
  roomId: string,
  slotId: string,
  date: string
): Promise<ReservationConflict | null> {
  try {
    const reservations = await getReservations({
      roomId,
      date,
      status: 'confirmada'
    });

    // Buscar si alguna reserva uses el mismo slot
    const conflict = reservations.find((res: any) => res.slot_id === slotId);

    if (conflict) {
      return {
        roomId: conflict.room_id,
        slotId: conflict.slot_id,
        date: conflict.reservation_date,
        professorName: conflict.professorName || 'Profesor desconocido',
        subject: conflict.subject,
        groupName: conflict.group_name,
        conflictingReservationId: conflict.id
      };
    }

    return null;
  } catch (error) {
    console.error('[checkConflict] Error:', error);
    throw error;
  }
}
