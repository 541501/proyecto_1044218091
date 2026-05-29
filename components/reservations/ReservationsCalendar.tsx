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
  const SLOTS = [
    '07:00–09:00',
    '09:00–11:00',
    '11:00–13:00',
    '13:00–15:00',
    '15:00–17:00',
    '16:00–18:00',
    '18:00–20:00',
  ];
  const DAYS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

  // Obtener los días de la semana
  const [year, month, day] = weekStart.split('-').map(Number);
  const start = new Date(year, month - 1, day);
  const weekDates = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    return d.toISOString().split('T')[0];
  });

  // Filtrar reservas de la semana actual y solo confirmadas
  const weekReservations = reservations.filter(
    (r) => r.reservation_date >= startStr && r.reservation_date <= endStr && r.status === 'confirmada'
  );

  // Función para obtener reserva en un slot específico
  const getReservationCell = (dateStr: string, slotName: string): Reservation | undefined => {
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

      {/* Calendar Grid - Exactly like the photo */}
      <div className="border border-rule rounded overflow-x-auto bg-paper">
        <div className="inline-block min-w-full">
          <div className="grid gap-0" style={{ gridTemplateColumns: '120px repeat(6, 1fr)' }}>
            {/* Header Row */}
            <div className="bg-paper-soft border-r border-b border-rule p-3 font-mono text-[11px] uppercase tracking-wide text-ink-mute font-semibold sticky left-0 z-20">
              Franja
            </div>

            {weekDates.map((dateStr, idx) => {
              const dateObj = new Date(dateStr);
              const dayStr = DAYS[idx].toUpperCase();
              const dateFormatted = dateStr; // YYYY-MM-DD format
              return (
                <div
                  key={`header-${dateStr}`}
                  className="bg-paper-soft border-r border-b border-rule p-3 text-center"
                >
                  <div className="font-mono text-[10px] uppercase tracking-wide text-ink-mute">
                    {dayStr}
                  </div>
                  <div className="font-display text-base text-ink font-semibold mt-1">
                    {dateFormatted}
                  </div>
                </div>
              );
            })}

            {/* Slot Rows */}
            {SLOTS.map((slotName) => (
              <div key={`slot-${slotName}`}>
                {/* Slot label */}
                <div className="bg-paper-soft border-r border-b border-rule p-3 font-mono text-[10px] uppercase tracking-wide text-ink-mute font-semibold sticky left-0 z-10">
                  {slotName}
                </div>

                {/* Cells for each day in this slot */}
                {weekDates.map((dateStr) => {
                  const reservation = getReservationCell(dateStr, slotName);
                  const today = new Date().toISOString().split('T')[0];
                  const isToday = dateStr === today;

                  return (
                    <div
                      key={`cell-${dateStr}-${slotName}`}
                      className={`border-r border-b border-rule p-4 min-h-[100px] flex flex-col justify-center ${
                        isToday ? 'bg-accent/10' : 'bg-paper'
                      } ${!reservation ? 'hover:bg-paper-soft/50' : ''} transition-colors`}
                    >
                      {reservation ? (
                        <div className="space-y-1.5">
                          <div>
                            <div className="font-display text-sm font-bold text-ink leading-tight">
                              {reservation.subject}
                            </div>
                          </div>
                          <div className="text-[10px] space-y-0.5">
                            <div className="font-mono text-ink-mute">
                              {reservation.slot?.name ?? slotName}
                            </div>
                            <div className="font-mono text-ink-mute">
                              {reservation.room?.code ?? '—'}
                            </div>
                            {reservation.professor_name && (
                              <div className="font-mono text-accent text-[9px]">
                                {reservation.professor_name}
                              </div>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="font-mono text-[10px] text-ink-mute/40">
                          {slotName}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
