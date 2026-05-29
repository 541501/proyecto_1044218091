'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useToast } from '@/components/ui/Toast';
import { IconDot, IconCheck, IconAlert, IconLoader } from '@/components/icons';

interface ReservationRequest {
  id: string;
  room: {
    code: string;
    block_id: string;
  };
  slot: {
    name: string;
    start_time: string;
  };
  professor: {
    name: string;
  };
  reservation_date: string;
  subject: string;
  group_name: string;
  reason: string;
  created_at: string;
  status: string;
}

export default function RequestsPage() {
  return (
    <Suspense fallback={<div className="p-8">Cargando…</div>}>
      <RequestsContent />
    </Suspense>
  );
}

function RequestsContent() {
  const router = useRouter();
  const { addToast } = useToast();
  const [requests, setRequests] = useState<ReservationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState<{ [key: string]: string }>({});
  const [showRejectModal, setShowRejectModal] = useState<string | null>(null);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        console.log('[RequestsContent] Fetching pending requests...');
        const res = await fetch('/api/admin/reservations/pending', {
          credentials: 'include',
        });

        if (!res.ok) {
          console.error('[RequestsContent] Fetch failed:', res.status);
          if (res.status === 401 || res.status === 403) {
            router.push('/login');
          }
          return;
        }

        const data = await res.json();
        setRequests(data || []);
        console.log('[RequestsContent] Loaded', data.length, 'pending requests');
      } catch (error) {
        console.error('[RequestsContent] Error:', error);
        addToast('Error al cargar solicitudes', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, [router, addToast]);

  const handleApprove = async (requestId: string) => {
    setProcessingId(requestId);
    try {
      console.log('[RequestsContent] Approving request:', requestId);
      const res = await fetch(`/api/admin/reservations/${requestId}/approve`, {
        method: 'PUT',
        credentials: 'include',
      });

      if (!res.ok) {
        const err = await res.json();
        addToast(err.error || 'Error al aprobar solicitud', 'error');
        return;
      }

      addToast('Solicitud aprobada exitosamente', 'success');
      setRequests(requests.filter((r) => r.id !== requestId));
    } catch (error) {
      console.error('[RequestsContent] Approve error:', error);
      addToast('Error al aprobar solicitud', 'error');
    } finally {
      setProcessingId(null);
    }
  };

  const handleRejectSubmit = async (requestId: string) => {
    const reason = rejectReason[requestId];
    if (!reason?.trim()) {
      addToast('Ingresa una razón para rechazar', 'error');
      return;
    }

    setProcessingId(requestId);
    try {
      console.log('[RequestsContent] Rejecting request:', requestId);
      const res = await fetch(`/api/admin/reservations/${requestId}/reject`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ reason }),
      });

      if (!res.ok) {
        const err = await res.json();
        addToast(err.error || 'Error al rechazar solicitud', 'error');
        return;
      }

      addToast('Solicitud rechazada', 'success');
      setRequests(requests.filter((r) => r.id !== requestId));
      setShowRejectModal(null);
      setRejectReason({ ...rejectReason, [requestId]: '' });
    } catch (error) {
      console.error('[RequestsContent] Reject error:', error);
      addToast('Error al rechazar solicitud', 'error');
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <AppLayout role="admin" userName="Admin">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="mb-10 animate-rise">
          <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-wide text-ink-mute mb-3">
            <IconDot size={6} className="text-accent" />
            <span>Solicitudes de reserva</span>
          </div>
          <h1 className="font-display text-5xl md:text-6xl leading-[0.95] text-ink">
            Solicitudes
            <span className="italic text-accent"> pendientes</span>
          </h1>
        </header>

        {/* Loading */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-6 w-6 rounded-full border-2 border-brand border-t-transparent animate-spin" />
          </div>
        ) : requests.length === 0 ? (
          <div className="text-center py-12 text-ink-mute">
            <p className="font-mono text-sm mb-2">No hay solicitudes pendientes</p>
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map((req) => (
              <div
                key={req.id}
                className="border border-rule p-5 hover:bg-paper-soft transition-colors"
              >
                {/* Request header */}
                <div className="grid sm:grid-cols-4 gap-4 mb-4">
                  <div>
                    <div className="font-mono text-[10px] uppercase tracking-wide text-ink-mute mb-1">
                      Profesor
                    </div>
                    <p className="font-semibold text-ink">{req.professor.name}</p>
                  </div>
                  <div>
                    <div className="font-mono text-[10px] uppercase tracking-wide text-ink-mute mb-1">
                      Bloque
                    </div>
                    <p className="font-semibold text-ink">{req.room.block_id}</p>
                  </div>
                  <div>
                    <div className="font-mono text-[10px] uppercase tracking-wide text-ink-mute mb-1">
                      Salón
                    </div>
                    <p className="font-semibold text-ink">{req.room.code}</p>
                  </div>
                  <div>
                    <div className="font-mono text-[10px] uppercase tracking-wide text-ink-mute mb-1">
                      Hora
                    </div>
                    <p className="font-semibold text-ink">{req.slot.name}</p>
                  </div>
                </div>

                {/* Request details */}
                <div className="grid sm:grid-cols-2 gap-4 mb-4 py-4 border-t border-rule">
                  <div>
                    <div className="font-mono text-[10px] uppercase tracking-wide text-ink-mute mb-1">
                      Asignatura
                    </div>
                    <p className="text-ink">{req.subject}</p>
                  </div>
                  <div>
                    <div className="font-mono text-[10px] uppercase tracking-wide text-ink-mute mb-1">
                      Grupo
                    </div>
                    <p className="text-ink">{req.group_name}</p>
                  </div>
                  <div>
                    <div className="font-mono text-[10px] uppercase tracking-wide text-ink-mute mb-1">
                      Fecha
                    </div>
                    <p className="text-ink">{req.reservation_date}</p>
                  </div>
                  <div>
                    <div className="font-mono text-[10px] uppercase tracking-wide text-ink-mute mb-1">
                      Solicitado
                    </div>
                    <p className="text-ink text-sm">{new Date(req.created_at).toLocaleString()}</p>
                  </div>
                </div>

                {/* Reason */}
                {req.reason && (
                  <div className="mb-4 p-3 bg-accent-soft border border-accent rounded">
                    <div className="font-mono text-[10px] uppercase tracking-wide text-ink-mute mb-1">
                      Razón
                    </div>
                    <p className="text-ink text-sm italic">{req.reason}</p>
                  </div>
                )}

                {/* Action buttons */}
                <div className="flex gap-2 items-start">
                  {/* Approve button */}
                  <button
                    onClick={() => handleApprove(req.id)}
                    disabled={processingId === req.id}
                    className="px-3 py-2 bg-ok text-paper border border-ok hover:bg-ok-bg transition-colors font-mono text-xs uppercase tracking-wide flex items-center gap-1 disabled:opacity-50"
                  >
                    {processingId === req.id ? (
                      <>
                        <IconLoader size={14} className="animate-spin" />
                        Procesando…
                      </>
                    ) : (
                      <>
                        <IconCheck size={14} />
                        Aprobar
                      </>
                    )}
                  </button>

                  {/* Reject button */}
                  <button
                    onClick={() => setShowRejectModal(req.id)}
                    disabled={processingId === req.id}
                    className="px-3 py-2 bg-rule text-ink border border-rule hover:bg-paper transition-colors font-mono text-xs uppercase tracking-wide disabled:opacity-50"
                  >
                    Rechazar
                  </button>
                </div>

                {/* Reject reason modal */}
                {showRejectModal === req.id && (
                  <div className="mt-4 p-4 border-t border-rule pt-4">
                    <div className="mb-3">
                      <label className="block font-mono text-[10px] uppercase tracking-wide text-ink-mute mb-2">
                        Razón de rechazo
                      </label>
                      <textarea
                        value={rejectReason[req.id] || ''}
                        onChange={(e) =>
                          setRejectReason({ ...rejectReason, [req.id]: e.target.value })
                        }
                        placeholder="Explica por qué se rechaza esta solicitud..."
                        className="w-full p-2 border border-rule bg-paper text-ink font-mono text-sm focus:outline-none focus:border-brand resize-none"
                        rows={3}
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleRejectSubmit(req.id)}
                        disabled={processingId === req.id}
                        className="px-3 py-2 bg-ink text-paper border border-ink hover:bg-ink-soft transition-colors font-mono text-xs uppercase tracking-wide disabled:opacity-50"
                      >
                        {processingId === req.id ? 'Procesando…' : 'Confirmar rechazo'}
                      </button>
                      <button
                        onClick={() => {
                          setShowRejectModal(null);
                          setRejectReason({ ...rejectReason, [req.id]: '' });
                        }}
                        className="px-3 py-2 bg-paper text-ink border border-rule hover:bg-paper-soft transition-colors font-mono text-xs uppercase tracking-wide"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
