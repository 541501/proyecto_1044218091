/**
 * GET /api/reservations/[id]
 * POST /api/reservations/[id]/cancel
 * Retorna detalles de una reserva o la cancela
 */

import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/withAuth';
import { getReservations, cancelReservation } from '@/lib/dataService';
import { JWTPayload } from '@/lib/types';
import z from 'zod';

const CancelReservationSchema = z.object({
  reason: z.string().optional()
});

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return withAuth(async (req: NextRequest, user: JWTPayload) => {
    try {
      // Get the reservation with all details
      const allReservations = await getReservations();
      const reservation = allReservations.find((r: any) => r.id === params.id);

      if (!reservation) {
        return NextResponse.json(
          { error: 'Reserva no encontrada' },
          { status: 404 }
        );
      }

      // Only the professor who owns it or coordinador/admin can see
      if (user.role === 'profesor' && reservation.professor_id !== user.userId) {
        return NextResponse.json(
          { error: 'No tienes permiso para ver esta reserva' },
          { status: 403 }
        );
      }

      return NextResponse.json(reservation);
    } catch (error) {
      console.error('[GET /api/reservations/:id] Error:', error);
      return NextResponse.json(
        { error: 'Error fetching reservation' },
        { status: 500 }
      );
    }
  })(request);
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return withAuth(async (req: NextRequest, user: JWTPayload) => {
    try {
      const body = await req.json();
      const validated = CancelReservationSchema.parse(body);

      const reservation = await cancelReservation(
        params.id,
        user.userId,
        user.role,
        validated.reason
      );

      return NextResponse.json(reservation);
    } catch (error: any) {
      console.error('[POST /api/reservations/:id/cancel] Error:', error);

      // Validation error
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { error: 'Validación fallida', details: error.errors },
          { status: 400 }
        );
      }

      // Forbidden: trying to cancel someone else's reservation
      if (error.code === 'FORBIDDEN') {
        return NextResponse.json(
          { error: error.message },
          { status: 403 }
        );
      }

      // Invalid cancellation: trying to cancel today or past reservation
      if (error.code === 'INVALID_CANCELLATION_DATE') {
        return NextResponse.json(
          { error: error.message },
          { status: 409 }
        );
      }

      // Missing reason for coordinador/admin
      if (error.code === 'MISSING_REASON') {
        return NextResponse.json(
          { error: error.message },
          { status: 400 }
        );
      }

      // Not found
      if (error.message === 'Reserva no encontrada') {
        return NextResponse.json(
          { error: error.message },
          { status: 404 }
        );
      }

      return NextResponse.json(
        { error: 'Error canceling reservation' },
        { status: 500 }
      );
    }
  })(request);
}
