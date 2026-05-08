/**
 * components/calendar/SlotCell.tsx
 * Celda individual de una franja horaria en el calendario semanal
 * Estados: libre (verde), ocupada (roja), pasada (gris)
 */

'use client';

import { SlotCell as SlotCellType } from '@/lib/types';
import { useState } from 'react';

interface Props {
  slot: SlotCellType;
  onClick?: () => void;
  showDetails?: boolean;
}

export default function SlotCell({ slot, onClick, showDetails }: Props) {
  const [showTooltip, setShowTooltip] = useState(false);

  const isClickable = slot.state === 'libre';
  const isPast = slot.state === 'pasada' || slot.state === 'ocupada_pasada';

  const baseStyles = `
    p-3 rounded-lg border transition-all cursor-pointer
    text-center text-sm font-medium
    min-h-[80px] flex items-center justify-center
  `;

  let colorStyles = '';
  let textContent = slot.slotName;

  switch (slot.state) {
    case 'libre':
      colorStyles = 'bg-green-50 border-green-300 text-green-900 hover:bg-green-100';
      break;
    case 'ocupada':
      colorStyles = 'bg-red-50 border-red-300 text-red-900 cursor-default';
      textContent = '• OCUPADA •';
      break;
    case 'ocupada_pasada':
    case 'pasada':
      colorStyles = 'bg-slate-100 border-slate-300 text-slate-500 cursor-default';
      textContent = 'PASADA';
      break;
  }

  const handleClick = () => {
    if (isClickable && onClick) {
      onClick();
    }
  };

  return (
    <div
      className={`${baseStyles} ${colorStyles} ${isClickable ? '' : 'cursor-not-allowed'}`}
      onClick={handleClick}
      onMouseEnter={() => slot.reservation && setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      role="button"
      tabIndex={isClickable ? 0 : -1}
    >
      <div>
        <div className="font-semibold">{slot.slotName}</div>
        
        {slot.state === 'ocupada' && slot.reservation && (
          <>
            <div className="text-xs mt-1 font-normal">
              {slot.reservation.professorName}
            </div>
            <div className="text-xs font-normal opacity-75">
              {slot.reservation.subject}
            </div>
          </>
        )}

        {/* Tooltip en desktop */}
        {showTooltip && slot.reservation && (
          <div className="absolute z-10 mt-2 bg-slate-900 text-white px-3 py-2 rounded text-xs whitespace-nowrap">
            <div className="font-semibold">{slot.reservation.professorName}</div>
            <div>{slot.reservation.subject}</div>
            <div>Grupo: {slot.reservation.groupName}</div>
          </div>
        )}
      </div>
    </div>
  );
}
