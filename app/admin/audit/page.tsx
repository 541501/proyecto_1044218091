'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppLayout } from '@/components/layout/AppLayout';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { IconChevronLeft, IconChevronRight, IconDot, IconAlert } from '@/components/icons';

type Operation = 'INSERT' | 'UPDATE' | 'DELETE';
type Entity = 'reservation' | 'room' | 'user';

interface AuditEntry {
  id: string;
  timestamp: string;
  user_id: string;
  user_email: string;
  user_role: 'profesor' | 'coordinador' | 'admin';
  operation: Operation;
  entity: Entity;
  entity_id?: string | null;
  summary: string;
}

const OP_LABEL: Record<Operation, string> = {
  INSERT: 'Creación',
  UPDATE: 'Actualización',
  DELETE: 'Eliminación',
};
const ENT_LABEL: Record<Entity, string> = {
  reservation: 'Reserva',
  room: 'Salón',
  user: 'Usuario',
};
const ROLE_LABEL: Record<string, string> = {
  profesor: 'Profesor',
  coordinador: 'Coordinador',
  admin: 'Administrador',
};

export default function AdminAuditPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [month, setMonth] = useState('');
  const [entityFilter, setEntityFilter] = useState<'' | Entity>('');
  const [operationFilter, setOperationFilter] = useState<'' | Operation>('');
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const now = new Date();
    setMonth(`${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`);
  }, []);

  useEffect(() => {
    (async () => {
      const meRes = await fetch('/api/auth/me', { credentials: 'include' });
      if (meRes.ok) setUser((await meRes.json()).user);
      else router.replace('/login');
    })();
  }, [router]);}

  useEffect(() => {
    if (!month) return;
    (async () => {
      setLoading(true);
      setError('');
      try {
        const p = new URLSearchParams({ month });
        if (entityFilter) p.set('entity', entityFilter);
        if (operationFilter) p.set('operation', operationFilter);
      const res = await fetch(`/api/audit?${p.toString()}`, { credentials: 'include' });
        if (res.ok) setEntries(await res.json());
        else {
          const data = await res.json().catch(() => ({}));
          setError(data.error || 'Error al cargar la auditoría');
          setEntries([]);
        }
      } catch (e: any) {
        setError('Error de red: ' + e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [month, entityFilter, operationFilter]);

  const shiftMonth = (d: number) => {
    const y = parseInt(month.substring(0, 4));
    const m = parseInt(month.substring(4));
    const dt = new Date(y, m - 1 + d, 1);
    setMonth(`${dt.getFullYear()}${String(dt.getMonth() + 1).padStart(2, '0')}`);
  };

  const fmtMonth = (yyyymm: string) => {
    if (!yyyymm) return '';
    const y = yyyymm.substring(0, 4);
    const m = parseInt(yyyymm.substring(4));
    return new Date(parseInt(y), m - 1).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'long',
    });
  };

  const fmtTs = (iso: string) =>
    new Date(iso).toLocaleString('es-CO', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });

  const opTone = (o: Operation) => (o === 'INSERT' ? 'success' : o === 'UPDATE' ? 'warning' : 'danger');

  return (
    <AppLayout role={user?.role || 'profesor'} userName={user?.name}>
      <div className="max-w-7xl mx-auto">
        <header className="mb-10 animate-rise">
          <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-wide text-ink-mute mb-3">
            <IconDot size={6} className="text-accent" />
            <span>Auditoría · audit_log</span>
          </div>
          <h1 className="font-display text-5xl md:text-6xl leading-[0.95] text-ink">
            Bitácora
            <span className="italic text-accent"> del sistema</span>
          </h1>
          <p className="mt-4 max-w-xl text-ink-soft text-[15px] leading-relaxed">
            Operaciones <span className="font-mono text-[13px] text-ink">INSERT · UPDATE · DELETE</span> sobre reservas, salones y usuarios, ordenadas de más reciente a más antigua.
          </p>
        </header>

        {/* Toolbar */}
        <div className="border-y border-rule py-3 mb-8 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => shiftMonth(-1)}
              className="h-9 w-9 border border-rule hover:border-ink hover:bg-paper-soft inline-flex items-center justify-center text-ink-soft hover:text-ink transition-colors"
              aria-label="Mes anterior"
            >
              <IconChevronLeft size={16} />
            </button>
            <div className="min-w-[180px] text-center">
              <div className="font-mono text-[10px] uppercase tracking-wide text-ink-mute">
                Mes
              </div>
              <div className="font-display text-lg text-ink capitalize">{fmtMonth(month)}</div>
            </div>
            <button
              onClick={() => shiftMonth(1)}
              className="h-9 w-9 border border-rule hover:border-ink hover:bg-paper-soft inline-flex items-center justify-center text-ink-soft hover:text-ink transition-colors"
              aria-label="Mes siguiente"
            >
              <IconChevronRight size={16} />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={entityFilter}
              onChange={(e) => setEntityFilter(e.target.value as any)}
              className="field h-9 py-0 text-sm"
            >
              <option value="">Todas las entidades</option>
              <option value="reservation">Reservas</option>
              <option value="room">Salones</option>
              <option value="user">Usuarios</option>
            </select>
            <select
              value={operationFilter}
              onChange={(e) => setOperationFilter(e.target.value as any)}
              className="field h-9 py-0 text-sm"
            >
              <option value="">Todas las operaciones</option>
              <option value="INSERT">Creaciones</option>
              <option value="UPDATE">Actualizaciones</option>
              <option value="DELETE">Eliminaciones</option>
            </select>
            <span className="font-mono text-[11px] text-ink-mute ml-2">
              <span className="text-ink font-medium">{String(entries.length).padStart(2, '0')}</span> eventos
            </span>
          </div>
        </div>

        {error ? (
          <div className="mb-6 px-4 py-3 border-l-2 border-bad bg-bad-bg text-bad text-sm inline-flex items-center gap-2.5">
            <IconAlert size={16} />
            {error}
          </div>
        ) : null}

        {loading ? (
          <div className="text-center py-12 font-mono text-sm uppercase tracking-wide text-ink-mute">
            Cargando bitácora…
          </div>
        ) : entries.length === 0 ? (
          <EmptyState
            eyebrow="Sin eventos"
            title={`No hay registros en ${fmtMonth(month).toLowerCase()}`}
            description="Cuando se realicen operaciones DML aparecerán acá ordenadas por fecha."
          />
        ) : (
          <div className="border border-rule bg-surface overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-paper-soft border-b border-rule">
                <tr className="text-left text-ink-mute">
                  <Th>Fecha</Th>
                  <Th>Usuario</Th>
                  <Th>Rol</Th>
                  <Th>Operación</Th>
                  <Th>Entidad</Th>
                  <Th>Descripción</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-rule">
                {entries.map((e) => (
                  <tr key={e.id}>
                    <td className="px-4 py-3 font-mono text-[11px] text-ink-soft whitespace-nowrap">
                      {fmtTs(e.timestamp)}
                    </td>
                    <td className="px-4 py-3 text-ink-soft text-[13px]">{e.user_email}</td>
                    <td className="px-4 py-3">
                      <Badge variant={e.user_role === 'admin' ? 'accent' : 'info'}>
                        {ROLE_LABEL[e.user_role] ?? e.user_role}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={opTone(e.operation)}>{OP_LABEL[e.operation]}</Badge>
                    </td>
                    <td className="px-4 py-3 text-ink-soft">{ENT_LABEL[e.entity] ?? e.entity}</td>
                    <td className="px-4 py-3 text-ink">{e.summary}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AppLayout>
  );
}

function Th({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <th
      className={['px-4 py-3 font-mono text-[10px] uppercase tracking-wide font-medium', className].join(' ')}
    >
      {children}
    </th>
  );
}
