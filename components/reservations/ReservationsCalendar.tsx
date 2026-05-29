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
  const SLOTS = ['07:00–09:00', '09:00–11:00', '11:00–13:00', '13:00–15:00', '15:00–17:00', '16:00–18:00', '18:00–20:00'];
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

      {/* Calendar Grid */}
      <div className="border border-rule rounded overflow-x-auto bg-paper">
        <div className="grid gap-px bg-rule" style={{ gridTemplateColumns: '120px repeat(6, 1fr)' }}>
          {/* Header - Slot column */}
          <div className="bg-paper-soft border-r border-rule p-3 font-mono text-[10px] uppercase tracking-wide text-ink-mute sticky left-0 z-10">
            FRANJA
          </div>

          {/* Header - Days */}
          {weekDates.map((dateStr, idx) => {
            const dateObj = new Date(dateStr);
            return (
              <div key={dateStr} className="bg-paper-soft border-r border-rule p-3 text-center">
                <div className="font-mono text-[10px] uppercase tracking-wide text-ink-mute">
                  {DAYS[idx]}
                </div>
                <div className="font-display text-lg text-ink mt-1 font-semibold">{dateObj.getDate().toString().padStart(2, '0')}</div>
              </div>
            );
          })}

          {/* Rows for each slot */}
          {SLOTS.map((slotName) => (
            <div key={`slot-row-${slotName}`}>
              {/* Slot time label */}
              <div className="bg-paper-soft border-r border-rule p-3 font-mono text-[10px] font-semibold text-ink sticky left-0 z-10">
                {slotName}
              </div>

              {/* Cells for each day */}
              {weekDates.map((dateStr) => {
                const reservation = getReservationCell(dateStr, slotName);
                const today = new Date().toISOString().split('T')[0];
                const isToday = dateStr === today;

                return (
                  <div
                    key={`${dateStr}-${slotName}`}
                    className={`border-r border-rule p-3 min-h-[120px] flex flex-col justify-center ${
                      isToday ? 'bg-accent/10' : 'bg-paper hover:bg-paper-soft'
                    } transition-colors`}
                  >
                    {reservation ? (
                      <div className="space-y-2">
                        <div>
                          <div className="font-display text-sm font-bold text-ink">
                            {reservation.subject}
                          </div>
                          <div className="font-mono text-[9px] text-ink-mute mt-0.5">
                            {reservation.room?.code ?? '—'}
                          </div>
                        </div>
                        <div className="text-[10px] text-ink-soft space-y-1">
                          <div>Grupo: {reservation.group_name}</div>
                          {reservation.professor_name && (
                            <div className="inline-block px-2 py-0.5 bg-accent/30 rounded text-accent font-mono text-[8px] uppercase tracking-wide">
                              @{reservation.professor_name}
                            </div>
                          )}
                        </div>
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
