/**
 * GET /api/reservations
 * POST /api/reservations
 * Coordinador y Admin: ver todas las reservas
 * Profesor: no puede acceder (usa /api/reservations/my)
 */

import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/withAuth';
import { withRole } from '@/lib/withRole';
import { getReservations, createReservation } from '@/lib/dataService';
import { JWTPayload } from '@/lib/types';
import z from 'zod';

const CreateReservationSchema = z.object({
  room_id: z.string().uuid(),
  slot_id: z.string().uuid(),
  reservation_date: z.string().date(),
  subject: z.string().min(1).max(150),
  group_name: z.string().min(1).max(50)
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

export async function POST(request: NextRequest) {
  return withAuth(async (req: NextRequest, user: JWTPayload) => {
    try {
      const body = await req.json();
      const validated = CreateReservationSchema.parse(body);

      const reservation = await createReservation(user.userId, validated);

      return NextResponse.json(reservation, { status: 201 });
    } catch (error: any) {
      console.error('[POST /api/reservations] Error:', error);

      // Validation error
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { error: 'Validación fallida', details: error.errors },
          { status: 400 }
        );
      }

      // Business rule validation
      if (error.code === 'VALIDATION_ERROR') {
        return NextResponse.json(
          { error: error.message },
          { status: 400 }
        );
      }

      // Conflict
      if (error.code === 'CONFLICT' || error.code === 'RACE_CONDITION') {
        const conflict = error.conflict;
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

      return NextResponse.json(
        { error: 'Error creating reservation' },
        { status: 500 }
      );
    }
  })(request);
}
