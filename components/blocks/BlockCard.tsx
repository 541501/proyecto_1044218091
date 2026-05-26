'use client';

import { BlockWithAvailability } from '@/lib/types';
import { IconArrowRight, IconDot } from '@/components/icons';
import { Badge } from '@/components/ui/Badge';

interface Props {
  block: BlockWithAvailability;
  selected?: boolean;
  onClick?: () => void;
}

export default function BlockCard({ block, selected, onClick }: Props) {
  const availability = block.availability;
  if (!availability) return null;

  const percentage = availability.availabilityPercentage;
  let status: 'success' | 'warning' | 'danger' = 'success';
  let label = 'Disponible';
  if (percentage === 0) {
    status = 'danger';
    label = 'Lleno';
  } else if (percentage <= 33) {
    status = 'warning';
    label = 'Pocos libres';
  }

  return (
    <button
      onClick={onClick}
      className={[
        'group block w-full text-left bg-surface border border-rule transition-colors',
        'hover:border-ink',
        selected ? 'border-ink ring-1 ring-ink' : '',
      ].join(' ')}
    >
      {/* Display letter */}
      <div className="relative px-7 pt-7">
        <div className="font-mono text-[11px] uppercase tracking-wide text-ink-mute">
          Bloque
        </div>
        <div className="flex items-baseline gap-3 mt-1">
          <span className="font-display text-[6rem] leading-[0.85] text-ink">
            {block.code}
          </span>
          <IconDot size={6} className="text-accent self-end mb-3" />
        </div>
        <div className="mt-3 font-display text-xl text-ink-soft italic">
          {block.name}
        </div>
      </div>

      <div className="rule mx-7 mt-6" />

      {/* Stats */}
      <div className="px-7 py-5">
        <div className="flex items-baseline justify-between mb-3">
          <Badge variant={status}>{label}</Badge>
          <span className="font-mono text-[12px] text-ink-mute">
            <span className="text-ink font-medium">{availability.availableRooms}</span>
            <span className="mx-1">/</span>
            {availability.totalRooms} libres
          </span>
        </div>

        {/* Progress bar — thin editorial rule */}
        <div className="h-px bg-rule relative">
          <div
            className={`absolute inset-y-0 left-0 h-px ${
              status === 'danger'
                ? 'bg-bad'
                : status === 'warning'
                ? 'bg-warn'
                : 'bg-ok'
            }`}
            style={{ width: `${100 - percentage}%` }}
          />
        </div>

        <div className="flex items-center justify-between mt-4">
          <span className="font-mono text-[11px] uppercase tracking-wide text-ink-mute">
            Ver salones
          </span>
          <IconArrowRight
            size={16}
            className="text-ink-mute group-hover:text-ink group-hover:translate-x-1 transition-all"
          />
        </div>
      </div>
    </button>
  );
}
