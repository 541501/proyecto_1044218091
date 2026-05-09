'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppLayout } from '@/components/layout/AppLayout';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface AuditEntry {
  id: string;
  timestamp: string;
  user_id: string;
  user_email: string;
  user_role: 'profesor' | 'coordinador' | 'admin';
  action: string;
  entity: string;
  entity_id?: string;
  summary: string;
  metadata?: Record<string, unknown>;
}

export default function AdminAuditPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [month, setMonth] = useState('');
  const [auditEntries, setAuditEntries] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Initialize with current month
  useEffect(() => {
    const now = new Date();
    const yyyymm = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`;
    setMonth(yyyymm);
  }, []);

  // Load user
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

  // Load audit data when month changes
  useEffect(() => {
    if (!month) return;

    const loadAudit = async () => {
      setLoading(true);
      setError('');
      setAuditEntries([]);

      try {
        const response = await fetch(`/api/audit?month=${month}`);

        if (response.ok) {
          const data = await response.json();
          setAuditEntries(data);
        } else if (response.status === 404) {
          setAuditEntries([]);
        } else {
          const errorData = await response.json();
          setError(errorData.error || 'Error al cargar la auditoría');
        }
      } catch (err: any) {
        setError('Error al cargar la auditoría: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    loadAudit();
  }, [month]);

  const handlePrevMonth = () => {
    const [year, monthStr] = [month.substring(0, 4), month.substring(4)];
    let newMonth = parseInt(monthStr) - 1;
    let newYear = parseInt(year);

    if (newMonth < 1) {
      newMonth = 12;
      newYear -= 1;
    }

    setMonth(`${newYear}${String(newMonth).padStart(2, '0')}`);
  };

  const handleNextMonth = () => {
    const [year, monthStr] = [month.substring(0, 4), month.substring(4)];
    let newMonth = parseInt(monthStr) + 1;
    let newYear = parseInt(year);

    if (newMonth > 12) {
      newMonth = 1;
      newYear += 1;
    }

    setMonth(`${newYear}${String(newMonth).padStart(2, '0')}`);
  };

  const formatMonth = (yyyymm: string) => {
    const year = yyyymm.substring(0, 4);
    const monthNum = parseInt(yyyymm.substring(4));
    const date = new Date(parseInt(year), monthNum - 1);

    return date.toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'long'
    });
  };

  const formatTimestamp = (iso: string) => {
    return new Date(iso).toLocaleString('es-CO', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getActionLabel = (action: string) => {
    const labels: any = {
      create_reservation: 'Crear Reserva',
      cancel_reservation: 'Cancelar Reserva',
      create_user: 'Crear Usuario',
      toggle_user: 'Cambiar Estado Usuario',
      create_room: 'Crear Salón',
      update_room: 'Actualizar Salón',
      deactivate_room: 'Desactivar Salón',
      login: 'Iniciar Sesión',
      logout: 'Cerrar Sesión',
      bootstrap: 'Bootstrap del Sistema'
    };
    return labels[action] || action;
  };

  const getRoleLabel = (role: string) => {
    const labels: any = {
      profesor: 'Profesor',
      coordinador: 'Coordinador',
      admin: 'Administrador'
    };
    return labels[role] || role;
  };

  return (
    <AppLayout role={user?.role} userName={user?.name} showSeedBanner>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Auditoría del Sistema</h1>
          <p className="text-slate-600">
            Registro de todas las operaciones realizadas en ClassSport
          </p>
        </div>

        {/* Month Navigation */}
        <div className="bg-white border border-slate-200 rounded-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <button
              onClick={handlePrevMonth}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              title="Mes anterior"
            >
              <ChevronLeft size={24} className="text-slate-600" />
            </button>

            <div className="text-center">
              <h2 className="text-lg font-semibold text-slate-900 capitalize">
                {formatMonth(month)}
              </h2>
              <p className="text-sm text-slate-600 mt-1">
                {auditEntries.length} eventos registrados
              </p>
            </div>

            <button
              onClick={handleNextMonth}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              title="Mes siguiente"
            >
              <ChevronRight size={24} className="text-slate-600" />
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-300 rounded-lg text-red-900">
            {error}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="text-center py-12">
            <div className="text-slate-600">Cargando auditoría...</div>
          </div>
        )}

        {/* Audit Table */}
        {!loading && auditEntries.length > 0 && (
          <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">
                      Fecha y Hora
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">
                      Usuario
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">
                      Rol
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">
                      Acción
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">
                      Descripción
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {auditEntries.map((entry) => (
                    <tr key={entry.id} className="border-b border-slate-200 hover:bg-slate-50">
                      <td className="px-4 py-3 text-sm text-slate-600 whitespace-nowrap">
                        {formatTimestamp(entry.timestamp)}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-900">
                        {entry.user_email}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span className="inline-block px-2 py-1 rounded text-xs font-semibold bg-blue-100 text-blue-900">
                          {getRoleLabel(entry.user_role)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm font-semibold text-slate-900">
                        {getActionLabel(entry.action)}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-700">
                        {entry.summary}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Empty State */}
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
