import { NextResponse, type NextRequest } from 'next/server';

/**
 * GET /api/config
 * Retorna la configuración global de la aplicación
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const config = {
      appName: 'ClassSport',
      version: '1.0',
      locale: 'es-CO',
      theme: 'light',
    };
    
    return NextResponse.json(
      {
        success: true,
        data: config,
      },
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
}
