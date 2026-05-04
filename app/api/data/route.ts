import { NextResponse, type NextRequest } from 'next/server';

/**
 * GET /api/data
 * Retorna datos de demostración
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const homeData = {
      hero: {
        title: 'ClassSport',
        subtitle: 'Gestión de salones universitarios',
        description: 'Plataforma de asignación de espacios',
        animationStyle: 'fadeIn' as const,
      },
      meta: {
        pageTitle: 'ClassSport',
        description: 'Gestión de salones universitarios',
      },
    };
    
    return NextResponse.json(
      {
        success: true,
        data: homeData,
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
