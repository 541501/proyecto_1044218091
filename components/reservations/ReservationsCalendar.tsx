'use client';

import { useState, useEffect } from 'react';
import {
  IconChevronLeft,
  IconChevronRight,
  IconColumns,
  IconClock,
  IconCalendar,
} from '@/components/icons';
import { Badge } from '@/components/ui/Badge';

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

interface Props {
  reservations: Reservation[];
}

function getMonday(date: Date): string {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();

  const dateObj = new Date(year, month - 1, day);
  const dayOfWeek = dateObj.getDay();
  const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const monday = new Date(year, month - 1, day + diff);

  return [
    monday.getFullYear(),
    String(monday.getMonth() + 1).padStart(2, '0'),
    String(monday.getDate()).padStart(2, '0'),
  ].join('-');
}

function getWeekRange(startDateStr: string) {
  const [year, month, day] = startDateStr.split('-').map(Number);
  const start = new Date(year, month - 1, day);
  const end = new Date(start);
  end.setDate(start.getDate() + 5);

  return {
    startStr: startDateStr,
    endStr: [
      end.getFullYear(),
      String(end.getMonth() + 1).padStart(2, '0'),
      String(end.getDate()).padStart(2, '0'),
    ].join('-'),
  };
}

export default function ReservationsCalendar({ reservations }: Props) {
  const [weekStart, setWeekStart] = useState<string>('');
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const today = new Date();
    const mondayStr = getMonday(today);
    setWeekStart(mondayStr);
  }, []);

  const handlePreviousWeek = () => {
    if (!weekStart) return;
    const [year, month, day] = weekStart.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    date.setDate(date.getDate() - 7);
    const newStart = getMonday(date);
    setWeekStart(newStart);
  };

  const handleNextWeek = () => {
    if (!weekStart) return;
    const [year, month, day] = weekStart.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    date.setDate(date.getDate() + 7);
    const newStart = getMonday(date);
    setWeekStart(newStart);
  };

  const handleToday = () => {
    const today = new Date();
    const mondayStr = getMonday(today);
    setWeekStart(mondayStr);
  };

  const formatDateRange = () => {
    if (!weekStart) return '';
    const [year, month, day] = weekStart.split('-').map(Number);
    const start = new Date(year, month - 1, day);
    const end = new Date(start);
    end.setDate(start.getDate() + 5);

    return `${start.toLocaleDateString('es-CO', { day: 'numeric', month: 'short' })} - ${end.toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' })}`;
  };

  if (!isClient) return null;

  const { startStr, endStr } = getWeekRange(weekStart);

  // Filtrar reservas de la semana actual y ordenar por fecha y hora
  const weekReservations = reservations
    .filter((r) => r.reservation_date >= startStr && r.reservation_date <= endStr && r.status === 'confirmada')
    .sort((a, b) => {
      const dateCompare = new Date(a.reservation_date).getTime() - new Date(b.reservation_date).getTime();
      if (dateCompare !== 0) return dateCompare;

      const slotOrder: { [key: string]: number } = {
        '07:00–09:00': 0,
        '09:00–11:00': 1,
        '11:00–13:00': 2,
        '13:00–15:00': 3,
        '15:00–17:00': 4,
        '17:00–19:00': 5,
      };

      const aTime = slotOrder[a.slot?.name || ''] ?? 999;
      const bTime = slotOrder[b.slot?.name || ''] ?? 999;
      return aTime - bTime;
    });

  // Agrupar por fecha
  const groupedByDate: { [key: string]: Reservation[] } = {};
  weekReservations.forEach((r) => {
    if (!groupedByDate[r.reservation_date]) {
      groupedByDate[r.reservation_date] = [];
    }
    groupedByDate[r.reservation_date].push(r);
  });

  const sortedDates = Object.keys(groupedByDate).sort();

  const fmtDate = (s: string) =>
    new Date(s).toLocaleDateString('es-CO', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });

  return (
    <div className="space-y-6">
      {/* Week Navigator */}
      <div className="flex items-center justify-between p-4 border border-rule rounded bg-paper-soft">
        <button
          onClick={handlePreviousWeek}
          className="p-2 hover:bg-paper rounded transition-colors"
          aria-label="Semana anterior"
        >
          <IconChevronLeft size={20} />
        </button>

        <div className="text-center flex-1">
          <div className="font-mono text-[11px] uppercase tracking-wide text-ink-mute mb-2">
            Semana
          </div>
          <div className="font-display text-xl text-ink">{formatDateRange()}</div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleToday}
            className="px-4 py-2 border border-ink hover:bg-paper text-sm font-mono uppercase tracking-wide transition-colors"
          >
            Hoy
          </button>
          <button
            onClick={handleNextWeek}
            className="p-2 hover:bg-paper rounded transition-colors"
            aria-label="Próxima semana"
          >
            <IconChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* Reservations List */}
      {sortedDates.length === 0 ? (
        <div className="text-center py-12 border border-rule rounded bg-paper-soft">
          <div className="font-mono text-sm uppercase tracking-wide text-ink-mute">
            No tienes reservas esta semana
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {sortedDates.map((dateStr) => (
            <div key={dateStr} className="space-y-3">
              {/* Date header */}
              <div className="sticky top-0 z-10 flex items-center gap-3 py-2 px-4 border-l-4 border-brand bg-paper-soft/80 backdrop-blur-sm">
                <IconCalendar size={16} className="text-brand" />
                <span className="font-display text-lg text-ink font-semibold capitalize">
                  {fmtDate(dateStr)}
                </span>
              </div>

              {/* Reservations for this date */}
              <ul className="divide-y divide-rule border-y border-rule">
                {groupedByDate[dateStr]!.map((r) => (
                  <li
                    key={r.id}
                    className={[
                      'py-5 group',
                      r.status === 'cancelada' ? 'opacity-60' : '',
                    ].join(' ')}
                  >
                    <div className="flex items-start justify-between gap-4 px-4">
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
                            <IconClock size={14} />
                            {r.slot?.name ?? '—'}
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
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
