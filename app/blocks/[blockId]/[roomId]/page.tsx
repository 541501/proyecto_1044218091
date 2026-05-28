'use client';

import { use, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AppLayout } from '@/components/layout/AppLayout';
import WeeklyCalendar from '@/components/calendar/WeeklyCalendar';
import { WeeklyCalendar as WeeklyCalendarType } from '@/lib/types';
import {
  IconChevronLeft,
  IconUsers,
  IconDot,
  IconBookOpen,
  IconLab,
  IconAuditorium,
  IconMonitor,
  IconDoorway,
} from '@/components/icons';

const TYPE: Record<string, { label: string; icon: React.ReactNode }> = {
  salon: { label: 'Salón', icon: <IconBookOpen size={16} /> },
  laboratorio: { label: 'Laboratorio', icon: <IconLab size={16} /> },
  auditorio: { label: 'Auditorio', icon: <IconAuditorium size={16} /> },
  sala_computo: { label: 'Sala de cómputo', icon: <IconMonitor size={16} /> },
  otro: { label: 'Otro', icon: <IconDoorway size={16} /> },
};

export default function RoomDetailsPage({
  params: paramsPromise,
}: {
  params: Promise<{ blockId: string; roomId: string }>;
}) {
  const params = use(paramsPromise);
  const router = useRouter();
  const searchParams = useSearchParams();

  const [calendar, setCalendar] = useState<WeeklyCalendarType | null>(null);
  const [room, setRoom] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [currentWeekStart, setCurrentWeekStart] = useState<string>('');

  const selectedDate = searchParams.get('date') || new Date().toISOString().split('T')[0];

  const getMonday = (dateStr: string) => {
    const [year, month, day] = dateStr.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    const dayOfWeek = date.getDay();
    const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const monday = new Date(year, month - 1, day + diff);
    return [
      monday.getFullYear(),
      String(monday.getMonth() + 1).padStart(2, '0'),
      String(monday.getDate()).padStart(2, '0'),
    ].join('-');
  };

  // Calculate weekStart from selectedDate
  const calculatedWeekStart = getMonday(selectedDate);

  // Load data when params or calculatedWeekStart changes
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setCalendar(null); // Reset calendar
        setRoom(null); // Reset room
        
        const meRes = await fetch('/api/auth/me', { credentials: 'include' });
        if (meRes.ok) setUser((await meRes.json()).user ?? null);
        
        const roomRes = await fetch(`/api/rooms/${params.roomId}`, { credentials: 'include' });
        if (roomRes.ok) setRoom(await roomRes.json());
        
        const calRes = await fetch(`/api/rooms/${params.roomId}/calendar?weekStart=${calculatedWeekStart}`, { credentials: 'include' });
        if (calRes.ok) setCalendar(await calRes.json());
      } catch (err) {
        console.error('[RoomDetailsPage] Error:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, [params.roomId, calculatedWeekStart]);

  const handleSlotClick = (dayIndex: number, slotIndex: number) => {
    if (!calendar) return;
    const day = calendar.days[dayIndex];
    const slot = day.slots[slotIndex];
    if (slot.state === 'libre') {
      router.push(
        `/reservations/new?roomId=${params.roomId}&slotId=${slot.slotId}&date=${day.date}`,
      );
    }
  };

  const meta = room?.type ? TYPE[room.type] ?? TYPE.otro : null;

  return (
    <AppLayout role={user?.role || 'profesor'} userName={user?.name} showSeedBanner>
      <div className="max-w-6xl mx-auto">
        <button
          onClick={() => router.back()}
          className="mb-8 inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wide text-ink-soft hover:text-ink transition-colors"
        >
          <IconChevronLeft size={14} />
          Volver al bloque
        </button>

        <header className="mb-10 animate-rise grid md:grid-cols-[1fr_auto] gap-6 items-end border-b border-rule pb-8">
          <div>
            <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-wide text-ink-mute mb-3">
              <IconDot size={6} className="text-accent" />
              <span>{meta?.label ?? 'Salón'}</span>
            </div>
            <h1 className="font-display text-6xl md:text-7xl leading-[0.9] text-ink">
              {room?.code ?? 'Salón'}
            </h1>
          </div>

          <dl className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
            <dt className="font-mono text-[10px] uppercase tracking-wide text-ink-mute">Capacidad</dt>
            <dd className="font-display text-xl text-ink flex items-center gap-2">
              <IconUsers size={14} className="text-ink-mute" />
              {room?.capacity ?? '—'}
            </dd>
            <dt className="font-mono text-[10px] uppercase tracking-wide text-ink-mute">Equipamiento</dt>
            <dd className="text-ink-soft max-w-xs">{room?.equipment || <span className="italic text-ink-mute">Sin equipo</span>}</dd>
          </dl>
        </header>

        <section className="mb-8">
          <div className="font-mono text-[10px] uppercase tracking-wide text-ink-mute mb-2">
            Calendario semanal
          </div>
          <WeeklyCalendar
            calendar={calendar}
            loading={loading}
            onSlotClick={handleSlotClick}
            onWeekChange={(ws) => setCurrentWeekStart(ws)}
          />
        </section>

        {/* Legend */}
        <div className="border border-rule bg-paper-soft/50 p-5 mt-10">
          <div className="font-mono text-[10px] uppercase tracking-wide text-ink-mute mb-3">
            Convenciones
          </div>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div className="flex items-center gap-2.5">
              <span className="w-4 h-4 border border-ok/40 bg-ok-bg" />
              <span className="text-ink-soft">Libre (clic para reservar)</span>
            </div>
            <div className="flex items-center gap-2.5">
              <span className="w-4 h-4 border border-bad/40 bg-bad-bg" />
              <span className="text-ink-soft">Ocupada</span>
            </div>
            <div className="flex items-center gap-2.5">
              <span className="w-4 h-4 border border-rule bg-paper-soft" />
              <span className="text-ink-soft">Pasada</span>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
