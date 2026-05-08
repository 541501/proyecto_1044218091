/**
 * components/calendar/WeekNavigator.tsx
 * Navegación de semanas para el calendario
 */

'use client';

import { Button } from '@/components/ui/Button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Props {
  weekStart: string;
  onPreviousWeek: () => void;
  onNextWeek: () => void;
  onToday: () => void;
}

export default function WeekNavigator({
  weekStart,
  onPreviousWeek,
  onNextWeek,
  onToday
}: Props) {
  const startDate = new Date(weekStart);
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + 4); // Friday of same week

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('es-CO', { day: 'numeric', month: 'short' });
  };

  const isCurrentWeek = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const start = new Date(weekStart);
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(end.getDate() + 5);

    return today >= start && today < end;
  };

  return (
    <div className="flex items-center justify-between bg-white p-4 rounded-lg border border-slate-200 mb-6">
      <Button
        variant="secondary"
        size="sm"
        onClick={onPreviousWeek}
        className="flex items-center gap-2"
      >
        <ChevronLeft size={18} />
        Anterior
      </Button>

      <div className="text-center">
        <div className="font-semibold text-slate-900">
          Semana del {formatDate(startDate)} al {formatDate(endDate)}
        </div>
        <div className="text-xs text-slate-500 mt-1">
          {isCurrentWeek() ? '(Semana actual)' : ''}
        </div>
      </div>

      <div className="flex gap-2">
        {!isCurrentWeek() && (
          <Button
            variant="secondary"
            size="sm"
            onClick={onToday}
          >
            Hoy
          </Button>
        )}
        <Button
          variant="secondary"
          size="sm"
          onClick={onNextWeek}
          className="flex items-center gap-2"
        >
          Siguiente
          <ChevronRight size={18} />
        </Button>
      </div>
    </div>
  );
}
