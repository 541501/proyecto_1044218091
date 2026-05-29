/**
 * GET /api/reservations/professor/[professorId]
 * Admin/Coordinador: ver horario de un profesor específico
 * Retorna las reservas del profesor (confirmadas y rechazadas)
 */

import { NextRequest, NextResponse } from 'next/server';
import { withRole } from '@/lib/withRole';
import { getSupabaseAdmin } from '@/lib/supabase';
import { JWTPayload } from '@/lib/types';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ professorId: string }> }
) {
  return withRole(['coordinador', 'admin'])(
    async (req: NextRequest, user: JWTPayload, professorId: string) => {
      try {
        const supabase = getSupabaseAdmin();

        // Obtener las reservas del profesor
        const { data: reservations, error } = await supabase
          .from('reservations')
          .select(`
            *,
            room:room_id(*),
            slot:slot_id(*),
            block:room(block_id)
          `)
          .eq('professor_id', professorId)
          .neq('status', 'rechazada') // Excluir rechazadas para ver solo el horario actual
          .order('reservation_date', { ascending: true })
          .order('slot_id', { ascending: true });

        if (error) {
          console.error('[GET /api/reservations/professor] Error:', error);
          return NextResponse.json(
            { error: 'Error fetching professor reservations' },
            { status: 500 }
          );
        }

        return NextResponse.json(reservations || []);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        console.error('[GET /api/reservations/professor] Error:', message);
        return NextResponse.json({ error: message }, { status: 500 });
      }
    }
  )(request, await params);
}
