'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/Button';
import ProfessorTagInput from '@/components/reservations/ProfessorTagInput';
import {
  IconChevronLeft,
  IconAlert,
  IconCheck,
  IconDot,
  IconCalendarPlus,
} from '@/components/icons';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'profesor' | 'coordinador' | 'admin';
}

export default function NewReservationPage() {
  return (
    <Suspense
      fallback={<div className="p-8 text-ink-mute font-mono text-sm uppercase">Cargando…</div>}
    >
      <NewReservationContent />
    </Suspense>
  );
}

function NewReservationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [room, setRoom] = useState<any>(null);
  const [slot, setSlot] = useState<any>(null);
  const [selectedDate] = useState(searchParams.get('date') || '');

  const [subject, setSubject] = useState('');
  const [groupName, setGroupName] = useState('');
  const [reason, setReason] = useState('');
  const [selectedProfessor, setSelectedProfessor] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [conflictError, setConflictError] = useState<{
    roomCode: string;
    slotName: string;
    date: string;
    professorName: string;
    subject: string;
  } | null>(null);
  const [user, setUser] = useState<any>(null);

  const roomId = searchParams.get('roomId');
  const slotId = searchParams.get('slotId');

  useEffect(() => {
    (async () => {
      try {
        const meRes = await fetch('/api/auth/me');
        if (meRes.ok) setUser((await meRes.json()).user ?? null);
        if (roomId) {
          const r = await fetch(`/api/rooms/${roomId}`);
          if (r.ok) setRoom(await r.json());
        }
        if (slotId) {
          const s = await fetch('/api/slots');
          if (s.ok) {
            const slots = await s.json();
            setSlot(slots.find((x: any) => x.id === slotId) ?? null);
          }
        }
      } catch {}
    })();
  }, [roomId, slotId]);

  const isDateInvalid = (() => {
    if (!selectedDate) return false;
    const [year, month, day] = selectedDate.split('-').map(Number);
    const selected = new Date(year, month - 1, day);
    const today = new Date();
    // Set both to midnight for comparison
    today.setHours(0, 0, 0, 0);
    selected.setHours(0, 0, 0, 0);
    console.log('[isDateInvalid] selected:', selected, 'today:', today, 'invalid:', selected < today);
    return selected < today;
  })();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomId || !slotId || !selectedDate) return setError('Faltan datos de la reserva');
    if (!subject.trim() || !groupName.trim()) return setError('Completa todos los campos');
    // La razón es requerida solo para profesores
    if (user?.role === 'profesor' && !reason.trim()) return setError('Completa todos los campos');

    setLoading(true);
    setError('');
    setConflictError(null);

    const payload: any = {
      room_id: roomId,
      slot_id: slotId,
      reservation_date: selectedDate,
      subject: subject.trim(),
      group_name: groupName.trim(),
    };

    // Solo incluir reason si tiene valor
    if (reason.trim()) {
      payload.reason = reason.trim();
    }

    // Solo incluir professor_name y professor_id si hay profesor seleccionado
    if (selectedProfessor?.name) {
      payload.professor_name = selectedProfessor.name;
    }
    if (selectedProfessor?.id) {
      payload.professor_id = selectedProfessor.id;
    }

    console.log('[new-reservation] Submitting payload:', payload);

    try {
      const res = await fetch('/api/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      console.log('[new-reservation] Response status:', res.status);
      
      if (res.status === 201) {
        router.push('/reservations/my?success=true');
      } else if (res.status === 409) {
        const data = await res.json();
        console.log('[new-reservation] Conflict response:', data);
        if (data.conflict) {
          setConflictError(data.conflict);
        } else {
          setError(data.error || 'Conflicto de reserva');
        }
      } else {
        const data = await res.json().catch(() => ({}));
        console.log('[new-reservation] Error response:', data);
        setError(data.error || 'Error al crear la reserva');
      }
    } catch (err) {
      console.error('[new-reservation] Network error:', err);
      setError('Error de red al procesar la solicitud');
    } finally {
      setLoading(false);
    }
  };

  const dateLabel = selectedDate
    ? (() => {
        const [year, month, day] = selectedDate.split('-').map(Number);
        const date = new Date(year, month - 1, day);
        return date.toLocaleDateString('es-CO', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        });
      })()
    : '—';

  return (
    <AppLayout role={user?.role || 'profesor'} userName={user?.name} showSeedBanner>
      <div className="max-w-3xl mx-auto">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wide text-ink-soft hover:text-ink transition-colors mb-8"
        >
          <IconChevronLeft size={14} />
          Volver
        </button>

        <header className="mb-10 animate-rise">
          <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-wide text-ink-mute mb-3">
            <IconDot size={6} className="text-accent" />
            <span>Nueva reserva · Formulario</span>
          </div>
          <h1 className="font-display text-5xl md:text-6xl leading-[0.95] text-ink">
            Confirma tu
            <span className="italic text-accent"> clase</span>.
          </h1>
        </header>

        {/* Conflict block */}
        {conflictError ? (
          <div className="mb-6 border border-bad bg-bad-bg/60 p-6 animate-rise">
            <div className="flex items-start gap-3">
              <IconAlert className="text-bad mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <div className="font-mono text-[11px] uppercase tracking-wide text-bad">
                  Conflicto · 409
                </div>
                <h3 className="font-display text-2xl text-bad mt-1">Salón ya reservado</h3>
                <dl className="mt-4 grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                  <dt className="font-mono text-[10px] uppercase tracking-wide text-bad/70">Salón</dt>
                  <dd className="font-medium text-ink">{conflictError.roomCode}</dd>
                  <dt className="font-mono text-[10px] uppercase tracking-wide text-bad/70">Franja</dt>
                  <dd className="font-medium text-ink">{conflictError.slotName}</dd>
                  <dt className="font-mono text-[10px] uppercase tracking-wide text-bad/70">Fecha</dt>
                  <dd className="font-medium text-ink">
                    {new Date(conflictError.date).toLocaleDateString('es-CO')}
                  </dd>
                  <dt className="font-mono text-[10px] uppercase tracking-wide text-bad/70">Profesor</dt>
                  <dd className="font-medium text-ink">{conflictError.professorName}</dd>
                  <dt className="font-mono text-[10px] uppercase tracking-wide text-bad/70">Materia</dt>
                  <dd className="font-medium text-ink">{conflictError.subject}</dd>
                </dl>
                <div className="mt-5 text-sm text-bad/90">
                  Elige otra franja o un salón distinto para continuar.
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {error ? (
          <div className="mb-6 px-4 py-3 border-l-2 border-bad bg-bad-bg text-bad text-sm inline-flex items-center gap-2.5">
            <IconAlert size={16} />
            <span>{error}</span>
          </div>
        ) : null}

        <div className="grid lg:grid-cols-[1fr_320px] gap-8">
          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-7">
            <div>
              <label className="block font-mono text-[10px] uppercase tracking-wide text-ink-soft mb-2">
                01 · Materia
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Ej. Cálculo I"
                maxLength={150}
                className="field text-lg"
              />
              <div className="font-mono text-[10px] text-ink-mute mt-1.5 text-right">
                {subject.length}/150
              </div>
            </div>

            <div>
              <label className="block font-mono text-[10px] uppercase tracking-wide text-ink-soft mb-2">
                02 · Grupo
              </label>
              <input
                type="text"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                placeholder="Ej. 2026-1 Grupo A"
                maxLength={50}
                className="field text-lg"
              />
              <div className="font-mono text-[10px] text-ink-mute mt-1.5 text-right">
                {groupName.length}/50
              </div>
            </div>

            {user?.role === 'profesor' ? (
              <div>
                <label className="block font-mono text-[10px] uppercase tracking-wide text-ink-soft mb-2">
                  03 · Razón de la solicitud
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Describe por qué necesitas esta reserva (actividades, evaluaciones, etc.)"
                  maxLength={500}
                  className="field text-base resize-none"
                  rows={3}
                />
                <div className="font-mono text-[10px] text-ink-mute mt-1.5 text-right">
                  {reason.length}/500
                </div>
              </div>
            ) : null}

            <div>
              <label className="block font-mono text-[10px] uppercase tracking-wide text-ink-soft mb-2">
                {user?.role === 'profesor' ? '04' : '03'} · Docente (Opcional)
              </label>
              <ProfessorTagInput
                value={selectedProfessor}
                onChange={setSelectedProfessor}
                placeholder="Escribe @ y busca un docente"
              />
            </div>

            {isDateInvalid ? (
              <div className="px-4 py-3 border-l-2 border-warn bg-warn-bg text-warn text-sm inline-flex items-center gap-2.5">
                <IconAlert size={16} />
                <span>No se pueden reservar franjas del día actual o pasadas.</span>
              </div>
            ) : null}

            <div className="flex flex-wrap gap-3 pt-4 border-t border-rule">
              <Button type="button" variant="ghost" onClick={() => router.back()}>
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="primary"
                isLoading={loading}
                disabled={loading || isDateInvalid || !subject.trim() || !groupName.trim() || (user?.role === 'profesor' && !reason.trim())}
              >
                <IconCheck size={14} />
                {user?.role === 'profesor' ? 'Confirmar solicitud' : 'Confirmar reserva'}
              </Button>
            </div>
          </form>

          {/* Summary side */}
          <aside className="border border-rule bg-surface p-5 self-start">
            <div className="font-mono text-[10px] uppercase tracking-wide text-ink-mute mb-3 inline-flex items-center gap-2">
              <IconCalendarPlus size={14} />
              <span>Resumen de la reserva</span>
            </div>
            <dl className="space-y-4">
              <div>
                <dt className="font-mono text-[10px] uppercase tracking-wide text-ink-mute">
                  Salón
                </dt>
                <dd className="font-display text-2xl text-ink mt-0.5">
                  {room?.code ?? '—'}
                </dd>
                {room?.type ? (
                  <dd className="text-xs text-ink-soft capitalize">{room.type}</dd>
                ) : null}
              </div>
              <div className="rule" />
              <div>
                <dt className="font-mono text-[10px] uppercase tracking-wide text-ink-mute">
                  Franja
                </dt>
                <dd className="font-display text-xl text-ink mt-0.5">
                  {slot?.name ?? '—'}
                </dd>
                {slot ? (
                  <dd className="font-mono text-[11px] text-ink-soft">
                    {slot.start_time}–{slot.end_time}
                  </dd>
                ) : null}
              </div>
              <div className="rule" />
              <div>
                <dt className="font-mono text-[10px] uppercase tracking-wide text-ink-mute">
                  Fecha
                </dt>
                <dd className="text-ink mt-0.5 capitalize">{dateLabel}</dd>
              </div>
            </dl>
          </aside>
        </div>
      </div>
    </AppLayout>
  );
}
