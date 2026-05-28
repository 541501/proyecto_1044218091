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
import { JWTPayload } from '@/lib/types';
import z from 'zod';

const CreateReservationSchema = z.object({
  room_id: z.string().uuid('ID de sala inválido'),
  slot_id: z.string().uuid('ID de franja inválido'),
  reservation_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Fecha debe ser formato YYYY-MM-DD'),
  subject: z.string().min(1, 'Asignatura requerida').max(150),
  group_name: z.string().min(1, 'Grupo requerido').max(50),
  professor_name: z.string().min(1).max(100).optional()
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
  try {
    console.log('[POST /api/reservations] Request from user:', user.userId);
    
    const body = await req.json();
    console.log('[POST /api/reservations] Body:', body);
    
    const validated = CreateReservationSchema.parse(body);
    console.log('[POST /api/reservations] Validated:', validated);

    const reservation = await createReservation(user.userId, validated);
    console.log('[POST /api/reservations] Created reservation:', reservation.id);

    return NextResponse.json(reservation, { status: 201 });
  } catch (error: unknown) {
    console.error('[POST /api/reservations] Error:', error);

    // Validation error
    if (error instanceof z.ZodError) {
      console.error('[POST /api/reservations] Zod validation error:', (error as z.ZodError).errors);
      return NextResponse.json(
        { error: 'Validación fallida', details: (error as z.ZodError).errors },
        { status: 400 }
      );
    }

    const err = error as Record<string, unknown>;

    // Business rule validation
    if (err.code === 'VALIDATION_ERROR') {
      console.log('[POST /api/reservations] Business validation error:', err.message);
      return NextResponse.json(
        { error: String(err.message) },
        { status: 400 }
      );
    }

    // Conflict
    if (err.code === 'CONFLICT' || err.code === 'RACE_CONDITION') {
      console.log('[POST /api/reservations] Conflict detected:', err.message);
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
          } : undefined
        },
        { status: 409 }
      );
    }

    // Log full error details
    console.error('[POST /api/reservations] Unhandled error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      code: err.code,
      details: err.details,
      stack: error instanceof Error ? error.stack : undefined
    });

    return NextResponse.json(
      { 
        error: 'Error creating reservation',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
});
