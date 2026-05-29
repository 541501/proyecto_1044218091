/**
 * PUT /api/admin/reservations/[id]/approve
 * Admin: Approve a pending reservation request
 */

import { NextRequest, NextResponse } from 'next/server';
import { withRole } from '@/lib/withRole';
import { approveReservationRequest } from '@/lib/dataService';
import { JWTPayload } from '@/lib/types';
import { use } from 'react';
import z from 'zod';

export const PUT = withRole(['admin'])(async (
  req: NextRequest,
  user: JWTPayload,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    const { id } = use(params);
    console.log('[PUT /api/admin/reservations/[id]/approve] Admin:', user.userId, 'Request:', id);

    if (!id) {
      return NextResponse.json({ error: 'ID de solicitud requerido' }, { status: 400 });
    }

    const approved = await approveReservationRequest(id, user.userId);
    
    console.log('[PUT /api/admin/reservations/[id]/approve] Request approved successfully:', id);
    return NextResponse.json({
      success: true,
      message: 'Solicitud aprobada exitosamente',
      reservation: approved,
    });
  } catch (error: unknown) {
    const err = error as any;
    console.error('[PUT /api/admin/reservations/[id]/approve] Error:', err);

    if (err.code === 'NOT_FOUND') {
      return NextResponse.json(
        { error: err.message },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: err.message || 'Error approving request' },
      { status: 500 }
    );
  }
});
