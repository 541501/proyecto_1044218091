'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AppLayout } from '@/components/layout/AppLayout';
import { Room, Block } from '@/lib/types';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { EmptyState } from '@/components/ui/EmptyState';
import {
  IconPlus,
  IconPencil,
  IconTrash,
  IconAlert,
  IconCheck,
  IconDot,
} from '@/components/icons';

interface RoomWithBlockInfo extends Room {
  blockName?: string;
}

const TYPE_LABEL: Record<string, string> = {
  salon: 'Salón',
  laboratorio: 'Laboratorio',
  auditorio: 'Auditorio',
  sala_computo: 'Sala de cómputo',
  otro: 'Otro',
};

export default function AdminRoomsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-ink-mute font-mono text-sm uppercase">Cargando…</div>}>
      <AdminRoomsContent />
    </Suspense>
  );
}

function AdminRoomsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [rooms, setRooms] = useState<RoomWithBlockInfo[]>([]);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [selectedBlock, setSelectedBlock] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [toast, setToast] = useState<{ kind: 'ok' | 'warn'; text: string } | null>(null);

  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [deactivateWarning, setDeactivateWarning] = useState<number | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const me = await fetch('/api/auth/me');
        if (!me.ok) return router.replace('/login');
        const userData = (await me.json()).user;
        if (userData?.role !== 'admin') return router.replace('/dashboard');
        setUser(userData);
        const [bRes, rRes] = await Promise.all([fetch('/api/blocks'), fetch('/api/rooms')]);
        if (bRes.ok) setBlocks(await bRes.json());
        if (rRes.ok) setRooms(await rRes.json());
      } finally {
        setLoading(false);
      }
    })();
  }, [router]);

  useEffect(() => {
    if (searchParams.get('created')) setToast({ kind: 'ok', text: 'Salón creado correctamente.' });
    else if (searchParams.get('updated')) setToast({ kind: 'ok', text: 'Salón actualizado.' });
    if (toast) setTimeout(() => setToast(null), 3500);
  }, [searchParams]); // eslint-disable-line

  const handleDeactivateClick = async (room: Room) => {
    setSelectedRoom(room);
    setDeactivateWarning(null);
    setShowDeactivateModal(true);
    try {
      const res = await fetch(`/api/rooms/${room.id}/deactivate`, { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setDeactivateWarning(data.warningCount ?? 0);
      }
    } catch {}
  };

  const handleConfirmDeactivate = async () => {
    if (!selectedRoom) return;
    try {
      const res = await fetch(`/api/rooms/${selectedRoom.id}/deactivate?confirm=true`, {
        method: 'POST',
      });
      if (res.ok) {
        setRooms((prev) => prev.map((r) => (r.id === selectedRoom.id ? { ...r, is_active: false } : r)));
        setShowDeactivateModal(false);
        setSelectedRoom(null);
        setDeactivateWarning(null);
        setToast({ kind: 'warn', text: 'Salón desactivado.' });
        setTimeout(() => setToast(null), 3500);
      }
    } catch {}
  };

  const filtered = selectedBlock ? rooms.filter((r) => r.block_id === selectedBlock) : rooms;

  return (
    <AppLayout role={user?.role || 'admin'} userName={user?.name}>
      <div className="max-w-6xl mx-auto">
        <header className="mb-10 animate-rise">
          <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-wide text-ink-mute mb-3">
            <IconDot size={6} className="text-accent" />
            <span>Inventario · Administración</span>
          </div>
          <div className="flex items-end justify-between flex-wrap gap-4">
            <h1 className="font-display text-5xl md:text-6xl leading-[0.95] text-ink">
              Salones
              <span className="italic text-accent"> académicos</span>
            </h1>
            <Button variant="ink" onClick={() => router.push('/admin/rooms/new')}>
              <IconPlus size={14} />
              Nuevo salón
            </Button>
          </div>
        </header>

        {toast ? (
          <div
            className={[
              'mb-6 px-4 py-3 border-l-2 text-sm inline-flex items-center gap-2.5',
              toast.kind === 'ok' ? 'border-ok bg-ok-bg/60 text-ok' : 'border-warn bg-warn-bg/60 text-warn',
            ].join(' ')}
          >
            <IconCheck size={16} />
            {toast.text}
          </div>
        ) : null}

        {/* Block filter */}
        <div className="border-y border-rule py-3 mb-6 flex flex-wrap gap-1">
          <button
            onClick={() => setSelectedBlock(null)}
            className={[
              'px-3 py-2 border text-sm transition-colors',
              !selectedBlock ? 'bg-ink text-paper border-ink' : 'border-rule text-ink-soft hover:border-ink hover:text-ink',
            ].join(' ')}
          >
            <span className="font-mono text-[11px] uppercase tracking-wide">Todos</span>
          </button>
          {blocks.map((b) => {
            const active = selectedBlock === b.id;
            return (
              <button
                key={b.id}
                onClick={() => setSelectedBlock(b.id)}
                className={[
                  'px-3 py-2 border text-sm transition-colors',
                  active ? 'bg-ink text-paper border-ink' : 'border-rule text-ink-soft hover:border-ink hover:text-ink',
                ].join(' ')}
              >
                <span className="font-mono text-[11px] uppercase tracking-wide">
                  Bloque {b.code}
                </span>
              </button>
            );
          })}
        </div>

        {loading ? (
          <div className="text-center py-12 font-mono text-sm uppercase tracking-wide text-ink-mute">
            Cargando salones…
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            eyebrow="Sin salones"
            title="No hay salones en este filtro"
            description="Crea el primer salón para que aparezca disponible para los docentes."
            action={{ label: 'Crear salón', onClick: () => router.push('/admin/rooms/new') }}
          />
        ) : (
          <div className="border border-rule bg-surface overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-paper-soft border-b border-rule">
                <tr className="text-left text-ink-mute">
                  <Th>Código</Th>
                  <Th>Tipo</Th>
                  <Th>Capacidad</Th>
                  <Th>Equipamiento</Th>
                  <Th>Estado</Th>
                  <Th className="text-right">Acciones</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-rule">
                {filtered.map((room) => (
                  <tr key={room.id} className={room.is_active ? '' : 'bg-paper-soft/40 text-ink-mute'}>
                    <td className="px-4 py-3 font-mono text-ink">{room.code}</td>
                    <td className="px-4 py-3 text-ink-soft">{TYPE_LABEL[room.type] ?? room.type}</td>
                    <td className="px-4 py-3 text-ink-soft font-mono">{room.capacity}</td>
                    <td className="px-4 py-3 text-ink-soft text-xs max-w-xs truncate">
                      {room.equipment || <span className="italic text-ink-mute">—</span>}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={room.is_active ? 'success' : 'default'}>
                        {room.is_active ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="inline-flex items-center gap-1">
                        <button
                          onClick={() => router.push(`/admin/rooms/${room.id}/edit`)}
                          className="p-1.5 text-ink-mute hover:text-brand hover:bg-brand-tint transition-colors"
                          title="Editar"
                        >
                          <IconPencil size={16} />
                        </button>
                        {room.is_active ? (
                          <button
                            onClick={() => handleDeactivateClick(room)}
                            className="p-1.5 text-ink-mute hover:text-bad hover:bg-bad-bg transition-colors"
                            title="Desactivar"
                          >
                            <IconTrash size={16} />
                          </button>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <Modal
          isOpen={showDeactivateModal}
          onClose={() => setShowDeactivateModal(false)}
          title={selectedRoom ? `Desactivar ${selectedRoom.code}` : 'Desactivar salón'}
          eyebrow="Acción irreversible"
          actions={[
            {
              label: 'Desactivar',
              variant: 'danger',
              onClick: handleConfirmDeactivate,
            },
          ]}
        >
          {deactivateWarning !== null && deactivateWarning > 0 ? (
            <div className="flex items-start gap-2.5 px-4 py-3 border-l-2 border-warn bg-warn-bg text-warn text-sm">
              <IconAlert size={16} className="mt-0.5" />
              <span>
                Este salón tiene{' '}
                <strong>{deactivateWarning}</strong>{' '}
                {deactivateWarning === 1 ? 'reserva futura' : 'reservas futuras'} confirmadas. Si lo desactivas, dejará de aparecer en disponibilidad pero las reservas existentes se conservarán.
              </span>
            </div>
          ) : (
            <p>El salón quedará oculto en disponibilidad. Puedes reactivarlo desde la edición.</p>
          )}
        </Modal>
      </div>
    </AppLayout>
  );
}

function Th({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <th
      className={[
        'px-4 py-3 font-mono text-[10px] uppercase tracking-wide font-medium',
        className,
      ].join(' ')}
    >
      {children}
    </th>
  );
}
