import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/withAuth';
import { getSystemMode } from '@/lib/dataService';

export async function GET(req: NextRequest) {
  return withAuth(req, async (user) => {
    const mode = await getSystemMode();

    // En seed mode, retornar estructura vacía
    if (mode === 'seed') {
      if (user.role === 'profesor') {
        return NextResponse.json({
          role: 'profesor',
          data: {
            todayReservations: [],
            upcomingReservations: [],
            hasReservations: false,
          },
        });
      } else {
        // coordinador o admin
        return NextResponse.json({
          role: user.role,
          data: {
            blockOccupancy: [],
            totalActiveReservations: 0,
          },
        });
      }
    }

    // TODO: En live mode, implementar queries reales
    // Por ahora, retornar estructura vacía también
    return NextResponse.json({
      role: user.role,
      data:
        user.role === 'profesor'
          ? {
              todayReservations: [],
              upcomingReservations: [],
              hasReservations: false,
            }
          : {
              blockOccupancy: [],
              totalActiveReservations: 0,
            },
    });
  });
}
