'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AppLayout } from '@/components/layout/AppLayout';
import WeeklyCalendar from '@/components/calendar/WeeklyCalendar';
import { WeeklyCalendar as WeeklyCalendarType } from '@/lib/types';
import { Button } from '@/components/ui/Button';
import { ChevronLeft } from 'lucide-react';

export default function RoomDetailsPage({ 
  params 
}: { 
  params: { blockId: string; roomId: string } 
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [calendar, setCalendar] = useState<WeeklyCalendarType | null>(null);
  const [room, setRoom] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  const selectedDate = searchParams.get('date') || new Date().toISOString().split('T')[0];
  
  // Calcular Monday de la semana actual
  const getMonday = (dateStr: string) => {
    const date = new Date(dateStr);
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(date.setDate(diff));
    return monday.toISOString().split('T')[0];
  };

  const weekStart = getMonday(selectedDate);

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

        // Get room info
        const roomRes = await fetch(`/api/rooms/${params.roomId}`);
        if (roomRes.ok) {
          const roomData = await roomRes.json();
          setRoom(roomData);
        }

        // Get weekly calendar
        const calendarRes = await fetch(`/api/rooms/${params.roomId}/calendar?weekStart=${weekStart}`);
        if (calendarRes.ok) {
          const calendarData = await calendarRes.json();
          setCalendar(calendarData);
        }
      } catch (error) {
        console.error('Error loading room details:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [params.roomId, weekStart]);

  const handleSlotClick = (dayIndex: number, slotIndex: number) => {
    if (!calendar) return;

    const day = calendar.days[dayIndex];
    const slot = day.slots[slotIndex];

    // Solo permitir click en slots libres
    if (slot.state === 'libre') {
      // Navegar a la página de crear reserva con parámetros pre-llenados
      const reservationDate = day.date;
      router.push(
        `/reservations/new?roomId=${params.roomId}&slotId=${slot.slotId}&date=${reservationDate}`
      );
    }
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <AppLayout role={user?.role} userName={user?.name} showSeedBanner>
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
            {room?.code || 'Salón'}
          </h1>
          <div className="flex gap-4 text-slate-600">
            <div>
              <span className="font-semibold">Tipo:</span> {room?.type || '—'}
            </div>
            <div>
              <span className="font-semibold">Capacidad:</span> {room?.capacity || '—'} personas
            </div>
          </div>
          {room?.equipment && (
            <div className="text-slate-600 mt-2">
              <span className="font-semibold">Equipamiento:</span> {room.equipment}
            </div>
          )}
        </div>

        {/* Calendario */}
        {loading ? (
          <div className="text-center py-12">
            <div className="text-slate-600">Cargando calendario...</div>
          </div>
        ) : (
          <WeeklyCalendar
            calendar={calendar}
            loading={loading}
            onSlotClick={handleSlotClick}
          />
        )}

        {/* Leyenda */}
        <div className="mt-8 bg-slate-50 border border-slate-200 rounded-lg p-4">
          <div className="text-sm font-semibold text-slate-900 mb-3">Leyenda:</div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded border-2 border-green-300 bg-green-50"></div>
              <span className="text-sm text-slate-600">Libre</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded border-2 border-red-300 bg-red-50"></div>
              <span className="text-sm text-slate-600">Ocupada</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded border-2 border-slate-300 bg-slate-100"></div>
              <span className="text-sm text-slate-600">Pasada</span>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
