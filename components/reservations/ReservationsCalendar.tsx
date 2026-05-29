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

  // Filtrar reservas de la semana actual y solo confirmadas
  const weekReservations = reservations.filter(
    (r) => r.reservation_date >= startStr && r.reservation_date <= endStr && r.status === 'confirmada'
  );

  // Construir estructura de días y slots
  const [year, month, day] = weekStart.split('-').map(Number);
  const start = new Date(year, month - 1, day);

  const DAYS_NAMES = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  const SLOTS = [
    '07:00–09:00',
    '09:00–11:00',
    '11:00–13:00',
    '13:00–15:00',
    '15:00–17:00',
    '16:00–18:00',
    '18:00–20:00',
  ];

  const calendarDays = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    const dateStr = d.toISOString().split('T')[0];
    return {
      date: dateStr,
      dayName: DAYS_NAMES[i],
      dayIndex: i,
    };
  });

  const getReservationForSlot = (dateStr: string, slotName: string): Reservation | undefined => {
    return weekReservations.find((r) => r.reservation_date === dateStr && r.slot?.name === slotName);
  };

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

      {/* Calendar Grid - Same style as blocks room calendar */}
      <div className="border border-rule overflow-x-auto">
        <div className="grid grid-cols-[120px_repeat(6,_1fr)] bg-paper-soft border-b border-rule">
          <div className="px-3 py-3 font-mono text-[10px] uppercase tracking-wide text-ink-mute font-semibold">
            Franja
          </div>
          {calendarDays.map((day) => (
            <div key={day.date} className="px-3 py-3 border-l border-rule">
              <div className="font-mono text-[10px] uppercase tracking-wide text-ink-mute">
                {day.dayName}
              </div>
              <div className="font-display text-sm text-ink mt-0.5 font-semibold">{day.date}</div>
            </div>
          ))}
        </div>

        {/* Slot rows */}
        {SLOTS.map((slotName, slotIndex) => (
          <div
            key={slotIndex}
            className="grid grid-cols-[120px_repeat(6,_1fr)] border-b border-rule last:border-b-0"
          >
            <div className="px-3 py-3 bg-paper/60 flex items-center font-mono text-[11px] uppercase tracking-wide text-ink-soft border-r border-rule">
              {slotName}
            </div>

            {/* Cells for each day */}
            {calendarDays.map((day) => {
              const reservation = getReservationForSlot(day.date, slotName);
              const today = new Date().toISOString().split('T')[0];
              const isToday = day.date === today;

              return (
                <div
                  key={`${day.date}-${slotName}`}
                  className={`border-l border-rule p-3 min-h-[100px] flex flex-col justify-center ${
                    isToday ? 'bg-accent/5' : 'bg-paper'
                  }`}
                >
                  {reservation ? (
                    <div className="space-y-1">
                      <div className="font-display text-sm font-bold text-ink leading-tight">
                        {reservation.subject}
                      </div>
                      <div className="font-mono text-[10px] text-ink-mute">
                        {reservation.room?.code ?? '—'}
                      </div>
                      <div className="font-mono text-[10px] text-ink-soft">
                        Grupo: {reservation.group_name}
                      </div>
                      {reservation.professor_name && (
                        <div className="font-mono text-[9px] text-accent mt-1">
                          {reservation.professor_name}
                        </div>
                      )}
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
