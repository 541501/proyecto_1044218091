import { NextResponse } from 'next/server';
import { readAppConfig } from '@/lib/dataService';

export async function GET() {
  try {
    const appConfig = readAppConfig();
    return NextResponse.json(appConfig, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error reading app config:', error);
    return NextResponse.json(
      { error: 'Failed to read app configuration' },
      { status: 500 }
    );
  }
}