'use client';

import { useState, useEffect } from 'react';
import { WeeklyCalendar as WeeklyCalendarType } from '@/lib/types';
import SlotCell from './SlotCell';
import WeekNavigator from './WeekNavigator';
import { IconChevronDown, IconCheck } from '@/components/icons';

interface Props {
  calendar: WeeklyCalendarType | null;
  loading?: boolean;
  onSlotClick?: (dayIndex: number, slotIndex: number) => void;
  onWeekChange?: (weekStart: string) => void;
}

export default function WeeklyCalendar({ calendar, loading, onSlotClick, onWeekChange }: Props) {
  const [expandedDay, setExpandedDay] = useState<number | null>(0);
  const [currentWeekStart, setCurrentWeekStart] = useState<string>(calendar?.weekStart || '');

  useEffect(() => {
    if (calendar?.weekStart) setCurrentWeekStart(calendar.weekStart);
  }, [calendar?.weekStart]);

  const changeWeek = (newStart: string) => {
    setCurrentWeekStart(newStart);
    onWeekChange?.(newStart);
  };

  if (loading) {
    return (
      <div className="border border-dashed border-rule py-20 text-center font-mono text-sm uppercase tracking-wide text-ink-mute">
        Cargando calendario…
      </div>
    );
  }

  if (!calendar) {
    return (
      <div className="border border-dashed border-rule py-20 text-center font-mono text-sm uppercase tracking-wide text-ink-mute">
        Sin datos de calendario
      </div>
    );
  }

  const handlePreviousWeek = () => {
    const date = new Date(currentWeekStart);
    date.setDate(date.getDate() - 7);
    changeWeek(date.toISOString().split('T')[0]);
  };

  const handleNextWeek = () => {
    const date = new Date(currentWeekStart);
    date.setDate(date.getDate() + 7);
    changeWeek(date.toISOString().split('T')[0]);
  };

  const handleToday = () => {
    const today = new Date();
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(today.setDate(diff));
    changeWeek(monday.toISOString().split('T')[0]);
  };

  const allFree = calendar.days.every((day) => day.slots.every((s) => s.state === 'libre'));

  return (
    <div>
      <WeekNavigator
        weekStart={currentWeekStart}
        onPreviousWeek={handlePreviousWeek}
        onNextWeek={handleNextWeek}
        onToday={handleToday}
      />

      {allFree ? (
        <div className="mb-5 px-4 py-3 border border-ok/30 bg-ok-bg/60 text-ok inline-flex items-center gap-2 font-mono text-[12px] uppercase tracking-wide">
          <IconCheck size={14} />
          Todas las franjas disponibles
        </div>
      ) : null}

      {/* Desktop grid */}
      <div className="hidden md:block border border-rule">
        <div className="grid grid-cols-[120px_repeat(5,_1fr)] bg-paper-soft border-b border-rule">
          <div className="px-3 py-3 font-mono text-[10px] uppercase tracking-wide text-ink-mute">
            Franja
          </div>
          {calendar.days.map((day) => (
            <div key={day.date} className="px-3 py-3 border-l border-rule">
              <div className="font-mono text-[10px] uppercase tracking-wide text-ink-mute">
                {day.dayName}
              </div>
              <div className="font-display text-sm text-ink mt-0.5">{day.date}</div>
            </div>
          ))}
        </div>

        {calendar.days[0]?.slots.map((_, slotIndex) => (
          <div
            key={slotIndex}
            className="grid grid-cols-[120px_repeat(5,_1fr)] border-b border-rule last:border-b-0"
          >
            <div className="px-3 py-3 bg-paper/60 flex items-center font-mono text-[11px] uppercase tracking-wide text-ink-soft border-r border-rule">
              {calendar.days[0].slots[slotIndex]?.slotName}
            </div>
            {calendar.days.map((day, dayIndex) => (
              <div key={`${day.date}-${slotIndex}`} className="border-l border-rule">
                <SlotCell
                  slot={day.slots[slotIndex]}
                  onClick={() => onSlotClick?.(dayIndex, slotIndex)}
                />
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Mobile accordion */}
      <div className="md:hidden space-y-3">
        {calendar.days.map((day, dayIndex) => (
          <div key={day.date} className="border border-rule bg-surface">
            <button
              onClick={() => setExpandedDay(expandedDay === dayIndex ? null : dayIndex)}
              className="w-full px-4 py-3 flex items-center justify-between"
            >
              <div className="text-left">
                <div className="font-mono text-[10px] uppercase tracking-wide text-ink-mute">
                  {day.dayName}
                </div>
                <div className="font-display text-lg text-ink">{day.date}</div>
              </div>
              <IconChevronDown
                size={18}
                className={[
                  'transition-transform text-ink-soft',
                  expandedDay === dayIndex ? 'rotate-180' : '',
                ].join(' ')}
              />
            </button>

            {expandedDay === dayIndex ? (
              <div className="border-t border-rule grid grid-cols-2 gap-px bg-rule">
                {day.slots.map((slot, slotIndex) => (
                  <SlotCell
                    key={`${day.date}-${slotIndex}`}
                    slot={slot}
                    onClick={() => onSlotClick?.(dayIndex, slotIndex)}
                  />
                ))}
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}
