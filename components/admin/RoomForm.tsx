'use client';

import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/Button';
import {
  IconBookOpen,
  IconLab,
  IconAuditorium,
  IconMonitor,
  IconDoorway,
  IconCheck,
  IconAlert,
} from '@/components/icons';

export type RoomType = 'salon' | 'laboratorio' | 'auditorio' | 'sala_computo' | 'otro';

export interface RoomFormValues {
  block_id: string;
  code: string;
  type: RoomType;
  capacity: number;
  equipment: string;
  is_active: boolean;
}

export interface RoomFormProps {
  mode: 'create' | 'edit';
  initial?: Partial<RoomFormValues>;
  blocks: Array<{ id: string; code: string; name: string }>;
  onSubmit: (values: RoomFormValues) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
  errorMessage?: string | null;
}

const TYPES: Array<{ value: RoomType; label: string; icon: React.ReactNode }> = [
  { value: 'salon', label: 'Salón', icon: <IconBookOpen size={18} /> },
  { value: 'laboratorio', label: 'Laboratorio', icon: <IconLab size={18} /> },
  { value: 'auditorio', label: 'Auditorio', icon: <IconAuditorium size={18} /> },
  { value: 'sala_computo', label: 'Sala de cómputo', icon: <IconMonitor size={18} /> },
  { value: 'otro', label: 'Otro', icon: <IconDoorway size={18} /> },
];

export default function RoomForm({
  mode,
  initial,
  blocks,
  onSubmit,
  onCancel,
  isSubmitting,
  errorMessage,
}: RoomFormProps) {
  const [blockId, setBlockId] = useState(initial?.block_id || blocks[0]?.id || '');
  const [code, setCode] = useState(initial?.code || '');
  const [type, setType] = useState<RoomType>(initial?.type || 'salon');
  const [capacity, setCapacity] = useState<number>(initial?.capacity ?? 30);
  const [equipment, setEquipment] = useState(initial?.equipment || '');
  const [isActive, setIsActive] = useState<boolean>(initial?.is_active ?? true);
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    if (initial?.block_id) setBlockId(initial.block_id);
  }, [initial?.block_id]);

  const selectedBlock = useMemo(
    () => blocks.find((b) => b.id === blockId),
    [blocks, blockId],
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    if (!blockId) return setLocalError('Selecciona un bloque.');
    if (!code.trim()) return setLocalError('Ingresa el código del salón.');
    if (capacity <= 0) return setLocalError('La capacidad debe ser mayor a 0.');

    await onSubmit({
      block_id: blockId,
      code: code.trim(),
      type,
      capacity: Number(capacity),
      equipment: equipment.trim(),
      is_active: isActive,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Error */}
      {(errorMessage || localError) ? (
        <div className="px-4 py-3 border-l-2 border-bad bg-bad-bg text-bad text-sm inline-flex items-center gap-2.5 w-full">
          <IconAlert size={16} />
          <span>{errorMessage || localError}</span>
        </div>
      ) : null}

      {/* Bloque */}
      <fieldset>
        <legend className="font-mono text-[10px] uppercase tracking-wide text-ink-soft mb-3">
          01 · Bloque académico
        </legend>
        <div className="grid grid-cols-3 gap-2">
          {blocks.map((b) => {
            const active = b.id === blockId;
            return (
              <button
                key={b.id}
                type="button"
                onClick={() => setBlockId(b.id)}
                disabled={mode === 'edit'}
                className={[
                  'border p-4 text-left transition-colors disabled:cursor-not-allowed',
                  active
                    ? 'border-ink bg-paper-soft'
                    : 'border-rule hover:border-ink',
                ].join(' ')}
              >
                <div className="font-display text-4xl text-ink leading-none">{b.code}</div>
                <div className="text-xs text-ink-soft mt-1">{b.name}</div>
              </button>
            );
          })}
        </div>
        {mode === 'edit' ? (
          <p className="mt-2 text-[11px] text-ink-mute font-mono uppercase tracking-wide">
            El bloque no se puede cambiar después de creado.
          </p>
        ) : null}
      </fieldset>

      {/* Código + Capacidad */}
      <div className="grid md:grid-cols-[1fr_180px] gap-6">
        <div>
          <label className="block font-mono text-[10px] uppercase tracking-wide text-ink-soft mb-2">
            02 · Código del salón
          </label>
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder={selectedBlock ? `${selectedBlock.code}-101` : 'A-101'}
            maxLength={20}
            className="field text-lg font-mono"
          />
          <p className="mt-1 text-[11px] text-ink-mute">Único dentro del bloque.</p>
        </div>
        <div>
          <label className="block font-mono text-[10px] uppercase tracking-wide text-ink-soft mb-2">
            03 · Capacidad
          </label>
          <input
            type="number"
            min={1}
            max={500}
            value={capacity}
            onChange={(e) => setCapacity(Number(e.target.value))}
            className="field text-lg font-mono"
          />
          <p className="mt-1 text-[11px] text-ink-mute">Personas máx.</p>
        </div>
      </div>

      {/* Tipo */}
      <fieldset>
        <legend className="font-mono text-[10px] uppercase tracking-wide text-ink-soft mb-3">
          04 · Tipo de espacio
        </legend>
        <div className="grid sm:grid-cols-5 gap-2">
          {TYPES.map((t) => {
            const active = type === t.value;
            return (
              <button
                key={t.value}
                type="button"
                onClick={() => setType(t.value)}
                className={[
                  'border p-3 transition-colors text-left',
                  active
                    ? 'border-brand bg-brand text-paper'
                    : 'border-rule text-ink-soft hover:border-ink hover:text-ink',
                ].join(' ')}
              >
                <div className={active ? 'text-paper' : 'text-ink'}>{t.icon}</div>
                <div className="mt-2 text-[12px] uppercase tracking-wide font-mono">
                  {t.label}
                </div>
              </button>
            );
          })}
        </div>
      </fieldset>

      {/* Equipamiento */}
      <div>
        <label className="block font-mono text-[10px] uppercase tracking-wide text-ink-soft mb-2">
          05 · Equipamiento <span className="text-ink-mute">(opcional)</span>
        </label>
        <textarea
          value={equipment}
          onChange={(e) => setEquipment(e.target.value)}
          placeholder="Ej. Videobeam, tablero, aire acondicionado"
          rows={3}
          className="field"
        />
      </div>

      {/* Estado activo (sólo edit) */}
      {mode === 'edit' ? (
        <div>
          <label className="inline-flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="h-4 w-4 accent-ink"
            />
            <span className="text-sm text-ink">Salón activo (visible para reservas)</span>
          </label>
        </div>
      ) : null}

      {/* Actions */}
      <div className="flex gap-3 pt-6 border-t border-rule">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" variant="primary" isLoading={isSubmitting}>
          <IconCheck size={14} />
          {mode === 'create' ? 'Crear salón' : 'Guardar cambios'}
        </Button>
      </div>
    </form>
  );
}
