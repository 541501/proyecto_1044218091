import { NextRequest, NextResponse } from 'next/server';
import { getSystemMode } from '@/lib/dataService';

export async function GET(req: NextRequest) {
  try {
    const mode = await getSystemMode();
    return NextResponse.json({ mode });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to get system mode' }, { status: 500 });
  }
}
