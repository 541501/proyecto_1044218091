/**
 * components/blocks/RoomCard.tsx
 * Tarjeta de salón con disponibilidad
 */

'use client';

import { RoomWithBlock } from '@/lib/types';

interface Props {
  room: RoomWithBlock;
  available?: boolean;
  onClick?: () => void;
}

const getRoomTypeIcon = (type: string): string => {
  const icons: Record<string, string> = {
    'salon': '📚',
    'laboratorio': '🧪',
    'auditorio': '🎤',
    'sala_computo': '💻',
    'otro': '📍'
  };
  return icons[type] || '📍';
};

const getRoomTypeLabel = (type: string): string => {
  const labels: Record<string, string> = {
    'salon': 'Salón',
    'laboratorio': 'Laboratorio',
    'auditorio': 'Auditorio',
    'sala_computo': 'Sala de Cómputo',
    'otro': 'Otro'
  };
  return labels[type] || 'Otro';
};

export default function RoomCard({ room, available, onClick }: Props) {
  const statusColor = available ? 'bg-green-50 border-green-300' : 'bg-red-50 border-red-300';
  const statusBadgeColor = available ? 'bg-green-100 text-green-900' : 'bg-red-100 text-red-900';
  const statusText = available ? 'Libre' : 'Ocupada';

  return (
    <button
      onClick={onClick}
      disabled={!available}
      className={`
        block w-full p-4 bg-white rounded-lg border transition-all
        text-left hover:shadow-md disabled:opacity-60 disabled:cursor-not-allowed
        ${statusColor}
      `}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="text-xl font-bold text-slate-900">{room.code}</div>
          <div className="text-xs text-slate-600 mt-1">
            {getRoomTypeIcon(room.type)} {getRoomTypeLabel(room.type)}
          </div>
        </div>
        <span className={`px-2 py-1 rounded text-xs font-semibold whitespace-nowrap ml-2 ${statusBadgeColor}`}>
          {statusText}
        </span>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex items-center gap-2">
          <span className="text-slate-600">👥 Capacidad:</span>
          <span className="font-semibold text-slate-900">{room.capacity} personas</span>
        </div>
        
        {room.equipment && (
          <div className="text-slate-600 text-xs">
            <span className="font-semibold">Equipamiento:</span> {room.equipment}
          </div>
        )}
      </div>

      {!room.is_active && (
        <div className="mt-3 px-2 py-1 bg-slate-100 border border-slate-300 rounded text-xs text-slate-700">
          ⚠️ Inactivo
        </div>
      )}
    </button>
  );
}
