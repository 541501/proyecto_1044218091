'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AppLayout } from '@/components/layout/AppLayout';
import RoomCard from '@/components/blocks/RoomCard';
import { RoomWithBlock, BlockAvailability } from '@/lib/types';
import { Button } from '@/components/ui/Button';
import { ChevronLeft, Calendar } from 'lucide-react';

export default function BlockDetailsPage({ params }: { params: { blockId: string } }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [rooms, setRooms] = useState<RoomWithBlock[]>([]);
  const [block, setBlock] = useState<any>(null);
  const [availability, setAvailability] = useState<BlockAvailability | null>(null);
  const [selectedDate, setSelectedDate] = useState(searchParams.get('date') || new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        // Get user info
        const meRes = await fetch('/api/auth/me');
        if (meRes.ok) {
          const userData = await meRes.json();
          setUser(userData);
        }

        // Get rooms in block
        const roomsRes = await fetch(`/api/rooms?blockId=${params.blockId}`);
        if (roomsRes.ok) {
          const roomsData = await roomsRes.json();
          setRooms(roomsData);
        }

        // Get block availability
        const availRes = await fetch(`/api/blocks/${params.blockId}/availability?date=${selectedDate}`);
        if (availRes.ok) {
          const availData = await availRes.json();
          setAvailability(availData);
        }

        // Get block info (from first room or API)
        if (roomsRes.ok) {
          const firstRoom = (await roomsRes.json())[0];
          if (firstRoom) {
            setBlock({
              id: params.blockId,
              name: `Bloque ${firstRoom.block_id.substring(0, 8).toUpperCase()}`
            });
          }
        }
      } catch (error) {
        console.error('Error loading block details:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [params.blockId, selectedDate]);

  const handleRoomClick = (roomId: string) => {
    router.push(`/blocks/${params.blockId}/${roomId}?date=${selectedDate}`);
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedDate(e.target.value);
  };

  const handleToday = () => {
    setSelectedDate(new Date().toISOString().split('T')[0]);
  };

  const handleBack = () => {
    router.back();
  };

  // Calcular cuáles salones están disponibles hoy
  const availableRoomIds = new Set<string>();
  if (availability?.availableRooms) {
    // En una implementación real, obtendríamos la lista de salones disponibles
    // Por ahora, marcamos como disponibles los que no tienen reservas
  }

  return (
    <AppLayout role={user?.role || 'profesor'} userName={user?.name} showSeedBanner>
      <div className="max-w-6xl mx-auto">
        {/* Encabezado */}
        <div className="mb-8">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4"
          >
            <ChevronLeft size={20} />
            Volver
          </button>
          
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            {block?.name || `Bloque ${params.blockId}`}
          </h1>
          <p className="text-slate-600">
            {availability && `${availability.availableRooms} de ${availability.totalRooms} salones disponibles`}
          </p>
        </div>

        {/* Selector de fecha */}
        <div className="bg-white border border-slate-200 rounded-lg p-4 mb-6 flex items-center gap-4">
          <Calendar size={20} className="text-slate-600" />
          <input
            type="date"
            value={selectedDate}
            onChange={handleDateChange}
            className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <Button
            variant="secondary"
            onClick={handleToday}
            size="sm"
          >
            Hoy
          </Button>
        </div>

        {/* Grilla de salones */}
        {loading ? (
          <div className="text-center py-12">
            <div className="text-slate-600">Cargando salones...</div>
          </div>
        ) : rooms.length === 0 ? (
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-8 text-center">
            <div className="text-slate-600 mb-4">
              Este bloque aún no tiene salones registrados.
            </div>
            {user?.role === 'admin' && (
              <Button
                onClick={() => router.push(`/admin/rooms?blockId=${params.blockId}`)}
                className="mt-4"
              >
                Agregar Salón
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {rooms.map((room) => (
              <RoomCard
                key={room.id}
                room={room}
                available={room.is_active}
                onClick={() => handleRoomClick(room.id)}
              />
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
