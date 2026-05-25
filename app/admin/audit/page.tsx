'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppLayout } from '@/components/layout/AppLayout';
import { ChevronLeft, ChevronRight } from 'lucide-react';

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
  metadata?: Record<string, unknown> | null;
}

const OPERATION_LABELS: Record<Operation, string> = {
  INSERT: 'Creación',
  UPDATE: 'Actualización',
  DELETE: 'Eliminación',
};

const ENTITY_LABELS: Record<Entity, string> = {
  reservation: 'Reserva',
  room: 'Salón',
  user: 'Usuario',
};

const ROLE_LABELS: Record<string, string> = {
  profesor: 'Profesor',
  coordinador: 'Coordinador',
  admin: 'Administrador',
};

const OPERATION_BADGE: Record<Operation, string> = {
  INSERT: 'bg-green-100 text-green-900',
  UPDATE: 'bg-amber-100 text-amber-900',
  DELETE: 'bg-red-100 text-red-900',
};

export default function AdminAuditPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [month, setMonth] = useState('');
  const [entityFilter, setEntityFilter] = useState<'' | Entity>('');
  const [operationFilter, setOperationFilter] = useState<'' | Operation>('');
  const [auditEntries, setAuditEntries] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const now = new Date();
    const yyyymm = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`;
    setMonth(yyyymm);
  }, []);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const meRes = await fetch('/api/auth/me');
        if (meRes.ok) {
          const userData = await meRes.json();
          setUser(userData.user);
        } else {
          router.push('/login');
        }
      } catch (err) {
        console.error('Error loading user:', err);
      }
    };

    loadUser();
  }, [router]);

  useEffect(() => {
    if (!month) return;

    const loadAudit = async () => {
      setLoading(true);
      setError('');

      try {
        const params = new URLSearchParams({ month });
        if (entityFilter) params.set('entity', entityFilter);
        if (operationFilter) params.set('operation', operationFilter);
        const response = await fetch(`/api/audit?${params.toString()}`);

        if (response.ok) {
          const data = await response.json();
          setAuditEntries(data);
        } else {
          const errorData = await response.json().catch(() => ({}));
          setError(errorData.error || 'Error al cargar la auditoría');
          setAuditEntries([]);
        }
      } catch (err: any) {
        setError('Error al cargar la auditoría: ' + err.message);
        setAuditEntries([]);
      } finally {
        setLoading(false);
      }
    };

    loadAudit();
  }, [month, entityFilter, operationFilter]);

  const shiftMonth = (delta: number) => {
    const year = parseInt(month.substring(0, 4));
    const m = parseInt(month.substring(4));
    const d = new Date(year, m - 1 + delta, 1);
    setMonth(`${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}`);
  };

  const formatMonth = (yyyymm: string) => {
    const year = yyyymm.substring(0, 4);
    const monthNum = parseInt(yyyymm.substring(4));
    return new Date(parseInt(year), monthNum - 1).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'long',
    });
  };

  const formatTimestamp = (iso: string) =>
    new Date(iso).toLocaleString('es-CO', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });

  return (
    <AppLayout role={user?.role || 'profesor'} userName={user?.name} showSeedBanner>
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Auditoría del Sistema</h1>
          <p className="text-slate-600">
            Operaciones de creación, actualización y eliminación sobre reservas, salones y usuarios.
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-6 mb-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => shiftMonth(-1)}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                title="Mes anterior"
              >
                <ChevronLeft size={24} className="text-slate-600" />
              </button>
              <div className="text-center min-w-[180px]">
                <h2 className="text-lg font-semibold text-slate-900 capitalize">
                  {formatMonth(month)}
                </h2>
                <p className="text-sm text-slate-600 mt-1">
                  {auditEntries.length} eventos
                </p>
              </div>
              <button
                onClick={() => shiftMonth(1)}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                title="Mes siguiente"
              >
                <ChevronRight size={24} className="text-slate-600" />
              </button>
            </div>

            <div className="flex items-center gap-3">
              <select
                value={entityFilter}
                onChange={(e) => setEntityFilter(e.target.value as any)}
                className="px-3 py-2 border border-slate-300 rounded-lg text-sm"
              >
                <option value="">Todas las entidades</option>
                <option value="reservation">Reservas</option>
                <option value="room">Salones</option>
                <option value="user">Usuarios</option>
              </select>
              <select
                value={operationFilter}
                onChange={(e) => setOperationFilter(e.target.value as any)}
                className="px-3 py-2 border border-slate-300 rounded-lg text-sm"
              >
                <option value="">Todas las operaciones</option>
                <option value="INSERT">Creaciones</option>
                <option value="UPDATE">Actualizaciones</option>
                <option value="DELETE">Eliminaciones</option>
              </select>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-300 rounded-lg text-red-900">
            {error}
          </div>
        )}

        {loading && (
          <div className="text-center py-12">
            <div className="text-slate-600">Cargando auditoría...</div>
          </div>
        )}

        {!loading && auditEntries.length > 0 && (
          <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Fecha y Hora</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Usuario</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Rol</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Operación</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Entidad</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Descripción</th>
                  </tr>
                </thead>
                <tbody>
                  {auditEntries.map((entry) => (
                    <tr key={entry.id} className="border-b border-slate-200 hover:bg-slate-50">
                      <td className="px-4 py-3 text-sm text-slate-600 whitespace-nowrap">
                        {formatTimestamp(entry.timestamp)}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-900">{entry.user_email}</td>
                      <td className="px-4 py-3 text-sm">
                        <span className="inline-block px-2 py-1 rounded text-xs font-semibold bg-blue-100 text-blue-900">
                          {ROLE_LABELS[entry.user_role] ?? entry.user_role}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${OPERATION_BADGE[entry.operation]}`}>
                          {OPERATION_LABELS[entry.operation]}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-700">
                        {ENTITY_LABELS[entry.entity] ?? entry.entity}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-700">{entry.summary}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {!loading && auditEntries.length === 0 && !error && (
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-12 text-center">
            <div className="text-slate-600">
              No hay eventos registrados en {formatMonth(month).toLowerCase()}
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
