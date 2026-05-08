'use client';

import { useRouter } from 'next/navigation';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardTitle, CardContent } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { useState, useEffect } from 'react';

export default function ReportsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    (async () => {
      const res = await fetch('/api/auth/me');
      if (!res.ok) router.push('/login');
      else setUser((await res.json()).user);
    })();
  }, [router]);

  if (!user) return <div className="text-center py-20">Cargando...</div>;

  return (
    <AppLayout role={user.role} userName={user.email}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Reportes</h1>
          <p className="text-slate-600">Reporte de ocupación de salones</p>
        </div>

        <Card>
          <CardTitle>Ocupación</CardTitle>
          <CardContent className="mt-4">
            <EmptyState
              title="Sin datos"
              description="Genera un reporte seleccionando un rango de fechas."
              icon="📊"
            />
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
