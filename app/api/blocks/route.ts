/**
 * GET /api/blocks
 * Retorna lista de bloques activos con disponibilidad
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getBlocks, getRooms } from '@/lib/dataService';
import { getBlockAvailability } from '@/lib/availabilityService';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0];

    const blocks = await getBlocks();
    
    // Get availability for each block
    const blocksWithAvailability = await Promise.all(
      blocks.map(async (block: any) => {
        const availability = await getBlockAvailability(block.id, date);
        const rooms = await getRooms({ blockId: block.id });
        return {
          ...block,
          availability,
          roomCount: rooms.length
        };
      })
    );

    return NextResponse.json(blocksWithAvailability);
  } catch (error) {
    console.error('[GET /api/blocks] Error:', error);
    return NextResponse.json(
      { error: 'Error fetching blocks' },
      { status: 500 }
    );
  }
}
