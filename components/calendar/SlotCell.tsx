'use client';

import { SlotCell as SlotCellType } from '@/lib/types';

interface Props {
  slot: SlotCellType;
  onClick?: () => void;
}

export default function SlotCell({ slot, onClick }: Props) {
  const isFree = slot.state === 'libre';

  const variants: Record<string, string> = {
    libre:
      'bg-ok-bg border-ok/40 text-ok hover:border-ok hover:bg-ok/15 cursor-pointer',
    ocupada:
      'bg-bad-bg border-bad/40 text-bad cursor-default',
    ocupada_pasada:
      'bg-paper-soft border-rule text-ink-mute cursor-not-allowed line-through',
    pasada:
      'bg-paper-soft border-rule text-ink-mute cursor-not-allowed',
  };

  return (
    <button
      type="button"
      onClick={() => (isFree && onClick ? onClick() : undefined)}
      disabled={!isFree}
      className={[
        'group relative w-full min-h-[80px] border p-3 text-left transition-colors',
        variants[slot.state] || variants.pasada,
      ].join(' ')}
      title={
        slot.reservation
          ? `${slot.reservation.professorName} — ${slot.reservation.subject} (${slot.reservation.groupName})`
          : undefined
      }
    >
      <div className="font-mono text-[10px] uppercase tracking-wide opacity-80">
        {slot.slotName}
      </div>

      {slot.state === 'libre' ? (
        <div className="mt-2 font-display text-base">Libre</div>
      ) : null}

      {slot.state === 'ocupada' && slot.reservation ? (
        <div className="mt-1.5 space-y-0.5">
          <div className="font-display text-[15px] leading-tight line-clamp-2">
            {slot.reservation.subject}
          </div>
          <div className="text-[11px] opacity-80 line-clamp-1">
            {slot.reservation.professorName}
          </div>
        </div>
      ) : null}

      {(slot.state === 'pasada' || slot.state === 'ocupada_pasada') ? (
        <div className="mt-2 font-mono text-[11px] uppercase tracking-wide opacity-75">
          Pasada
        </div>
      ) : null}
    </button>
  );
}
