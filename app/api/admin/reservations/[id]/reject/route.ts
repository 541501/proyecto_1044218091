/**
 * PUT /api/admin/reservations/[id]/reject
 * Admin: Reject a pending reservation request
 */

import { NextRequest, NextResponse } from 'next/server';
import { withRole } from '@/lib/withRole';
import { rejectReservationRequest } from '@/lib/dataService';
import { JWTPayload } from '@/lib/types';
import { use } from 'react';
import z from 'zod';

const RejectSchema = z.object({
  reason: z.string().min(1, 'Razón requerida').max(500),
});

export const PUT = withRole(['admin'])(async (
  req: NextRequest,
  user: JWTPayload,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    const { id } = use(params);
    console.log('[PUT /api/admin/reservations/[id]/reject] Admin:', user.userId, 'Request:', id);

    if (!id) {
      return NextResponse.json({ error: 'ID de solicitud requerido' }, { status: 400 });
    }

    const body = await req.json();
    const validated = RejectSchema.parse(body);

    const rejected = await rejectReservationRequest(id, user.userId, validated.reason);
    
    console.log('[PUT /api/admin/reservations/[id]/reject] Request rejected successfully:', id);
    return NextResponse.json({
      success: true,
      message: 'Solicitud rechazada exitosamente',
      reservation: rejected,
    });
  } catch (error: unknown) {
    const err = error as any;
    console.error('[PUT /api/admin/reservations/[id]/reject] Error:', err);

    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validación fallida', details: err.errors },
        { status: 400 }
      );
    }

    if (err.code === 'NOT_FOUND') {
      return NextResponse.json(
        { error: err.message },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: err.message || 'Error rejecting request' },
      { status: 500 }
    );
  }
});
