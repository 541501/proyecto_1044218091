/**
 * components/blocks/BlockCard.tsx
 * Tarjeta de bloque con disponibilidad
 */

'use client';

import { BlockWithAvailability } from '@/lib/types';
import { getBlockCardBorderColor } from '@/lib/availabilityUtils';

interface Props {
  block: BlockWithAvailability;
  selected?: boolean;
  onClick?: () => void;
}

export default function BlockCard({ block, selected, onClick }: Props) {
  const availability = block.availability;
  if (!availability) return null;

  const borderColor = getBlockCardBorderColor(availability);
  const percentage = availability.availabilityPercentage;

  let badgeText = '';
  let badgeColor = '';
  
  if (percentage === 0) {
    badgeText = 'Lleno';
    badgeColor = 'bg-red-100 text-red-900';
  } else if (percentage <= 33) {
    badgeText = 'Pocos libres';
    badgeColor = 'bg-amber-100 text-amber-900';
  } else {
    badgeText = 'Disponible';
    badgeColor = 'bg-green-100 text-green-900';
  }

  return (
    <button
      onClick={onClick}
      className={`
        block w-full p-6 bg-white rounded-lg border-2 transition-all
        text-left hover:shadow-md
        ${selected ? 'ring-2 ring-blue-500' : ''}
        ${borderColor}
      `}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="text-5xl font-bold text-slate-900">{block.code}</div>
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${badgeColor}`}>
          {badgeText}
        </span>
      </div>

      <div className="text-slate-600 mb-4">{block.name}</div>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-slate-600">Salones:</span>
          <span className="font-semibold text-slate-900">
            {availability.availableRooms} / {availability.totalRooms}
          </span>
        </div>
        <div className="w-full bg-slate-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all ${
              percentage === 0 ? 'bg-red-500' :
              percentage <= 33 ? 'bg-amber-500' :
              'bg-green-500'
            }`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    </button>
  );
}
