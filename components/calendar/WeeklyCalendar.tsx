/**
 * components/calendar/WeeklyCalendar.tsx
 * Calendario semanal (desktop) e implementación acordeón (mobile)
 * Para desktop: grilla 5 columnas (lunes-viernes) × 6 filas (franjas)
 * Para mobile: lista de días con acordeón
 */

'use client';

import { WeeklyCalendar as WeeklyCalendarType } from '@/lib/types';
import { useState } from 'react';
import SlotCell from './SlotCell';
import WeekNavigator from './WeekNavigator';

interface Props {
  calendar: WeeklyCalendarType | null;
  loading?: boolean;
  onSlotClick?: (dayIndex: number, slotIndex: number) => void;
}

export default function WeeklyCalendar({ calendar, loading, onSlotClick }: Props) {
  const [expandedDay, setExpandedDay] = useState<number | null>(null);
  const [currentWeekStart, setCurrentWeekStart] = useState<string>(calendar?.weekStart || '');

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin mb-4">⟳</div>
          <div className="text-slate-600">Cargando calendario...</div>
        </div>
      </div>
    );
  }

  if (!calendar) {
    return (
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-8 text-center">
        <div className="text-slate-600">No hay datos de calendario disponibles</div>
      </div>
    );
  }

  const handlePreviousWeek = () => {
    const date = new Date(currentWeekStart);
    date.setDate(date.getDate() - 7);
    setCurrentWeekStart(date.toISOString().split('T')[0]);
  };

  const handleNextWeek = () => {
    const date = new Date(currentWeekStart);
    date.setDate(date.getDate() + 7);
    setCurrentWeekStart(date.toISOString().split('T')[0]);
  };

  const handleToday = () => {
    const today = new Date();
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(today.setDate(diff));
    setCurrentWeekStart(monday.toISOString().split('T')[0]);
  };

  // Verificar si todas las franjas están libres
  const allSlotsAvailable = calendar.days.every(day =>
    day.slots.every(slot => slot.state === 'libre')
  );

  // Desktop view: Grilla completa
  const desktopView = (
    <div className="hidden md:block">
      <WeekNavigator
        weekStart={currentWeekStart}
        onPreviousWeek={handlePreviousWeek}
        onNextWeek={handleNextWeek}
        onToday={handleToday}
      />

      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
        {/* Encabezado con días */}
        <div className="grid grid-cols-6 gap-1 bg-slate-100 p-2 border-b border-slate-200">
          <div className="font-semibold text-slate-900 text-sm text-center p-2">Franja</div>
          {calendar.days.map((day) => (
            <div key={day.date} className="font-semibold text-slate-900 text-sm text-center p-2">
              <div>{day.dayName}</div>
              <div className="text-xs text-slate-600">{day.date}</div>
            </div>
          ))}
        </div>

        {/* Grilla de franjas */}
        {calendar.days[0]?.slots.map((_, slotIndex) => (
          <div key={slotIndex} className="grid grid-cols-6 gap-1 p-2 border-b border-slate-100 last:border-b-0">
            <div className="font-semibold text-slate-900 text-xs text-center p-2">
              {calendar.days[0].slots[slotIndex]?.slotName}
            </div>
            {calendar.days.map((day, dayIndex) => (
              <div key={`${day.date}-${slotIndex}`}>
                <SlotCell
                  slot={day.slots[slotIndex]}
                  onClick={() => onSlotClick?.(dayIndex, slotIndex)}
                />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );

  // Mobile view: Acordeón
  const mobileView = (
    <div className="md:hidden space-y-2">
      <WeekNavigator
        weekStart={currentWeekStart}
        onPreviousWeek={handlePreviousWeek}
        onNextWeek={handleNextWeek}
        onToday={handleToday}
      />

      {calendar.days.map((day, dayIndex) => (
        <div key={day.date} className="bg-white border border-slate-200 rounded-lg overflow-hidden">
          {/* Header del acordeón */}
          <button
            onClick={() => setExpandedDay(expandedDay === dayIndex ? null : dayIndex)}
            className="w-full p-4 flex items-center justify-between hover:bg-slate-50"
          >
            <div className="text-left">
              <div className="font-semibold text-slate-900">{day.dayName}</div>
              <div className="text-xs text-slate-600">{day.date}</div>
            </div>
            <div className={`transition-transform ${expandedDay === dayIndex ? 'rotate-180' : ''}`}>
              ▼
            </div>
          </button>

          {/* Contenido del acordeón */}
          {expandedDay === dayIndex && (
            <div className="border-t border-slate-200 p-4 space-y-3">
              {day.slots.map((slot, slotIndex) => (
                <div key={`${day.date}-${slotIndex}`}>
                  <SlotCell
                    slot={slot}
                    onClick={() => onSlotClick?.(dayIndex, slotIndex)}
                    showDetails
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );

  return (
    <>
      {allSlotsAvailable && (
        <div className="mb-6 p-4 bg-green-50 border border-green-300 rounded-lg text-green-900 text-center">
          ✓ Todas las franjas disponibles para esta semana.
        </div>
      )}
      {desktopView}
      {mobileView}
    </>
  );
}
