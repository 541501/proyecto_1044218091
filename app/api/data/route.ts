import { NextResponse } from 'next/server';
import { readHomeData } from '@/lib/dataService';

export async function GET() {
  try {
    const homeData = readHomeData();
    return NextResponse.json(homeData, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error reading home data:', error);
    return NextResponse.json(
      { error: 'Failed to read home data' },
      { status: 500 }
    );
  }
}