'use client';

import { useState, useEffect } from 'react';
import { IconChevronLeft, IconChevronRight } from '@/components/icons';

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

// Horarios disponibles en el sistema (ejemplo)
const AVAILABLE_SLOTS = [
  { id: '1', name: '07:00-09:00', start: '07:00', end: '09:00' },
  { id: '2', name: '09:00-11:00', start: '09:00', end: '11:00' },
  { id: '3', name: '11:00-13:00', start: '11:00', end: '13:00' },
  { id: '4', name: '13:00-15:00', start: '13:00', end: '15:00' },
  { id: '5', name: '15:00-17:00', start: '15:00', end: '17:00' },
  { id: '6', name: '17:00-19:00', start: '17:00', end: '19:00' },
];

const WEEKDAYS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

export default function ReservationsCalendar({ reservations }: Props) {
  const [weekStart, setWeekStart] = useState<string>('');

  useEffect(() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth() + 1;
    const day = today.getDate();

    const dateObj = new Date(year, month - 1, day);
    const dayOfWeek = dateObj.getDay();
    const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const monday = new Date(year, month - 1, day + diff);

    const mondayStr = [
      monday.getFullYear(),
      String(monday.getMonth() + 1).padStart(2, '0'),
      String(monday.getDate()).padStart(2, '0'),
    ].join('-');

    setWeekStart(mondayStr);
  }, []);

  const getWeekDays = (startDateStr: string) => {
    const days: { date: string; dayName: string; dayNum: number }[] = [];
    const start = new Date(startDateStr);

    for (let i = 0; i < 6; i++) {
      const current = new Date(start);
      current.setDate(current.getDate() + i);
      const dateStr = [
        current.getFullYear(),
        String(current.getMonth() + 1).padStart(2, '0'),
        String(current.getDate()).padStart(2, '0'),
      ].join('-');

      days.push({
        date: dateStr,
        dayName: WEEKDAYS[i],
        dayNum: current.getDate(),
      });
    }

    return days;
  };

  const handlePreviousWeek = () => {
    const date = new Date(weekStart);
    date.setDate(date.getDate() - 7);
    const newStart = [
      date.getFullYear(),
      String(date.getMonth() + 1).padStart(2, '0'),
      String(date.getDate()).padStart(2, '0'),
    ].join('-');
    setWeekStart(newStart);
  };

  const handleNextWeek = () => {
    const date = new Date(weekStart);
    date.setDate(date.getDate() + 7);
    const newStart = [
      date.getFullYear(),
      String(date.getMonth() + 1).padStart(2, '0'),
      String(date.getDate()).padStart(2, '0'),
    ].join('-');
    setWeekStart(newStart);
  };

  const handleToday = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth() + 1;
    const day = today.getDate();

    const dateObj = new Date(year, month - 1, day);
    const dayOfWeek = dateObj.getDay();
    const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const monday = new Date(year, month - 1, day + diff);

    const mondayStr = [
      monday.getFullYear(),
      String(monday.getMonth() + 1).padStart(2, '0'),
      String(monday.getDate()).padStart(2, '0'),
    ].join('-');

    setWeekStart(mondayStr);
  };

  const weekDays = getWeekDays(weekStart);

  const getReservationForSlot = (date: string, slotId: string) => {
    return reservations.find(
      (r) =>
        r.reservation_date === date &&
        r.slot?.name === AVAILABLE_SLOTS.find((s) => s.id === slotId)?.name &&
        r.status === 'confirmada'
    );
  };

  const formatDateRange = () => {
    if (!weekStart) return '';
    const start = new Date(weekStart);
    const end = new Date(start);
    end.setDate(end.getDate() + 5);

    return `${start.toLocaleDateString('es-CO', { day: 'numeric', month: 'short' })} - ${end.toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' })}`;
  };

  return (
    <div className="space-y-4">
      {/* Week Navigator */}
      <div className="flex items-center justify-between mb-6 p-4 border border-rule rounded">
        <button
          onClick={handlePreviousWeek}
          className="p-2 hover:bg-paper-soft rounded transition-colors"
          aria-label="Semana anterior"
        >
          <IconChevronLeft size={18} />
        </button>

        <div className="text-center">
          <div className="font-mono text-[11px] uppercase tracking-wide text-ink-mute mb-1">
            Semana del
          </div>
          <div className="font-display text-lg text-ink">{formatDateRange()}</div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleToday}
            className="px-3 py-2 border border-rule hover:border-ink text-sm font-mono uppercase tracking-wide transition-colors"
          >
            Hoy
          </button>
          <button
            onClick={handleNextWeek}
            className="p-2 hover:bg-paper-soft rounded transition-colors"
            aria-label="Próxima semana"
          >
            <IconChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="border border-rule overflow-x-auto">
        <div className="grid gap-0" style={{ gridTemplateColumns: '120px repeat(6, 1fr)' }}>
          {/* Header - Time slots column */}
          <div className="bg-paper-soft border-r border-b border-rule p-3 font-mono text-[10px] uppercase tracking-wide text-ink-mute sticky left-0 z-10">
            Franja
          </div>

          {/* Header - Days */}
          {weekDays.map((day) => (
            <div
              key={day.date}
              className="bg-paper-soft border-r border-b border-rule p-3 text-center"
            >
              <div className="font-mono text-[10px] uppercase tracking-wide text-ink-mute">
                {day.dayName}
              </div>
              <div className="font-display text-lg text-ink mt-1">{day.dayNum}</div>
            </div>
          ))}

          {/* Slots */}
          {AVAILABLE_SLOTS.map((slot) => (
            <div key={`slot-${slot.id}`}>
              {/* Slot label */}
              <div className="bg-paper-soft border-r border-b border-rule p-3 font-mono text-[10px] uppercase tracking-wide text-ink-mute sticky left-0 z-10">
                {slot.name}
              </div>

              {/* Slot cells for each day */}
              {weekDays.map((day) => {
                const reservation = getReservationForSlot(day.date, slot.id);
                return (
                  <div
                    key={`${day.date}-${slot.id}`}
                    className="border-r border-b border-rule p-3 min-h-[120px] bg-paper hover:bg-paper-soft transition-colors"
                  >
                    {reservation ? (
                      <div className="h-full flex flex-col justify-center">
                        <div
                          className={`p-3 rounded border-l-4 ${
                            reservation.status === 'confirmada'
                              ? 'border-ok bg-ok-bg/30 text-ok'
                              : 'border-ink-mute bg-paper-soft text-ink-mute'
                          }`}
                        >
                          <div className="font-display text-sm font-semibold">
                            {reservation.subject}
                          </div>
                          <div className="font-mono text-[10px] mt-2 text-ink-mute">
                            {reservation.room?.code || '—'}
                          </div>
                          <div className="font-mono text-[10px] mt-1">
                            Grupo: {reservation.group_name}
                          </div>
                          {reservation.professor_name ? (
                            <div className="font-mono text-[9px] mt-1 text-accent">
                              @{reservation.professor_name}
                            </div>
                          ) : null}
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

      {/* Legend */}
      <div className="flex items-center gap-4 font-mono text-[11px] uppercase tracking-wide text-ink-soft">
        <span className="inline-flex items-center gap-2">
          <div className="w-4 h-4 bg-ok-bg/30 border border-ok rounded" />
          Confirmada
        </span>
      </div>
    </div>
  );
}
