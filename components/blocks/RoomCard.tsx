'use client';

import { RoomWithBlock } from '@/lib/types';
import { Badge } from '@/components/ui/Badge';
import {
  IconArrowRight,
  IconUsers,
  IconBookOpen,
  IconLab,
  IconAuditorium,
  IconMonitor,
  IconDoorway,
} from '@/components/icons';

interface Props {
  room: RoomWithBlock;
  available?: boolean;
  onClick?: () => void;
}

const TYPE: Record<string, { label: string; icon: React.ReactNode }> = {
  salon: { label: 'Salón', icon: <IconBookOpen size={16} /> },
  laboratorio: { label: 'Laboratorio', icon: <IconLab size={16} /> },
  auditorio: { label: 'Auditorio', icon: <IconAuditorium size={16} /> },
  sala_computo: { label: 'Sala de cómputo', icon: <IconMonitor size={16} /> },
  otro: { label: 'Otro', icon: <IconDoorway size={16} /> },
};

export default function RoomCard({ room, available, onClick }: Props) {
  const meta = TYPE[room.type] ?? TYPE.otro;
  const status = available
    ? { label: 'Libre', variant: 'success' as const }
    : { label: 'Ocupada', variant: 'danger' as const };

  return (
    <button
      onClick={onClick}
      disabled={!available}
      className={[
        'group block w-full text-left bg-surface border border-rule transition-colors',
        'hover:border-ink disabled:opacity-50 disabled:cursor-not-allowed',
      ].join(' ')}
    >
      <div className="px-5 pt-5 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="font-mono text-[11px] uppercase tracking-wide text-ink-mute">
            {meta.label}
          </div>
          <div className="font-display text-3xl text-ink leading-tight mt-1 truncate">
            {room.code}
          </div>
        </div>
        <Badge variant={status.variant}>{status.label}</Badge>
      </div>

      <div className="rule mx-5 mt-5" />

      <div className="px-5 py-4 space-y-2">
        <div className="flex items-center gap-2.5 text-sm text-ink-soft">
          <IconUsers size={14} className="text-ink-mute" />
          <span>
            <span className="text-ink font-medium">{room.capacity}</span> personas
          </span>
        </div>
        <div className="flex items-center gap-2.5 text-sm text-ink-soft">
          <span className="text-ink-mute">{meta.icon}</span>
          <span className="line-clamp-1">
            {room.equipment || <span className="italic text-ink-mute">Sin equipamiento</span>}
          </span>
        </div>
      </div>

      <div className="px-5 pb-4 flex items-center justify-between">
        <span className="font-mono text-[11px] uppercase tracking-wide text-ink-mute">
          {available ? 'Ver calendario' : 'No disponible'}
        </span>
        {available ? (
          <IconArrowRight
            size={16}
            className="text-ink-mute group-hover:text-ink group-hover:translate-x-1 transition-all"
          />
        ) : null}
      </div>
    </button>
  );
}
