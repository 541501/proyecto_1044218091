'use client';

import { Suspense } from 'react';
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/Button';
import { Trash2 } from 'lucide-react';

interface Reservation {
  id: string;
  room_id: string;
  slot_id: string;
  professor_id: string;
  reservation_date: string;
  subject: string;
  group_name: string;
  status: 'confirmada' | 'cancelada';
  created_at: string;
  room?: { code: string; block_id: string };
  slot?: { name: string; start_time: string; end_time: string };
  block?: { code: string; name: string };
}

interface User {
  id: string;
  name: string;
  email: string;
  role: 'profesor' | 'coordinador' | 'admin';
  is_active: boolean;
  must_change_password: boolean;
}

export default function ReservationsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [canceling, setCanceling] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [filter, setFilter] = useState<'all' | 'confirmada' | 'cancelada'>('confirmada');

  const isAdmin = user?.role === 'admin' || user?.role === 'coordinador';

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        // Get user info
        const meRes = await fetch('/api/auth/me');
        if (meRes.ok) {
          const userData = await meRes.json();
          setUser(userData.user);
        }

        // Get reservations
        const endpoint = isAdmin ? '/api/reservations' : '/api/reservations/my';
        const res = await fetch(endpoint);
        if (res.ok) {
          const data = await res.json();
          setReservations(data);
        }

        // Show success message if coming from new reservation
        if (searchParams.get('success')) {
          setSuccessMessage('¡Reserva creada exitosamente!');
          setTimeout(() => setSuccessMessage(''), 5000);
        }
      } catch (error) {
        console.error('Error loading reservations:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [isAdmin, searchParams]);

  const canCancelReservation = (reservation: Reservation): boolean => {
    if (reservation.status !== 'confirmada') return false;
    if (isAdmin) return true;

    // For professor: only future reservations
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const resDate = new Date(reservation.reservation_date);
    resDate.setHours(0, 0, 0, 0);

    return resDate > today;
  };

  const handleCancelClick = (reservation: Reservation) => {
    setSelectedReservation(reservation);
    setCancelReason('');
    setShowCancelModal(true);
  };

  const handleConfirmCancel = async () => {
    if (!selectedReservation) return;

    // For admin/coordinador, reason is required
    if (isAdmin && !cancelReason.trim()) {
      alert('Debes proporcionar un motivo de cancelación');
      return;
    }

    setCanceling(true);

    try {
      const res = await fetch(`/api/reservations/${selectedReservation.id}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reason: cancelReason || undefined
        })
      });

      if (res.ok) {
        // Update local state
        setReservations(
          reservations.map((r: Reservation) =>
            r.id === selectedReservation.id
              ? { ...r, status: 'cancelada' as const }
              : r
          )
        );
        setShowCancelModal(false);
        setSelectedReservation(null);
        setSuccessMessage('Reserva cancelada exitosamente');
        setTimeout(() => setSuccessMessage(''), 5000);
      } else if (res.status === 403) {
        alert('No tienes permiso para cancelar esta reserva');
      } else if (res.status === 409) {
        alert('No se pueden cancelar reservas del día actual o del pasado');
      } else {
        alert('Error al cancelar la reserva');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al procesar la solicitud');
    } finally {
      setCanceling(false);
    }
  };

  const filteredReservations = reservations.filter((r: Reservation) => {
    if (filter === 'all') return true;
    return r.status === filter;
  });

  const getStatusBadgeColor = (status: string) => {
    return status === 'confirmada'
      ? 'bg-green-100 text-green-900'
      : 'bg-slate-100 text-slate-900';
  };

  const getStatusText = (status: string) => {
    return status === 'confirmada' ? 'Confirmada' : 'Cancelada';
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('es-CO', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <AppLayout role={user?.role || 'profesor'} userName={user?.name} showSeedBanner>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            {isAdmin ? 'Todas las Reservas' : 'Mis Reservas'}
          </h1>
          <p className="text-slate-600">
            {isAdmin
              ? 'Gestiona todas las reservas del sistema'
              : 'Visualiza y gestiona tus reservas'}
          </p>
        </div>

        {/* Success message */}
        {successMessage && (
          <div className="mb-6 p-4 bg-green-50 border border-green-300 rounded-lg text-green-900">
            ✓ {successMessage}
          </div>
        )}

        {/* Filter tabs */}
        <div className="mb-6 flex gap-2">
          <button
            onClick={() => setFilter('confirmada')}
            className={`px-4 py-2 rounded-lg border transition-all ${
              filter === 'confirmada'
                ? 'bg-green-600 text-white border-green-600'
                : 'bg-white text-slate-900 border-slate-200'
            }`}
          >
            Confirmadas
          </button>
          <button
            onClick={() => setFilter('cancelada')}
            className={`px-4 py-2 rounded-lg border transition-all ${
              filter === 'cancelada'
                ? 'bg-slate-600 text-white border-slate-600'
                : 'bg-white text-slate-900 border-slate-200'
            }`}
          >
            Canceladas
          </button>
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg border transition-all ${
              filter === 'all'
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-slate-900 border-slate-200'
            }`}
          >
            Todas
          </button>
        </div>

        {/* Reservations list */}
        {loading ? (
          <div className="text-center py-12">
            <div className="text-slate-600">Cargando reservas...</div>
          </div>
        ) : filteredReservations.length === 0 ? (
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-8 text-center">
            <div className="text-slate-600 mb-4">
              {isAdmin ? (
                filter === 'confirmada'
                  ? 'No hay reservas confirmadas para los filtros seleccionados. Prueba con otro rango de fechas o bloque.'
                  : filter === 'cancelada'
                  ? 'No hay reservas canceladas'
                  : 'No hay reservas registradas'
              ) : (
                'Aún no tienes reservas. Consulta la disponibilidad de los bloques para hacer tu primera reserva.'
              )}
            </div>
            {!isAdmin && filter === 'confirmada' && (
              <Button
                onClick={() => router.push('/blocks')}
                className="mt-4"
              >
                Ir a Bloques
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredReservations.map((reservation: Reservation) => (
              <div
                key={reservation.id}
                className={`bg-white border border-slate-200 rounded-lg p-4 ${
                  reservation.status === 'cancelada' ? 'opacity-60' : ''
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="text-lg font-bold text-slate-900">
                        {reservation.room?.code || '—'}
                      </div>
                      <span
                        className={`px-2 py-1 rounded text-xs font-semibold ${getStatusBadgeColor(
                          reservation.status
                        )}`}
                      >
                        {getStatusText(reservation.status)}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <div className="text-slate-600">Materia</div>
                        <div className="font-semibold text-slate-900">
                          {reservation.subject}
                        </div>
                      </div>
                      <div>
                        <div className="text-slate-600">Grupo</div>
                        <div className="font-semibold text-slate-900">
                          {reservation.group_name}
                        </div>
                      </div>
                      <div>
                        <div className="text-slate-600">Fecha</div>
                        <div className="font-semibold text-slate-900">
                          {formatDate(reservation.reservation_date)}
                        </div>
                      </div>
                      <div>
                        <div className="text-slate-600">Franja</div>
                        <div className="font-semibold text-slate-900">
                          {reservation.slot?.name || '—'}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Cancel button */}
                  {canCancelReservation(reservation) && (
                    <button
                      onClick={() => handleCancelClick(reservation)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded ml-4 transition-colors"
                      title="Cancelar reserva"
                    >
                      <Trash2 size={20} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Cancel modal */}
      {showCancelModal && selectedReservation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">
              Cancelar Reserva
            </h3>

            <div className="mb-4 p-3 bg-slate-50 border border-slate-200 rounded">
              <div className="text-sm text-slate-600">
                <div>
                  <strong>Salón:</strong> {selectedReservation.room?.code}
                </div>
                <div>
                  <strong>Materia:</strong> {selectedReservation.subject}
                </div>
                <div>
                  <strong>Fecha:</strong> {formatDate(selectedReservation.reservation_date)}
                </div>
              </div>
            </div>

            {/* Reason textarea for admin/coordinador */}
            {isAdmin && (
              <div className="mb-4">
                <label className="block text-sm font-semibold text-slate-900 mb-2">
                  Motivo de cancelación *
                </label>
                <textarea
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="Describe el motivo de la cancelación"
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}

            <div className="text-sm text-slate-600 mb-6">
              ¿Está seguro de que desea cancelar esta reserva?
            </div>

            <div className="flex gap-3 justify-end">
              <Button
                variant="secondary"
                onClick={() => setShowCancelModal(false)}
              >
                Mantener
              </Button>
              <Button
                onClick={handleConfirmCancel}
                disabled={canceling || (isAdmin && !cancelReason.trim())}
                className="bg-red-600 hover:bg-red-700"
              >
                {canceling ? 'Cancelando...' : 'Cancelar Reserva'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
