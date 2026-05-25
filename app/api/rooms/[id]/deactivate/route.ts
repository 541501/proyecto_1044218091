/**
 * POST /api/rooms/[id]/deactivate (admin only)
 * GET: Verifica si hay reservas futuras (RN-10)
 * POST con ?confirm=true: Confirma desactivación
 */

import { NextRequest, NextResponse } from 'next/server';
import { withRole } from '@/lib/withRole';
import { deactivateRoom, confirmDeactivateRoom } from '@/lib/dataService';
import { JWTPayload } from '@/lib/types';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return withRole(['admin'])(async (req: NextRequest, user: JWTPayload) => {
    try {
      const searchParams = req.nextUrl.searchParams;
      const confirm = searchParams.get('confirm') === 'true';

      if (!confirm) {
        // Primera llamada: verificar y retornar advertencia si hay reservas futuras
        const { warningCount } = await deactivateRoom(id, user.userId);

        return NextResponse.json({
          warningCount,
          requiresConfirmation: warningCount > 0
        });
      } else {
        // Segunda llamada: confirmar desactivación
        const room = await confirmDeactivateRoom(id, user.userId);
        
        return NextResponse.json(room);
      }
    } catch (error: unknown) {
      console.error('[POST /api/rooms/:id/deactivate] Error:', error);
      const err = error as Record<string, unknown>;
      return NextResponse.json(
        { error: String(err.message) || 'Error deactivating room' },
        { status: 500 }
      );
    }
  })(request);
}
