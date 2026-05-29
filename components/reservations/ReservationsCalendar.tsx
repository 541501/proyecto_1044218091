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

// Horarios disponibles en el sistema
const AVAILABLE_SLOTS = [
  { id: '1', name: '07:00–09:00', start: '07:00', end: '09:00' },
  { id: '2', name: '09:00–11:00', start: '09:00', end: '11:00' },
  { id: '3', name: '11:00–13:00', start: '11:00', end: '13:00' },
  { id: '4', name: '13:00–15:00', start: '13:00', end: '15:00' },
  { id: '5', name: '15:00–17:00', start: '15:00', end: '17:00' },
  { id: '6', name: '17:00–19:00', start: '17:00', end: '19:00' },
];

const WEEKDAYS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

function getWeekDays(startDateStr: string) {
  const days: { date: string; dayName: string; dayNum: number }[] = [];

  if (!startDateStr || startDateStr === '') return days;

  // Parsear la fecha correctamente (startDateStr es formato "YYYY-MM-DD")
  const parts = startDateStr.split('-');
  if (parts.length !== 3) return days;

  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10);
  const day = parseInt(parts[2], 10);

  const start = new Date(year, month - 1, day);

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

  const weekDays = getWeekDays(weekStart);

  const getReservationForSlot = (date: string, slotName: string) => {
    return reservations.find(
      (r) =>
        r.reservation_date === date &&
        r.slot?.name === slotName &&
        r.status === 'confirmada'
    );
  };

  const formatDateRange = () => {
    const days = getWeekDays(weekStart);
    if (days.length === 0) return '';
    const start = days[0];
    const end = days[5];

    const startDate = new Date(weekStart);
    const endDate = new Date(weekStart);
    endDate.setDate(endDate.getDate() + 5);

    return `${startDate.toLocaleDateString('es-CO', { day: 'numeric', month: 'short' })} - ${endDate.toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' })}`;
  };

  if (!isClient) return null;

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
      <div className="border border-rule rounded overflow-hidden bg-paper">
        <div className="grid gap-px bg-rule" style={{ gridTemplateColumns: '140px repeat(6, 1fr)' }}>
          {/* Header - Time slots column */}
          <div className="bg-paper-soft border-r border-rule p-4 font-mono text-[10px] uppercase tracking-wide text-ink-mute sticky left-0 z-10">
            Franja horaria
          </div>

          {/* Header - Days */}
          {weekDays.map((day) => (
            <div
              key={day.date}
              className="bg-paper-soft border-r border-rule p-4 text-center"
            >
              <div className="font-mono text-[10px] uppercase tracking-wide text-ink-mute">
                {day.dayName}
              </div>
              <div className="font-display text-2xl text-ink mt-1 font-semibold">{day.dayNum}</div>
            </div>
          ))}

          {/* Slots */}
          {AVAILABLE_SLOTS.map((slot) => (
            <div key={`slot-${slot.id}`}>
              {/* Slot label */}
              <div className="bg-paper-soft border-r border-rule p-4 font-mono text-[11px] font-semibold text-ink sticky left-0 z-10">
                {slot.name}
              </div>

              {/* Slot cells for each day */}
              {weekDays.map((day) => {
                const reservation = getReservationForSlot(day.date, slot.name);
                const isToday = new Date().toISOString().split('T')[0] === day.date;
                
                return (
                  <div
                    key={`${day.date}-${slot.id}`}
                    className={`border-r border-rule p-3 min-h-[140px] bg-paper transition-colors ${
                      isToday ? 'bg-accent/5' : 'hover:bg-paper-soft'
                    } ${reservation ? '' : 'border-dashed border-rule/40'}`}
                  >
                    {reservation ? (
                      <div className="h-full flex flex-col">
                        <div className="flex-1 flex flex-col justify-center space-y-2">
                          {/* Materia */}
                          <div>
                            <div className="font-display text-sm font-bold text-ink leading-tight">
                              {reservation.subject}
                            </div>
                          </div>

                          {/* Detalles */}
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-[9px] uppercase tracking-wide text-ink-mute">
                                Salón:
                              </span>
                              <span className="font-mono text-[11px] font-semibold text-ink">
                                {reservation.room?.code || '—'}
                              </span>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-[9px] uppercase tracking-wide text-ink-mute">
                                Grupo:
                              </span>
                              <span className="font-mono text-[10px] text-ink-soft">
                                {reservation.group_name}
                              </span>
                            </div>

                            {reservation.professor_name ? (
                              <div className="flex items-center gap-2 pt-1">
                                <span className="inline-block px-2 py-0.5 bg-accent/20 border border-accent/40 rounded text-[8px] font-mono uppercase tracking-wide text-accent font-semibold">
                                  @{reservation.professor_name}
                                </span>
                              </div>
                            ) : null}
                          </div>
                        </div>

                        {/* Status badge */}
                        <div className="mt-2 pt-2 border-t border-rule/30">
                          <span className={`inline-block px-2 py-1 rounded text-[9px] font-mono uppercase tracking-wide font-semibold ${
                            reservation.status === 'confirmada'
                              ? 'bg-ok/20 text-ok border border-ok/30'
                              : 'bg-ink-mute/20 text-ink-mute border border-ink-mute/30'
                          }`}>
                            {reservation.status === 'confirmada' ? 'Confirmada' : 'Cancelada'}
                          </span>
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
      <div className="flex items-center gap-6 font-mono text-[11px] uppercase tracking-wide text-ink-soft p-4 border border-rule rounded bg-paper-soft">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-ok/20 border border-ok/30 rounded" />
          <span>Confirmada</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-accent/20 border border-accent/30 rounded" />
          <span>Asignada a ti</span>
        </div>
      </div>
    </div>
  );
}
