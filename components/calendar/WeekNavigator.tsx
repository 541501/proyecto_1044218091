'use client';

import { IconChevronLeft, IconChevronRight } from '@/components/icons';

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
  onToday,
}: Props) {
  const startDate = new Date(weekStart);
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + 4);

  const fmt = (d: Date) => d.toLocaleDateString('es-CO', { day: 'numeric', month: 'short' });

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
    <div className="flex flex-wrap items-center justify-between gap-3 border-y border-rule py-3 mb-6">
      <div className="flex items-center gap-3">
        <div>
          <div className="font-mono text-[10px] uppercase tracking-wide text-ink-mute">
            Semana
          </div>
          <div className="font-display text-xl text-ink leading-tight">
            {fmt(startDate)} <span className="text-ink-mute">→</span> {fmt(endDate)}
          </div>
        </div>
        {isCurrentWeek() ? (
          <span className="font-mono text-[10px] uppercase tracking-wide text-accent border border-accent/40 bg-accent-soft px-2 py-0.5">
            Actual
          </span>
        ) : null}
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={onPreviousWeek}
          className="h-9 px-3 inline-flex items-center gap-1.5 border border-rule text-ink-soft hover:border-ink hover:text-ink transition-colors"
        >
          <IconChevronLeft size={14} />
          <span className="font-mono text-[11px] uppercase tracking-wide">Anterior</span>
        </button>
        {!isCurrentWeek() ? (
          <button
            onClick={onToday}
            className="h-9 px-3 inline-flex items-center border border-rule text-ink-soft hover:border-ink hover:text-ink transition-colors font-mono text-[11px] uppercase tracking-wide"
          >
            Hoy
          </button>
        ) : null}
        <button
          onClick={onNextWeek}
          className="h-9 px-3 inline-flex items-center gap-1.5 border border-rule text-ink-soft hover:border-ink hover:text-ink transition-colors"
        >
          <span className="font-mono text-[11px] uppercase tracking-wide">Siguiente</span>
          <IconChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}
