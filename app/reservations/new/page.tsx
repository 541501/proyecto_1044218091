'use client';

import { Suspense } from 'react';
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/Button';
import { ChevronLeft } from 'lucide-react';

export default function NewReservationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [room, setRoom] = useState<any>(null);
  const [slot, setSlot] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState(searchParams.get('date') || '');

  const [subject, setSubject] = useState('');
  const [groupName, setGroupName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [conflictError, setConflictError] = useState<{
    roomCode: string;
    slotName: string;
    date: string;
    professorName: string;
    subject: string;
  } | null>(null);
  const [user, setUser] = useState<any>(null);

  const roomId = searchParams.get('roomId');
  const slotId = searchParams.get('slotId');

  useEffect(() => {
    const loadData = async () => {
      try {
        // Get user info
        const meRes = await fetch('/api/auth/me');
        if (meRes.ok) {
          const userData = await meRes.json();
          setUser(userData.user);
        }

        // If roomId is provided, fetch room details
        if (roomId) {
          const roomRes = await fetch(`/api/rooms/${roomId}`);
          if (roomRes.ok) {
            const roomData = await roomRes.json();
            setRoom(roomData);
          }
        }

        // If slotId is provided, fetch slot details
        if (slotId) {
          const slotsRes = await fetch('/api/slots');
          if (slotsRes.ok) {
            const slots = await slotsRes.json();
            const foundSlot = slots.find((s: any) => s.id === slotId);
            if (foundSlot) {
              setSlot(foundSlot);
            }
          }
        }
      } catch (err) {
        console.error('Error loading data:', err);
      }
    };

    loadData();
  }, [roomId, slotId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!roomId || !slotId || !selectedDate) {
      setError('Faltan datos de la reserva');
      return;
    }

    if (!subject.trim() || !groupName.trim()) {
      setError('Debes completar todos los campos');
      return;
    }

    setLoading(true);
    setError('');
    setConflictError(null);

    try {
      const res = await fetch('/api/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          room_id: roomId,
          slot_id: slotId,
          reservation_date: selectedDate,
          subject: subject.trim(),
          group_name: groupName.trim()
        })
      });

      if (res.status === 201) {
        // Success - navigate to reservations page
        router.push('/reservations?success=true');
      } else if (res.status === 409) {
        // Conflict
        const data = await res.json();
        const conflict = data.conflict;
        if (conflict) {
          setConflictError({
            roomCode: conflict.roomCode,
            slotName: conflict.slotName,
            date: conflict.date,
            professorName: conflict.professorName,
            subject: conflict.subject
          });
        } else {
          // Otro tipo de conflicto (reglas de negocio)
          setError(data.error || 'Conflicto de reserva');
        }
      } else if (res.status === 400) {
        const data = await res.json();
        setError(data.error || 'Error en los datos de la reserva');
      } else if (res.status === 401) {
        setError('Tu sesión ha expirado. Por favor inicia sesión nuevamente.');
      } else {
        setError('Error al crear la reserva');
      }
    } catch (err) {
      console.error('Error:', err);
      setError('Error al procesar la solicitud');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    router.back();
  };

  // Check if date is today or past
  const isDateInvalid = () => {
    if (!selectedDate) return false;
    const selected = new Date(selectedDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    selected.setHours(0, 0, 0, 0);
    return selected <= today;
  };

  const dateInvalid = isDateInvalid();

  return (
    <AppLayout role={user?.role} userName={user?.name} showSeedBanner>
      <div className="max-w-2xl mx-auto py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4"
          >
            <ChevronLeft size={20} />
            Volver
          </button>
          
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Nueva Reserva</h1>
          <p className="text-slate-600">Completa el formulario para reservar un salón</p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-300 rounded-lg text-red-900">
            {error}
          </div>
        )}

        {/* Conflict Error - Prominent Alert */}
        {conflictError && (
          <div className="mb-6 p-6 bg-red-50 border-l-4 border-red-500 rounded-lg">
            <div className="flex gap-4">
              <div className="flex-shrink-0 mt-0.5">
                <svg className="h-6 w-6 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-red-900 mb-2">Salón no disponible</h3>
                <div className="space-y-2 text-red-800">
                  <div>
                    <span className="font-semibold">Salón:</span> {conflictError.roomCode}
                  </div>
                  <div>
                    <span className="font-semibold">Franja:</span> {conflictError.slotName}
                  </div>
                  <div>
                    <span className="font-semibold">Fecha:</span> {new Date(conflictError.date).toLocaleDateString('es-CO')}
                  </div>
                  <div className="mt-4 pt-4 border-t border-red-200">
                    <div className="text-sm mb-2">
                      <span className="font-semibold">Reservado por:</span> Prof. {conflictError.professorName}
                    </div>
                    <div className="text-sm">
                      <span className="font-semibold">Materia:</span> {conflictError.subject}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-red-200">
              <p className="text-sm text-red-800">
                Para reservar este salón, selecciona otra franja horaria o un salón diferente.
              </p>
              <Button
                onClick={handleBack}
                variant="secondary"
                className="mt-3 border-red-300 text-red-700 hover:bg-red-100"
              >
                Volver a seleccionar
              </Button>
            </div>
          </div>
        )}

        {/* Form */}
        <div className="bg-white border border-slate-200 rounded-lg p-6 mb-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Room, Slot, Date Summary */}
            {room && slot && selectedDate && (
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-3">
                <div>
                  <div className="text-sm text-slate-600">Salón</div>
                  <div className="text-lg font-semibold text-slate-900">{room.code}</div>
                </div>
                <div>
                  <div className="text-sm text-slate-600">Franja</div>
                  <div className="text-lg font-semibold text-slate-900">
                    {slot.name} ({slot.start_time} – {slot.end_time})
                  </div>
                </div>
                <div>
                  <div className="text-sm text-slate-600">Fecha</div>
                  <div className="text-lg font-semibold text-slate-900">
                    {new Date(selectedDate).toLocaleDateString('es-CO', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Subject */}
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">
                Materia *
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Ej: Matemáticas I, Física II"
                maxLength={150}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div className="text-xs text-slate-500 mt-1">{subject.length}/150</div>
            </div>

            {/* Group Name */}
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">
                Grupo *
              </label>
              <input
                type="text"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                placeholder="Ej: 2024-1 Grupo A, Sección 02"
                maxLength={50}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div className="text-xs text-slate-500 mt-1">{groupName.length}/50</div>
            </div>

            {/* Date Validation Warning */}
            {dateInvalid && (
              <div className="p-4 bg-red-50 border border-red-300 rounded-lg text-red-900 text-sm">
                ⚠️ No se pueden reservar franjas del día actual o del pasado
              </div>
            )}

            {/* Submit Button */}
            <div className="flex gap-3">
              <Button
                type="button"
                variant="secondary"
                onClick={handleBack}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={loading || dateInvalid || !subject.trim() || !groupName.trim()}
                className="flex-1"
              >
                {loading ? 'Creando...' : 'Confirmar Reserva'}
              </Button>
            </div>
          </form>
        </div>

        {/* Info */}
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
          <div className="text-sm text-slate-600">
            <div className="font-semibold text-slate-900 mb-2">Información importante:</div>
            <ul className="space-y-1 list-disc list-inside">
              <li>La materia es el nombre de la asignatura</li>
              <li>El grupo identifica la sección o cohort de estudiantes</li>
              <li>Una vez confirmada, la reserva aparecerá en tu lista de reservas</li>
              <li>Puedes cancelar cualquier reserva futura desde tu perfil</li>
            </ul>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
