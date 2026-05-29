'use client';

import { Suspense, useEffect, useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Reservation } from '@/lib/types';
import {
  IconDot,
  IconX,
  IconChevronLeft,
  IconTrash,
} from '@/components/icons';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'profesor' | 'coordinador' | 'admin';
}

export default function HistorialPage() {
  return (
    <Suspense fallback={<div className="p-8 text-ink-mute font-mono text-sm uppercase">Cargando…</div>}>
      <HistorialContent />
    </Suspense>
  );
}

function HistorialContent() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [searchText, setSearchText] = useState('');
  const [selected, setSelected] = useState<string[]>([]);
  const [deletingMultiple, setDeletingMultiple] = useState(false);

  // Cargar usuario actual y reservas
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const meRes = await fetch('/api/auth/me', { credentials: 'include' });
        const me = meRes.ok ? (await meRes.json()).user : null;
        setUser(me);

        // Solo admin puede ver el historial
        if (me?.role !== 'admin') {
          return;
        }

        // Cargar todas las reservas
        const res = await fetch('/api/reservations', { credentials: 'include' });
        if (res.ok) {
          setReservations(await res.json());
        }
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Filtrar reservas
  const filtered = reservations.filter((r) => {
    let matches = true;

    if (filterStatus && r.status !== filterStatus) {
      matches = false;
    }

    if (searchText && matches) {
      const search = searchText.toLowerCase();
      const professorName = (r as any).professorName || r.professor_name || '';
      matches =
        r.room?.code?.toLowerCase().includes(search) ||
        professorName.toLowerCase().includes(search) ||
        r.subject?.toLowerCase().includes(search);
    }

    return matches;
  });

  const handleDelete = async (reservationId: string) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar esta reserva del historial?')) {
      return;
    }

    try {
      setDeleting(reservationId);
      const res = await fetch(`/api/admin/reservations/${reservationId}/delete`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });

      if (res.ok) {
        setReservations((prev) => prev.filter((r) => r.id !== reservationId));
      } else {
        alert('Error al eliminar la reserva');
      }
    } finally {
      setDeleting(null);
    }
  };

  const handleDeleteMultiple = async () => {
    if (selected.length === 0) {
      return;
    }

    if (!window.confirm(`¿Estás seguro de que quieres eliminar ${selected.length} reserva${selected.length !== 1 ? 's' : ''} del historial?`)) {
      return;
    }

    try {
      setDeletingMultiple(true);
      const deletePromises = selected.map((id) =>
        fetch(`/api/admin/reservations/${id}/delete`, {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({}),
        })
      );

      const results = await Promise.all(deletePromises);
      const allSuccess = results.every((res) => res.ok);

      if (allSuccess) {
        setReservations((prev) => prev.filter((r) => !selected.includes(r.id)));
        setSelected([]);
      } else {
        alert('Error al eliminar algunas reservas');
      }
    } finally {
      setDeletingMultiple(false);
    }
  };

  if (!user || user.role !== 'admin') {
    return (
      <AppLayout role={user?.role || 'profesor'} userName={user?.name}>
        <div className="max-w-3xl mx-auto p-8">
          <EmptyState
            title="Acceso denegado"
            description="Solo administradores pueden acceder a esta sección."
          />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout role={user?.role || 'profesor'} userName={user?.name}>
      <div className="max-w-6xl mx-auto">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wide text-ink-soft hover:text-ink transition-colors mb-8"
        >
          <IconChevronLeft size={14} />
          Volver
        </button>

        <header className="mb-10 animate-rise">
          <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-wide text-ink-mute mb-3">
            <IconDot size={6} className="text-warn" />
            <span>Administración · Historial</span>
          </div>
          <h1 className="font-display text-5xl md:text-6xl leading-[0.95] text-ink">
            Historial de
            <span className="italic text-warn"> reservas</span>
          </h1>
        </header>

        {/* Controles de filtrado */}
        <div className="mb-8 p-6 bg-paper-soft border border-rule rounded space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block font-mono text-[10px] uppercase tracking-wide text-ink-soft mb-2">
                Buscar
              </label>
              <input
                type="text"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                placeholder="Salón, profesor, materia…"
                className="field text-sm w-full"
              />
            </div>

            <div>
              <label className="block font-mono text-[10px] uppercase tracking-wide text-ink-soft mb-2">
                Estado
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="field text-sm w-full"
              >
                <option value="">Todos los estados</option>
                <option value="confirmada">Confirmadas</option>
                <option value="pendiente">Pendientes</option>
                <option value="cancelada">Canceladas</option>
                <option value="rechazada">Rechazadas</option>
              </select>
            </div>
          </div>
        </div>

        {/* Lista de reservas */}
        {loading ? (
          <div className="text-center py-12">
            <div className="text-ink-mute font-mono text-sm uppercase">Cargando…</div>
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            title="Sin registros"
            description={searchText || filterStatus ? 'No hay reservas que coincidan con los filtros.' : 'No hay reservas en el historial.'}
          />
        ) : (
          <div className="space-y-3 overflow-x-auto">
            {selected.length > 0 && (
              <div className="flex items-center gap-3 p-4 bg-warn/10 border border-warn/30 rounded">
                <span className="font-mono text-[11px] uppercase tracking-wide text-warn">
                  {selected.length} reserva{selected.length !== 1 ? 's' : ''} seleccionada{selected.length !== 1 ? 's' : ''}
                </span>
                <button
                  onClick={handleDeleteMultiple}
                  disabled={deletingMultiple}
                  className="ml-auto inline-flex items-center gap-1.5 px-3 py-2 text-xs font-mono uppercase tracking-wide text-warn hover:text-warn-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <IconTrash size={14} />
                  {deletingMultiple ? 'Eliminando...' : 'Eliminar seleccionadas'}
                </button>
              </div>
            )}
            <div className="flex items-center gap-2 mb-4 font-mono text-[11px] uppercase tracking-wide text-ink-soft">
              <span>{filtered.length} reserva{filtered.length !== 1 ? 's' : ''}</span>
            </div>

            <div className="border border-rule rounded overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-rule bg-paper-soft">
                    <th className="text-center px-4 py-3 font-mono text-[10px] uppercase tracking-wide text-ink-soft w-12">
                      <input
                        type="checkbox"
                        checked={filtered.length > 0 && selected.length === filtered.length}
                        onChange={() => {
                          if (selected.length === filtered.length && filtered.length > 0) {
                            setSelected([]);
                          } else {
                            setSelected(filtered.map((r) => r.id));
                          }
                        }}
                        className="w-4 h-4 cursor-pointer"
                        title={filtered.length > 0 && selected.length === filtered.length ? 'Deseleccionar todo' : 'Seleccionar todo'}
                      />
                    </th>
                    <th className="text-left px-4 py-3 font-mono text-[10px] uppercase tracking-wide text-ink-soft">
                      Profesor
                    </th>
                    <th className="text-left px-4 py-3 font-mono text-[10px] uppercase tracking-wide text-ink-soft">
                      Materia
                    </th>
                    <th className="text-left px-4 py-3 font-mono text-[10px] uppercase tracking-wide text-ink-soft">
                      Salón
                    </th>
                    <th className="text-left px-4 py-3 font-mono text-[10px] uppercase tracking-wide text-ink-soft">
                      Fecha
                    </th>
                    <th className="text-left px-4 py-3 font-mono text-[10px] uppercase tracking-wide text-ink-soft">
                      Estado
                    </th>
                    <th className="text-center px-4 py-3 font-mono text-[10px] uppercase tracking-wide text-ink-soft">
                      Acción
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((r) => (
                    <tr key={r.id} className="border-b border-rule hover:bg-paper-soft transition-colors">
                      <td className="text-center px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selected.includes(r.id)}
                          onChange={() => {
                            if (selected.includes(r.id)) {
                              setSelected(selected.filter((id) => id !== r.id));
                            } else {
                              setSelected([...selected, r.id]);
                            }
                          }}
                          className="w-4 h-4 cursor-pointer"
                          title="Seleccionar esta reserva"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-ink">{((r as any).professorName || r.professor_name || 'Desconocido')}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-ink-mute">{r.subject}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-ink-mute">{r.room?.code || 'N/A'}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-ink-mute font-mono text-xs">
                          {new Date(r.reservation_date).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          variant={
                            r.status === 'confirmada'
                              ? 'success'
                              : r.status === 'pendiente'
                              ? 'info'
                              : r.status === 'cancelada'
                              ? 'default'
                              : 'warning'
                          }
                        >
                          {r.status === 'confirmada'
                            ? 'Confirmada'
                            : r.status === 'pendiente'
                            ? 'Pendiente'
                            : r.status === 'cancelada'
                            ? 'Cancelada'
                            : 'Rechazada'}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => handleDelete(r.id)}
                          disabled={deleting === r.id}
                          className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-mono uppercase tracking-wide text-warn hover:text-warn-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Eliminar del historial"
                        >
                          <IconTrash size={14} />
                          {deleting === r.id ? 'Eliminando…' : 'Eliminar'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
