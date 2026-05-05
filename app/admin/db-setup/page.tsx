'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardTitle, CardContent, CardFooter } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Table } from '@/components/ui/Table';
import { useToast } from '@/components/ui/Toast';

interface DiagnosticData {
  mode: 'seed' | 'live';
  supabase: 'connected' | 'not_configured';
  blob: 'configured' | 'not_configured';
  database_url: string;
  migrations: {
    applied: string[];
    pending: string[];
    appliedList: Array<{ filename: string; applied_at: string }>;
    pendingList: string[];
  };
  tables: {
    users: number;
    blocks: number;
    slots: number;
    rooms: number;
    reservations: number;
  };
}

export default function DbSetupPage() {
  const router = useRouter();
  const { addToast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [diagnostic, setDiagnostic] = useState<DiagnosticData | null>(null);
  const [loading, setLoading] = useState(true);
  const [bootstrapping, setBootstrapping] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        // Check user
        const meRes = await fetch('/api/auth/me');
        if (!meRes.ok) throw new Error('Not authenticated');
        const meData = await meRes.json();
        if (meData.user.role !== 'admin') {
          router.push('/dashboard');
          return;
        }
        setUser(meData.user);

        // Get diagnostic
        const diagRes = await fetch('/api/system/diagnose');
        const diagData = await diagRes.json();
        setDiagnostic(diagData);
      } catch (err) {
        console.error('Error:', err);
        router.push('/login');
      } finally {
        setLoading(false);
      }
    })();
  }, [router]);

  const handleBootstrap = async () => {
    if (!confirm('¿Ejecutar bootstrap? Se aplicarán migrations y se cargarán datos iniciales.')) return;

    setBootstrapping(true);
    try {
      const secret = prompt('Ingresa ADMIN_BOOTSTRAP_SECRET:');
      if (!secret) {
        addToast('Bootstrap cancelado', 'info');
        setBootstrapping(false);
        return;
      }

      const res = await fetch('/api/system/bootstrap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ secret }),
      });

      if (!res.ok) {
        const err = await res.json();
        addToast(`Error: ${err.error || 'Bootstrap fallido'}`, 'error');
      } else {
        const data = await res.json();
        addToast(`✓ Bootstrap exitoso: ${data.appliedMigrations.join(', ')}`, 'success');

        // Reload diagnostic
        const diagRes = await fetch('/api/system/diagnose');
        const diagData = await diagRes.json();
        setDiagnostic(diagData);
      }
    } catch (err) {
      console.error('Bootstrap error:', err);
      addToast('Error durante bootstrap', 'error');
    } finally {
      setBootstrapping(false);
    }
  };

  if (loading || !user || !diagnostic) {
    return <div className="flex items-center justify-center h-screen">Cargando...</div>;
  }

  return (
    <AppLayout role="admin" userName={user.email} showSeedBanner={diagnostic.mode === 'seed'}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Configuración de Base de Datos</h1>
          <p className="text-slate-600">Diagnóstico y bootstrap del sistema</p>
        </div>

        {/* Estado del Sistema */}
        <Card>
          <CardTitle>Estado del Sistema</CardTitle>
          <CardContent className="mt-4 grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-slate-600 mb-1">Modo</p>
              <Badge variant={diagnostic.mode === 'live' ? 'success' : 'warning'}>
                {diagnostic.mode === 'live' ? '🔴 Live (Postgres)' : '🌱 Seed (desarrollo)'}
              </Badge>
            </div>
            <div>
              <p className="text-sm text-slate-600 mb-1">Supabase</p>
              <Badge variant={diagnostic.supabase === 'connected' ? 'success' : 'danger'}>
                {diagnostic.supabase}
              </Badge>
            </div>
            <div>
              <p className="text-sm text-slate-600 mb-1">Vercel Blob</p>
              <Badge variant={diagnostic.blob === 'configured' ? 'success' : 'danger'}>
                {diagnostic.blob}
              </Badge>
            </div>
            <div>
              <p className="text-sm text-slate-600 mb-1">Database URL</p>
              <code className="text-xs bg-slate-100 px-2 py-1 rounded">
                {diagnostic.database_url ? '✓ Configurada' : '✗ No configurada'}
              </code>
            </div>
          </CardContent>
        </Card>

        {/* Migrations */}
        <Card>
          <CardTitle>Migrations</CardTitle>
          <CardContent className="mt-4 space-y-4">
            {diagnostic.migrations.appliedList.length > 0 && (
              <div>
                <p className="text-sm font-semibold text-slate-900 mb-2">Aplicadas ({diagnostic.migrations.appliedList.length})</p>
                <ul className="space-y-1">
                  {diagnostic.migrations.appliedList.map((m) => (
                    <li key={m.filename} className="text-sm flex justify-between text-slate-600">
                      <span>✓ {m.filename}</span>
                      <span className="text-xs">{new Date(m.applied_at).toLocaleString()}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {diagnostic.migrations.pendingList.length > 0 && (
              <div>
                <p className="text-sm font-semibold text-slate-900 mb-2">Pendientes ({diagnostic.migrations.pendingList.length})</p>
                <ul className="space-y-1">
                  {diagnostic.migrations.pendingList.map((m) => (
                    <li key={m} className="text-sm text-slate-600">
                      ⏳ {m}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Conteo de Tablas */}
        <Card>
          <CardTitle>Datos en la Base de Datos</CardTitle>
          <CardContent className="mt-4 grid grid-cols-5 gap-4">
            {Object.entries(diagnostic.tables).map(([table, count]) => (
              <div key={table} className="text-center p-4 bg-slate-50 rounded-lg">
                <p className="text-2xl font-bold text-blue-600">{count}</p>
                <p className="text-xs text-slate-600 capitalize">{table}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Bootstrap Panel */}
        {diagnostic.mode === 'seed' && (
          <Card className="border-amber-200 bg-amber-50">
            <CardTitle>Panel de Bootstrap</CardTitle>
            <CardContent className="mt-4">
              <p className="text-sm text-slate-700 mb-4">
                Haz clic en "Ejecutar Bootstrap" para:
              </p>
              <ul className="text-sm text-slate-700 space-y-2 mb-6 ml-4">
                <li>✓ Aplicar 1 migration (<code className="bg-white px-2 py-1 rounded">0001_init_users.sql</code>)</li>
                <li>✓ Crear 1 usuario admin (admin@classsport.edu.co)</li>
                <li>✓ Crear 3 bloques (A, B, C)</li>
                <li>✓ Crear 6 franjas horarias (07:00–20:00)</li>
                <li>✓ Crear 4 salones de demo</li>
              </ul>
              <p className="text-xs text-slate-600 mb-4">
                Requiere ADMIN_BOOTSTRAP_SECRET. Consulta con el administrador del sistema.
              </p>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button
                variant="primary"
                onClick={handleBootstrap}
                isLoading={bootstrapping}
                disabled={bootstrapping}
              >
                {bootstrapping ? 'Ejecutando...' : 'Ejecutar Bootstrap'}
              </Button>
            </CardFooter>
          </Card>
        )}

        {/* Post-Bootstrap Info */}
        {diagnostic.mode === 'live' && (
          <Card className="border-green-200 bg-green-50">
            <CardTitle>✓ Sistema Activo</CardTitle>
            <CardContent className="mt-4">
              <p className="text-sm text-slate-700">
                El bootstrap se ha completado exitosamente. El sistema está en modo live (Postgres) y listo para usar.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}
