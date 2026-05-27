'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AppLayout } from '@/components/layout/AppLayout';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import {
  IconDot,
  IconCheck,
  IconAlert,
  IconTrash,
  IconCalendar,
  IconClock,
  IconColumns,
  IconArrowRight,
} from '@/components/icons';

interface Reservation {
  id: string;
  room_id: string;
  slot_id: string;
  professor_id: string;
  reservation_date: string;
  subject: string;
  group_name: string;
  professor_name?: string;
  status: 'confirmada' | 'cancelada';
  created_at: string;
  cancellation_reason?: string | null;
  room?: { code: string; block_id: string };
  slot?: { name: string; start_time: string; end_time: string };
  block?: { code: string; name: string };
  professor?: { name: string; email: string };
}

interface User {
  id: string;
  name: string;
  email: string;
  role: 'profesor' | 'coordinador' | 'admin';
}

export default function MyReservationsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-ink-mute font-mono text-sm uppercase">Cargando…</div>}>
      <MyReservationsContent />
    </Suspense>
  );
}

function MyReservationsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selected, setSelected] = useState<Reservation | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [canceling, setCanceling] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [filter, setFilter] = useState<'all' | 'confirmada' | 'cancelada'>('confirmada');

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const meRes = await fetch('/api/auth/me', { credentials: 'include' });
        const me = meRes.ok ? (await meRes.json()).user : null;
        setUser(me);
        
        // Cargar solo las reservas del usuario (mis reservas)
        const res = await fetch('/api/reservations/my');
        if (res.ok) setReservations(await res.json());
        
        if (searchParams.get('success')) {
          setSuccessMessage('Reserva creada con éxito.');
          setTimeout(() => setSuccessMessage(''), 4000);
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [searchParams]);

  const canCancel = (r: Reservation) => {
    if (r.status !== 'confirmada') return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const d = new Date(r.reservation_date);
    d.setHours(0, 0, 0, 0);
    return d > today;
  };

  const handleConfirmCancel = async () => {
    if (!selected) return;

    setCanceling(true);
    try {
      const res = await fetch(`/api/reservations/${selected.id}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: undefined }),
      });
      if (res.ok) {
        setReservations((prev) =>
          prev.map((r) =>
            r.id === selected.id
              ? { ...r, status: 'cancelada' as const }
              : r,
          ),
        );
        setShowCancelModal(false);
        setSelected(null);
        setSuccessMessage('Reserva cancelada.');
        setTimeout(() => setSuccessMessage(''), 4000);
      } else if (res.status === 409) {
        alert('No se pueden cancelar reservas del día actual o pasadas.');
      } else {
        alert('Error al cancelar la reserva.');
      }
    } finally {
      setCanceling(false);
    }
  };

  const filtered = reservations.filter((r) => (filter === 'all' ? true : r.status === filter));

  const fmtDate = (s: string) =>
    new Date(s).toLocaleDateString('es-CO', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });

  return (
    <AppLayout role={user?.role || 'profesor'} userName={user?.name} showSeedBanner>
      <div className="max-w-6xl mx-auto">
        <header className="mb-10 animate-rise">
          <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-wide text-ink-mute mb-3">
            <IconDot size={6} className="text-accent" />
            <span>Tu agenda académica</span>
          </div>
          <h1 className="font-display text-5xl md:text-6xl leading-[0.95] text-ink">
            Mis
            <span className="italic text-accent"> reservas</span>
          </h1>
        </header>

        {successMessage ? (
          <div className="mb-6 px-4 py-3 border-l-2 border-ok bg-ok-bg/60 text-ok text-sm inline-flex items-center gap-2.5">
            <IconCheck size={16} />
            {successMessage}
          </div>
        ) : null}

        {/* Filter chips */}
        <div className="border-y border-rule py-3 mb-8 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-1">
            {(['confirmada', 'cancelada', 'all'] as const).map((f) => {
              const active = filter === f;
              const label = f === 'all' ? 'Todas' : f === 'confirmada' ? 'Confirmadas' : 'Canceladas';
              const count =
                f === 'all'
                  ? reservations.length
                  : reservations.filter((r) => r.status === f).length;
              return (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={[
                    'inline-flex items-baseline gap-2 px-3 py-2 border transition-colors text-sm',
                    active
                      ? 'bg-brand text-paper border-brand'
                      : 'bg-transparent text-ink-soft border-rule hover:border-ink hover:text-ink',
                  ].join(' ')}
                >
                  <span className="font-mono text-[11px] uppercase tracking-wide">{label}</span>
                  <span
                    className={[
                      'font-mono text-[10px]',
                      active ? 'text-paper/70' : 'text-ink-mute',
                    ].join(' ')}
                  >
                    {String(count).padStart(2, '0')}
                  </span>
                </button>
              );
            })}
          </div>
          <button
            onClick={() => router.push('/blocks')}
            className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wide text-ink-soft hover:text-ink transition-colors"
          >
            Nueva reserva
            <IconArrowRight size={14} />
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12 font-mono text-sm uppercase tracking-wide text-ink-mute">
            Cargando reservas…
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            eyebrow={filter === 'cancelada' ? 'Sin canceladas' : 'Sin reservas'}
            title="No tienes reservas aún"
            description="Explora la disponibilidad por bloque para registrar tu primera reserva."
            action={{ label: 'Ir a bloques', onClick: () => router.push('/blocks') }}
          />
        ) : (
          <ul className="divide-y divide-rule border-y border-rule">
            {filtered.map((r) => (
              <li
                key={r.id}
                className={[
                  'py-5 group',
                  r.status === 'cancelada' ? 'opacity-60' : '',
                ].join(' ')}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="font-mono text-[11px] uppercase tracking-wide text-ink-mute">
                        {r.room?.code ?? '—'}
                      </span>
                      <Badge variant={r.status === 'confirmada' ? 'success' : 'default'}>
                        {r.status === 'confirmada' ? 'Confirmada' : 'Cancelada'}
                      </Badge>
                    </div>
                    <h3 className="font-display text-2xl text-ink leading-tight mt-1.5">
                      {r.subject}
                    </h3>
                    <div className="mt-2 text-sm text-ink-soft flex flex-wrap items-center gap-x-5 gap-y-1">
                      <span className="inline-flex items-center gap-1.5">
                        <IconColumns size={14} />
                        {r.room?.code ?? '—'}
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <IconClock size={14} />
                        {r.slot?.name ?? '—'}
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <IconCalendar size={14} />
                        <span className="capitalize">{fmtDate(r.reservation_date)}</span>
                      </span>
                      <span className="font-mono text-[12px] text-ink-mute">
                        Grupo: {r.group_name}
                      </span>
                      {r.professor_name ? (
                        <span className="inline-block px-2 py-1 bg-accent/20 border border-accent/40 rounded text-[11px] font-mono uppercase tracking-wide text-accent">
                          @{r.professor_name}
                        </span>
                      ) : null}
                    </div>
                    {r.status === 'cancelada' && r.cancellation_reason ? (
                      <div className="mt-3 text-sm text-ink-soft italic border-l-2 border-rule pl-3">
                        {r.cancellation_reason}
                      </div>
                    ) : null}
                  </div>

                  {canCancel(r) ? (
                    <button
                      onClick={() => {
                        setSelected(r);
                        setCancelReason('');
                        setShowCancelModal(true);
                      }}
                      className="text-ink-mute hover:text-bad transition-colors p-2"
                      aria-label="Cancelar reserva"
                    >
                      <IconTrash size={18} />
                    </button>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        )}

        {/* Cancel modal */}
        <Modal
          isOpen={showCancelModal}
          onClose={() => setShowCancelModal(false)}
          title="Cancelar reserva"
          eyebrow="Acción irreversible"
          actions={[
            {
              label: canceling ? 'Cancelando…' : 'Cancelar reserva',
              variant: 'danger',
              onClick: handleConfirmCancel,
              isLoading: canceling,
            },
          ]}
        >
          {selected ? (
            <div className="space-y-4">
              <div className="border border-rule bg-paper-soft/60 p-4">
                <div className="font-mono text-[10px] uppercase tracking-wide text-ink-mute mb-1">
                  Reserva
                </div>
                <div className="font-display text-lg text-ink">{selected.subject}</div>
                <div className="mt-2 text-sm text-ink-soft space-y-1">
                  <div>Salón: <span className="text-ink">{selected.room?.code}</span></div>
                  <div>Franja: <span className="text-ink">{selected.slot?.name}</span></div>
                  <div>Fecha: <span className="text-ink capitalize">{fmtDate(selected.reservation_date)}</span></div>
                </div>
              </div>

              <div className="flex items-start gap-2 text-warn text-sm">
                <IconAlert size={16} className="mt-0.5 flex-shrink-0" />
                <span>Una vez cancelada, la franja quedará libre para otro docente.</span>
              </div>
            </div>
          ) : null}
        </Modal>
      </div>
    </AppLayout>
  );
}
