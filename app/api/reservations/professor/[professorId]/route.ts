/**
 * GET /api/reservations/professor/[professorId]
 * Admin/Coordinador: ver horario de un profesor o coordinador específico
 * Retorna las reservas del usuario (profesor o coordinador) - exactamente igual que getMyReservations
 */

import { NextRequest, NextResponse } from 'next/server';
import { withRole } from '@/lib/withRole';
import { getReservations } from '@/lib/dataService';
import { JWTPayload } from '@/lib/types';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ professorId: string }> }
) {
  return withRole(['coordinador', 'admin'])(
    async (req: NextRequest, user: JWTPayload, professorId: string) => {
      try {
        console.log('[GET /api/reservations/professor] Fetching reservations for professorId:', professorId);
        
        // Obtener todas las reservas del usuario (igual que getMyReservations)
        const reservations = await getReservations({
          professorId: professorId,
        });

        console.log('[GET /api/reservations/professor] Found', reservations.length, 'reservations');
        return NextResponse.json(reservations || []);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        console.error('[GET /api/reservations/professor] Error:', message);
        return NextResponse.json({ error: message }, { status: 500 });
      }
    }
  )(request, await params);
}
