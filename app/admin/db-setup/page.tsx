'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import {
  IconShield,
  IconAlert,
  IconCheck,
  IconDot,
  IconArchive,
  IconHash,
} from '@/components/icons';

interface DiagnosticData {
  mode: 'seed' | 'live';
  supabase: 'connected' | 'unreachable' | 'not_configured';
  jwt: 'configured' | 'not_configured';
  database_url: string;
  migrations: {
    applied: number;
    pending: number;
    appliedList: Array<{ filename: string; applied_at: string } | string>;
    pendingList: string[];
  };
  tables: {
    users: number;
    blocks: number;
    slots: number;
    rooms: number;
  };
}

export default function DbSetupPage() {
  const router = useRouter();
  const { addToast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [diagnostic, setDiagnostic] = useState<DiagnosticData | null>(null);
  const [loading, setLoading] = useState(true);
  const [bootstrapping, setBootstrapping] = useState(false);
  const [showSecretModal, setShowSecretModal] = useState(false);
  const [secretInput, setSecretInput] = useState('');

  const loadDiagnostic = async () => {
    const diagRes = await fetch('/api/system/diagnose');
    if (diagRes.ok) setDiagnostic(await diagRes.json());
  };

  useEffect(() => {
    (async () => {
      try {
        const meRes = await fetch('/api/auth/me');
        if (!meRes.ok) throw new Error('Not authenticated');
        const userData = (await meRes.json()).user;
        if (userData?.role !== 'admin') return router.push('/dashboard');
        setUser(userData);
        await loadDiagnostic();
      } catch {
        router.push('/login');
      } finally {
        setLoading(false);
      }
    })();
  }, [router]);

  const confirmBootstrap = async () => {
    if (!secretInput.trim()) return addToast('El secreto es requerido', 'error');
    setShowSecretModal(false);
    setBootstrapping(true);
    try {
      const res = await fetch('/api/system/bootstrap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ secret: secretInput }),
      });
      if (!res.ok) {
        const err = await res.json();
        addToast(`Error: ${err.error || 'Bootstrap fallido'}`, 'error');
      } else {
        const data = await res.json();
        addToast(`Bootstrap exitoso: ${data.appliedMigrations.length} migrations aplicadas`, 'success');
        await loadDiagnostic();
      }
    } catch {
      addToast('Error durante bootstrap', 'error');
    } finally {
      setBootstrapping(false);
      setSecretInput('');
    }
  };

  if (loading || !user || !diagnostic) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-paper text-ink-mute font-mono text-sm uppercase tracking-wide">
        Cargando diagnóstico…
      </div>
    );
  }

  const statusOk = diagnostic.supabase === 'connected' && diagnostic.jwt === 'configured';

  return (
    <AppLayout role="admin" userName={user.name || user.email} showSeedBanner={diagnostic.mode === 'seed'}>
      <div className="max-w-6xl mx-auto">
        <header className="mb-10 animate-rise">
          <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-wide text-ink-mute mb-3">
            <IconDot size={6} className="text-accent" />
            <span>Administración · Sistema</span>
          </div>
          <h1 className="font-display text-5xl md:text-6xl leading-[0.95] text-ink">
            Configuración
            <span className="italic text-accent"> técnica</span>
          </h1>
          <p className="mt-4 max-w-xl text-ink-soft text-[15px] leading-relaxed">
            Diagnóstico de conexiones, control de migrations y bootstrap inicial del sistema.
          </p>
        </header>

        {/* Status grid */}
        <section className="mb-10">
          <div className="font-mono text-[10px] uppercase tracking-wide text-ink-mute mb-3">
            Estado del sistema
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-rule border border-rule">
            <StatusCell
              label="Modo"
              value={diagnostic.mode === 'live' ? 'Live · Postgres' : 'Seed · Desarrollo'}
              tone={diagnostic.mode === 'live' ? 'success' : 'warning'}
            />
            <StatusCell
              label="Supabase"
              value={diagnostic.supabase}
              tone={diagnostic.supabase === 'connected' ? 'success' : 'danger'}
            />
            <StatusCell
              label="JWT"
              value={diagnostic.jwt}
              tone={diagnostic.jwt === 'configured' ? 'success' : 'danger'}
            />
            <StatusCell
              label="Database URL"
              value={diagnostic.database_url === 'configured' ? 'OK' : 'Falta'}
              tone={diagnostic.database_url === 'configured' ? 'success' : 'danger'}
            />
          </div>
        </section>

        {/* Tables */}
        <section className="mb-10">
          <div className="flex items-end justify-between mb-3">
            <div className="font-mono text-[10px] uppercase tracking-wide text-ink-mute">
              Conteo de tablas
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(diagnostic.tables).map(([table, count]) => (
              <div key={table} className="border border-rule bg-surface p-5">
                <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-wide text-ink-mute">
                  <IconHash size={12} />
                  <span>{table}</span>
                </div>
                <div className="font-display text-5xl text-ink leading-none mt-3">{count}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Migrations */}
        <section className="mb-10">
          <div className="font-mono text-[10px] uppercase tracking-wide text-ink-mute mb-3 inline-flex items-center gap-2">
            <IconArchive size={12} />
            Migrations · {diagnostic.migrations.applied} aplicadas · {diagnostic.migrations.pending} pendientes
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="border border-rule bg-surface p-5">
              <h3 className="font-display text-lg text-ink mb-3">Aplicadas</h3>
              {diagnostic.migrations.appliedList.length === 0 ? (
                <p className="text-sm text-ink-mute italic">Aún no se aplican migrations.</p>
              ) : (
                <ul className="space-y-1.5 font-mono text-[12px]">
                  {diagnostic.migrations.appliedList.map((m: any) => {
                    const name = typeof m === 'string' ? m : m.filename;
                    return (
                      <li key={name} className="flex items-center gap-2 text-ok">
                        <IconCheck size={12} />
                        <span>{name}</span>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
            <div className="border border-rule bg-surface p-5">
              <h3 className="font-display text-lg text-ink mb-3">Pendientes</h3>
              {diagnostic.migrations.pendingList.length === 0 ? (
                <p className="text-sm text-ink-mute italic">Sin migrations pendientes.</p>
              ) : (
                <ul className="space-y-1.5 font-mono text-[12px]">
                  {diagnostic.migrations.pendingList.map((m) => (
                    <li key={m} className="flex items-center gap-2 text-warn">
                      <IconAlert size={12} />
                      <span>{m}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </section>

        {/* Bootstrap action */}
        {diagnostic.mode === 'seed' ? (
          <section className="border-l-4 border-accent bg-accent-soft/60 p-6">
            <div className="font-mono text-[10px] uppercase tracking-wide text-accent mb-2 inline-flex items-center gap-2">
              <IconShield size={12} />
              Bootstrap requerido
            </div>
            <h2 className="font-display text-3xl text-ink leading-tight">
              Aplica el bootstrap inicial
            </h2>
            <p className="text-ink-soft mt-3 max-w-xl text-sm leading-relaxed">
              Aplicará las migrations pendientes, creará los 3 bloques, las 6 franjas horarias, los 4 salones de demo y el usuario administrador inicial.
            </p>
            <div className="mt-5">
              <Button
                variant="ink"
                onClick={() => setShowSecretModal(true)}
                isLoading={bootstrapping}
              >
                {bootstrapping ? 'Ejecutando…' : 'Ejecutar bootstrap'}
              </Button>
            </div>
          </section>
        ) : (
          <section className="border-l-4 border-ok bg-ok-bg/60 p-6">
            <div className="font-mono text-[10px] uppercase tracking-wide text-ok mb-2 inline-flex items-center gap-2">
              <IconCheck size={12} />
              Sistema activo
            </div>
            <h2 className="font-display text-3xl text-ink leading-tight">
              Modo live · Postgres activo
            </h2>
            <p className="text-ink-soft mt-3 max-w-xl text-sm">
              {statusOk
                ? 'Todas las conexiones están operativas. Puedes seguir con la gestión normal.'
                : 'Hay servicios marcados como faltantes. Revisa la sección de estado.'}
            </p>
            {diagnostic.migrations.pending > 0 ? (
              <div className="mt-5">
                <Button variant="ink" onClick={() => setShowSecretModal(true)}>
                  Aplicar migrations pendientes
                </Button>
              </div>
            ) : null}
          </section>
        )}

        {/* Secret Modal */}
        <Modal
          isOpen={showSecretModal}
          onClose={() => setShowSecretModal(false)}
          title="Bootstrap protegido"
          eyebrow="Ingresa el secreto"
          actions={[
            {
              label: 'Confirmar',
              variant: 'ink',
              onClick: confirmBootstrap,
              isLoading: bootstrapping,
            },
          ]}
        >
          <div className="space-y-4">
            <p className="text-sm text-ink-soft">
              Por seguridad, las operaciones de migración exigen confirmar el secreto del sistema.
            </p>
            <input
              type="password"
              value={secretInput}
              onChange={(e) => setSecretInput(e.target.value)}
              placeholder="ADMIN_BOOTSTRAP_SECRET"
              className="field font-mono"
              onKeyDown={(e) => e.key === 'Enter' && confirmBootstrap()}
              autoFocus
            />
          </div>
        </Modal>
      </div>
    </AppLayout>
  );
}

function StatusCell({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: 'success' | 'warning' | 'danger';
}) {
  return (
    <div className="bg-surface p-5">
      <div className="font-mono text-[10px] uppercase tracking-wide text-ink-mute mb-2">
        {label}
      </div>
      <Badge variant={tone === 'success' ? 'success' : tone === 'warning' ? 'warning' : 'danger'}>
        {value}
      </Badge>
    </div>
  );
}
