'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppLayout } from '@/components/layout/AppLayout';
import BlockCard from '@/components/blocks/BlockCard';
import { BlockWithAvailability } from '@/lib/types';
import { Button } from '@/components/ui/Button';
import { Calendar } from 'lucide-react';

export default function BlocksPage() {
  const router = useRouter();
  const [blocks, setBlocks] = useState<BlockWithAvailability[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Get user info
        const meRes = await fetch('/api/auth/me');
        if (meRes.ok) {
          const userData = await meRes.json();
          setUser(userData);
        }

        // Get blocks with availability
        const blocksRes = await fetch(`/api/blocks?date=${selectedDate}`);
        if (blocksRes.ok) {
          const blocksData = await blocksRes.json();
          setBlocks(blocksData);
        }
      } catch (error) {
        console.error('Error loading blocks:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [selectedDate]);

  const handleBlockClick = (blockId: string) => {
    router.push(`/blocks/${blockId}?date=${selectedDate}`);
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedDate(e.target.value);
  };

  const handleToday = () => {
    setSelectedDate(new Date().toISOString().split('T')[0]);
  };

  return (
    <AppLayout role={user?.role} userName={user?.name} showSeedBanner>
      <div className="max-w-6xl mx-auto">
        {/* Encabezado */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Bloques Académicos</h1>
          <p className="text-slate-600">Selecciona un bloque para ver los salones disponibles</p>
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

        {/* Grilla de bloques */}
        {loading ? (
          <div className="text-center py-12">
            <div className="text-slate-600">Cargando bloques...</div>
          </div>
        ) : blocks.length === 0 ? (
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-8 text-center">
            <div className="text-slate-600">No hay bloques disponibles</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {blocks.map((block) => (
              <BlockCard
                key={block.id}
                block={block}
                onClick={() => handleBlockClick(block.id)}
              />
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
