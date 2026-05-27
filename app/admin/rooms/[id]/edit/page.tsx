'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppLayout } from '@/components/layout/AppLayout';
import RoomForm, { RoomFormValues, RoomType } from '@/components/admin/RoomForm';
import { IconChevronLeft, IconDot } from '@/components/icons';

export default function EditRoomPage({
  params: paramsPromise,
}: {
  params: Promise<{ id: string }>;
}) {
  const params = use(paramsPromise);
  const router = useRouter();

  const [user, setUser] = useState<any>(null);
  const [room, setRoom] = useState<any>(null);
  const [blocks, setBlocks] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const me = await fetch('/api/auth/me', { credentials: 'include' });
      if (!me.ok) return router.replace('/login');
      const userData = (await me.json()).user;
      if (userData?.role !== 'admin') return router.replace('/dashboard');
      setUser(userData);

      const [bRes, rRes] = await Promise.all([
        fetch('/api/blocks', { credentials: 'include' }),
        fetch(`/api/rooms/${params.id}`, { credentials: 'include' }),
      ]);
      if (bRes.ok) setBlocks(await bRes.json());
      if (rRes.ok) setRoom(await rRes.json());
      setLoading(false);
    })();
  }, [params.id, router]);

  const handleSubmit = async (values: RoomFormValues) => {
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch(`/api/rooms/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: values.code,
          type: values.type,
          capacity: values.capacity,
          equipment: values.equipment || undefined,
          is_active: values.is_active,
        }),
      });
      if (res.ok) {
        router.push('/admin/rooms?updated=1');
      } else if (res.status === 409) {
        const data = await res.json();
        setError(data.error || 'Conflicto al actualizar.');
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.error || 'Error al actualizar el salón.');
      }
    } catch {
      setError('Error de red al actualizar el salón.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppLayout role={user?.role || 'admin'} userName={user?.name}>
      <div className="max-w-3xl mx-auto">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wide text-ink-soft hover:text-ink transition-colors mb-8"
        >
          <IconChevronLeft size={14} />
          Salones
        </button>

        <header className="mb-10 animate-rise">
          <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-wide text-ink-mute mb-3">
            <IconDot size={6} className="text-accent" />
            <span>Edición · Inventario</span>
          </div>
          <h1 className="font-display text-5xl md:text-6xl leading-[0.95] text-ink">
            Editar
            <span className="italic text-accent"> {room?.code || 'salón'}</span>
          </h1>
        </header>

        {loading ? (
          <div className="font-mono text-sm uppercase tracking-wide text-ink-mute">
            Cargando salón…
          </div>
        ) : !room ? (
          <div className="font-mono text-sm uppercase tracking-wide text-bad">
            No se encontró el salón solicitado.
          </div>
        ) : (
          <RoomForm
            mode="edit"
            blocks={blocks}
            initial={{
              block_id: room.block_id,
              code: room.code,
              type: room.type as RoomType,
              capacity: room.capacity,
              equipment: room.equipment || '',
              is_active: room.is_active,
            }}
            onSubmit={handleSubmit}
            onCancel={() => router.back()}
            isSubmitting={submitting}
            errorMessage={error}
          />
        )}
      </div>
    </AppLayout>
  );
}
