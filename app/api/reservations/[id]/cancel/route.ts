/**
 * POST /api/reservations/[id]/cancel
 * Cancela una reserva existente
 * 
 * RN-04: Profesor solo puede cancelar reservas futuras
 * RN-05: Profesor solo puede cancelar sus propias reservas
 * 
 * Coordinador y Admin:
 * - Pueden cancelar cualquier reserva
 * - Deben proporcionar motivo obligatorio
 */

import { NextRequest, NextResponse } from 'next/server';
import { authenticatedRoute } from '@/lib/withAuth';
import { cancelReservation } from '@/lib/dataService';
import { JWTPayload } from '@/lib/types';
import z from 'zod';

const CancelReservationSchema = z.object({
  reason: z.string().min(1, 'El motivo es requerido').optional()
});

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return authenticatedRoute(async (req: NextRequest, user: JWTPayload) => {
    try {
      const { id } = params;
      const body = await req.json();
      const validated = CancelReservationSchema.parse(body);

      const reservation = await cancelReservation(
        id,
        user.userId,
        user.role,
        validated.reason
      );

      return NextResponse.json(reservation);
    } catch (error: unknown) {
      console.error('[POST /api/reservations/:id/cancel] Error:', error);

      // Validation error
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { error: 'Validación fallida', details: (error as z.ZodError).errors },
          { status: 400 }
        );
      }

      const err = error as Record<string, unknown>;

      // Forbidden: trying to cancel someone else's reservation
      if (err.code === 'FORBIDDEN') {
        return NextResponse.json(
          { error: String(err.message) },
          { status: 403 }
        );
      }

      // Invalid cancellation: trying to cancel today or past reservation (RN-04)
      if (err.code === 'INVALID_CANCELLATION_DATE') {
        return NextResponse.json(
          { error: String(err.message) },
          { status: 409 }
        );
      }

      // Missing reason for coordinador/admin
      if (err.code === 'MISSING_REASON') {
        return NextResponse.json(
          { error: String(err.message) },
          { status: 400 }
        );
      }

      // Not found
      if (String(err.message) === 'Reserva no encontrada') {
        return NextResponse.json(
          { error: String(err.message) },
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
