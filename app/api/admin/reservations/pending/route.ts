/**
 * GET /api/admin/reservations/pending
 * Admin: Get all pending reservation requests
 */

import { NextRequest, NextResponse } from 'next/server';
import { authenticatedRoute } from '@/lib/withAuth';
import { withRole } from '@/lib/withRole';
import { getPendingReservationRequests } from '@/lib/dataService';
import { JWTPayload } from '@/lib/types';

export const GET = withRole(['admin'])(async (req: NextRequest, user: JWTPayload) => {
  try {
    console.log('[GET /api/admin/reservations/pending] Request from admin:', user.userId);
    
    const requests = await getPendingReservationRequests();
    
    console.log('[GET /api/admin/reservations/pending] Returning', requests.length, 'pending requests');
    return NextResponse.json(requests);
  } catch (error) {
    console.error('[GET /api/admin/reservations/pending] Error:', error);
    return NextResponse.json(
      { error: 'Error fetching pending requests' },
      { status: 500 }
    );
  }
});
