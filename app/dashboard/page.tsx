'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';

interface User {
  userId: string;
  email: string;
  role: 'profesor' | 'coordinador' | 'admin';
}

export default function DashboardPage() {
  const router = useRouter();
  const { addToast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [systemMode, setSystemMode] = useState<'seed' | 'live' | null>(null);
  const [dashboardData, setDashboardData] = useState<any>(null);

  useEffect(() => {
    (async () => {
      try {
        // Get current user
        const meRes = await fetch('/api/auth/me');
        if (!meRes.ok) throw new Error('Not authenticated');
        const meData = await meRes.json();
        setUser(meData.user);

        // Get system mode
        const modeRes = await fetch('/api/system/mode');
        const modeData = await modeRes.json();
        setSystemMode(modeData.mode);

        // Get dashboard data
        const dashRes = await fetch('/api/dashboard');
        const dashData = await dashRes.json();
        setDashboardData(dashData.data);
      } catch (err) {
        console.error('Dashboard load error:', err);
        router.push('/login');
      } finally {
        setLoading(false);
      }
    })();
  }, [router]);

  if (loading || !user) {
    return <div className="flex items-center justify-center h-screen">Cargando...</div>;
  }

  return (
    <AppLayout role={user.role} userName={user.email} showSeedBanner={systemMode === 'seed'}>
      <div className="space-y-6">
        {/* Bienvenida */}
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Bienvenido, {user.email.split('@')[0]}
          </h1>
          <p className="text-slate-600">
            {systemMode === 'seed'
              ? 'Sistema en modo desarrollo. Ejecuta el bootstrap para activar la base de datos.'
              : 'Gestor de salones universitarios'}
          </p>
        </div>

        {/* Dashboard según rol */}
        {user.role === 'profesor' && (
          <div className="space-y-6">
            {/* Reservas del día */}
            <Card>
              <CardTitle>Reservas de Hoy</CardTitle>
              <CardContent className="mt-4">
                {dashboardData?.todayReservations?.length === 0 ? (
                  <EmptyState
                    title="Sin reservas para hoy"
                    description="No tienes ninguna reserva programada para hoy."
                    icon="📅"
                  />
                ) : (
                  <div className="space-y-3">
                    {dashboardData?.todayReservations?.map((res: any) => (
                      <div key={res.id} className="p-4 border border-slate-200 rounded-lg">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-semibold text-slate-900">{res.roomName}</p>
                            <p className="text-sm text-slate-600">{res.slotTime}</p>
                          </div>
                          <Badge variant="success">Confirmada</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Próximas reservas */}
            <Card>
              <CardTitle>Próximas Reservas (7 días)</CardTitle>
              <CardContent className="mt-4">
                {dashboardData?.upcomingReservations?.length === 0 ? (
                  <EmptyState
                    title="Sin próximas reservas"
                    description="No tienes reservas en los próximos 7 días."
                    icon="📋"
                    action={{
                      label: 'Hacer una reserva',
                      onClick: () => router.push('/blocks'),
                    }}
                  />
                ) : (
                  <div className="space-y-3">
                    {dashboardData?.upcomingReservations?.map((res: any) => (
                      <div key={res.id} className="p-4 border border-slate-200 rounded-lg">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-semibold text-slate-900">{res.roomName}</p>
                            <p className="text-sm text-slate-600">
                              {res.date} - {res.slotTime}
                            </p>
                          </div>
                          <Badge variant="success">Confirmada</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {(user.role === 'coordinador' || user.role === 'admin') && (
          <div>
            <Card>
              <CardTitle>Estado Global de Hoy</CardTitle>
              <CardContent className="mt-4">
                {dashboardData?.blockOccupancy?.length === 0 ? (
                  <EmptyState
                    title="Sin datos disponibles"
                    description="No hay información de reservas en este momento."
                    icon="📊"
                  />
                ) : (
                  <div className="grid grid-cols-3 gap-4">
                    {dashboardData?.blockOccupancy?.map((block: any) => (
                      <Card key={block.id}>
                        <CardContent>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-blue-600 mb-2">
                              {block.name}
                            </div>
                            <p className="text-sm text-slate-600">
                              {block.occupied} de {block.total} franjas
                            </p>
                            <div className="mt-3 w-full bg-slate-200 rounded-full h-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full"
                                style={{
                                  width: `${(block.occupied / block.total) * 100}%`,
                                }}
                              />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
