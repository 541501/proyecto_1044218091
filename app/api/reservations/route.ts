/**
 * GET /api/reservations
 * POST /api/reservations
 * Coordinador y Admin: ver todas las reservas
 * Profesor: no puede acceder (usa /api/reservations/my)
 */

import { NextRequest, NextResponse } from 'next/server';
import { authenticatedRoute } from '@/lib/withAuth';
import { withRole } from '@/lib/withRole';
import { getReservations, createReservation } from '@/lib/dataService';
import { JWTPayload, CreateReservationRequest } from '@/lib/types';
import z from 'zod';

const CreateReservationSchema = z.object({
  room_id: z.string().uuid('ID de sala inválido'),
  slot_id: z.string().uuid('ID de franja inválido'),
  reservation_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Fecha debe ser formato YYYY-MM-DD'),
  subject: z.string().min(1, 'Asignatura requerida').max(150),
  group_name: z.string().min(1, 'Grupo requerido').max(50),
  professor_name: z.string().max(100).optional(),
  professor_id: z.string().uuid('ID de profesor inválido').optional(),
  reason: z.string().min(1, 'Razón de la solicitud requerida').max(500).optional()
});

export async function GET(request: NextRequest) {
  return withRole(['coordinador', 'admin'])(async (req: NextRequest, user: JWTPayload) => {
    try {
      const searchParams = req.nextUrl.searchParams;
      const blockId = searchParams.get('blockId') || undefined;
      const date = searchParams.get('date') || undefined;
      const status = (searchParams.get('status') as any) || undefined;

      const reservations = await getReservations({
        blockId: blockId || undefined,
        date: date || undefined,
        status: status || undefined
      });

      return NextResponse.json(reservations);
    } catch (error) {
      console.error('[GET /api/reservations] Error:', error);
      return NextResponse.json(
        { error: 'Error fetching reservations' },
        { status: 500 }
      );
    }
  })(request);
}

export const POST = authenticatedRoute(async (req: NextRequest, user: JWTPayload) => {
  const debugLogs: string[] = [];
  
  try {
    debugLogs.push(`[1] Request from user: ${user.userId}`);
    
    const body = await req.json();
    debugLogs.push(`[2] Body received: ${JSON.stringify(body)}`);
    
    const validated = CreateReservationSchema.parse(body);
    debugLogs.push(`[3] Validation passed`);

    // Asegurar que professor_name y professor_id sean undefined si no existen o son vacíos
    const reservationData: CreateReservationRequest = {
      room_id: validated.room_id,
      slot_id: validated.slot_id,
      reservation_date: validated.reservation_date,
      subject: validated.subject,
      group_name: validated.group_name,
      ...(validated.professor_name && validated.professor_name.trim() 
        ? { professor_name: validated.professor_name.trim() } 
        : {}),
      ...(validated.professor_id
        ? { professor_id: validated.professor_id }
        : {}),
      ...(validated.reason && validated.reason.trim()
        ? { reason: validated.reason.trim() }
        : {})
    };

    const reservation = await createReservation(user.userId, reservationData);
    debugLogs.push(`[4] Created reservation: ${reservation.id}`);

    return NextResponse.json(reservation, { status: 201 });
  } catch (error: unknown) {
    debugLogs.push(`[ERROR] ${error instanceof Error ? error.message : String(error)}`);
    debugLogs.push(`[ERROR_STACK] ${error instanceof Error ? error.stack : 'No stack'}`);

    // Validation error
    if (error instanceof z.ZodError) {
      debugLogs.push(`[ZOD_ERROR] Validation failed`);
      return NextResponse.json(
        { 
          error: 'Validación fallida', 
          details: (error as z.ZodError).errors,
          debug: debugLogs
        },
        { status: 400 }
      );
    }

    const err = error as Record<string, unknown>;

    // Business rule validation
    if (err.code === 'VALIDATION_ERROR') {
      debugLogs.push(`[BUSINESS_ERROR] ${String(err.message)}`);
      return NextResponse.json(
        { error: String(err.message), debug: debugLogs },
        { status: 400 }
      );
    }

    // Conflict
    if (err.code === 'CONFLICT' || err.code === 'RACE_CONDITION') {
      debugLogs.push(`[CONFLICT] ${String(err.message)}`);
      const conflict = err.conflict as Record<string, unknown> | undefined;
      return NextResponse.json(
        {
          error: 'El salón ya está reservado en esa franja',
          conflict: conflict ? {
            roomCode: conflict.roomCode,
            slotName: conflict.slotName,
            date: conflict.date,
            professorName: conflict.professorName,
            subject: conflict.subject,
            groupName: conflict.groupName
          } : undefined,
          debug: debugLogs
        },
        { status: 409 }
      );
    }

    debugLogs.push(`[UNHANDLED] ${err.code || 'NO_CODE'}`);

    return NextResponse.json(
      { 
        error: 'Error creating reservation',
        details: error instanceof Error ? error.message : 'Unknown error',
        errorType: typeof error,
        debug: debugLogs
      },
      { status: 500 }
    );
  }
});
