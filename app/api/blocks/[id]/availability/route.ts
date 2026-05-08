/**
 * GET /api/blocks/[id]/availability
 * Retorna disponibilidad de un bloque para una fecha
 */

import { NextRequest, NextResponse } from 'next/server';
import { getBlockAvailability } from '@/lib/availabilityService';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0];

    const availability = await getBlockAvailability(params.id, date);

    return NextResponse.json(availability);
  } catch (error) {
    console.error('[GET /api/blocks/:id/availability] Error:', error);
    return NextResponse.json(
      { error: 'Error fetching availability' },
      { status: 500 }
    );
  }
}
