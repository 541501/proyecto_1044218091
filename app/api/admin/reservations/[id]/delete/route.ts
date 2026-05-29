/**
 * POST /api/admin/reservations/[id]/delete
 * Admin only: Eliminar una reserva del historial (con razón opcional)
 */

import { NextRequest, NextResponse } from 'next/server';
import { withRole } from '@/lib/withRole';
import { getSupabaseAdmin } from '@/lib/supabase';
import { JWTPayload } from '@/lib/types';
import { z } from 'zod';

const DeleteReservationSchema = z.object({
  reason: z.string().optional(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const resolvedParams = await params;
  return withRole(['admin'])(
    async (req: NextRequest, user: JWTPayload) => {
      try {
        const id = resolvedParams.id;
        const body = await req.json();
        const validated = DeleteReservationSchema.parse(body);

        const supabase = getSupabaseAdmin();

        // Verificar que la reserva existe
        const { data: reservation, error: fetchError } = await supabase
          .from('reservations')
          .select('*')
          .eq('id', id)
          .single();

        if (fetchError || !reservation) {
          return NextResponse.json(
            { error: 'Reserva no encontrada' },
            { status: 404 }
          );
        }

        // Eliminar la reserva
        const { error: deleteError } = await supabase
          .from('reservations')
          .delete()
          .eq('id', id);

        if (deleteError) {
          console.error('[POST /api/admin/reservations/:id/delete] Error:', deleteError);
          return NextResponse.json(
            { error: 'Error al eliminar la reserva' },
            { status: 500 }
          );
        }

        console.log(`[POST /api/admin/reservations/:id/delete] Admin ${user.userId} deleted reservation ${id}`);

        return NextResponse.json({
          success: true,
          message: 'Reserva eliminada del historial',
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        console.error('[POST /api/admin/reservations/:id/delete] Error:', message);
        return NextResponse.json({ error: message }, { status: 500 });
      }
    }
  )(request);
}
