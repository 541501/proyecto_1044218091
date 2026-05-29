/**
 * GET /api/reservations/[id]
 * Retorna detalles de una reserva
 * 
 * Solo el profesor dueño de la reserva o coordinador/admin pueden verla
 */

import { NextRequest, NextResponse } from 'next/server';
import { authenticatedRoute } from '@/lib/withAuth';
import { getReservations, deleteReservationRequest } from '@/lib/dataService';
import { JWTPayload } from '@/lib/types';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return authenticatedRoute(async (req: NextRequest, user: JWTPayload) => {
    try {
      // Get the reservation with all details
      const allReservations = await getReservations();
      const reservation = allReservations.find((r: any) => r.id === id);

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

/**
 * DELETE /api/reservations/[id]
 * Delete a pending reservation request
 * 
 * Only the professor who created the request can delete it if it's still pending
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return authenticatedRoute(async (req: NextRequest, user: JWTPayload) => {
    try {
      console.log('[DELETE /api/reservations/:id] Professor:', user.userId, 'Request:', id);
      
      const result = await deleteReservationRequest(id, user.userId);
      
      return NextResponse.json({
        success: true,
        message: result.message,
      });
    } catch (error: unknown) {
      const err = error as any;
      console.error('[DELETE /api/reservations/:id] Error:', err);

      if (err.code === 'NOT_FOUND') {
        return NextResponse.json(
          { error: 'Solicitud no encontrada' },
          { status: 404 }
        );
      }

      if (err.code === 'FORBIDDEN') {
        return NextResponse.json(
          { error: err.message },
          { status: 403 }
        );
      }

      if (err.code === 'INVALID_STATUS') {
        return NextResponse.json(
          { error: err.message },
          { status: 400 }
        );
      }

      return NextResponse.json(
        { error: err.message || 'Error deleting request' },
        { status: 500 }
      );
    }
  })(request);
}
