/**
 * GET /api/reservations/my
 * Retorna las reservas del profesor autenticado
 */

import { NextRequest, NextResponse } from 'next/server';
import { authenticatedRoute } from '@/lib/withAuth';
import { getMyReservations } from '@/lib/dataService';
import { JWTPayload } from '@/lib/types';

export const GET = authenticatedRoute(async (req: NextRequest, user: JWTPayload) => {
  try {
    const searchParams = req.nextUrl.searchParams;
    const status = (searchParams.get('status') as any) || undefined;

    const reservations = await getMyReservations(user.userId, {
      status: status || undefined
    });

    return NextResponse.json(reservations);
  } catch (error) {
    console.error('[GET /api/reservations/my] Error:', error);
    return NextResponse.json(
      { error: 'Error fetching your reservations' },
      { status: 500 }
    );
  }
});
