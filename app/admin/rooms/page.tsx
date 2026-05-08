'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppLayout } from '@/components/layout/AppLayout';
import { Room, Block } from '@/lib/types';
import { Button } from '@/components/ui/Button';
import { Trash2, Edit, Plus } from 'lucide-react';
import { useState as useStateHook } from 'react';

interface RoomWithBlockInfo extends Room {
  blockName?: string;
}

export default function AdminRoomsPage() {
  const router = useRouter();
  
  const [rooms, setRooms] = useState<RoomWithBlockInfo[]>([]);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [selectedBlock, setSelectedBlock] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [deactivateWarning, setDeactivateWarning] = useState<number | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        // Get user info and verify admin role
        const meRes = await fetch('/api/auth/me');
        if (!meRes.ok) {
          router.push('/login');
          return;
        }
        const userData = await meRes.json();
        if (userData.user.role !== 'admin') {
          router.push('/');
          return;
        }
        setUser(userData.user);

        // Get blocks
        const blocksRes = await fetch('/api/blocks');
        if (blocksRes.ok) {
          const blocksData = await blocksRes.json();
          setBlocks(blocksData);
        }

        // Get all rooms
        const roomsRes = await fetch('/api/rooms');
        if (roomsRes.ok) {
          const roomsData = await roomsRes.json();
          setRooms(roomsData);
        }
      } catch (error) {
        console.error('Error loading admin page:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [router]);

  const handleCreateRoom = () => {
    router.push('/admin/rooms/new');
  };

  const handleEditRoom = (roomId: string) => {
    router.push(`/admin/rooms/${roomId}/edit`);
  };

  const handleDeactivateClick = async (room: Room) => {
    setSelectedRoom(room);
    
    try {
      const res = await fetch(`/api/rooms/${room.id}/deactivate`, {
        method: 'POST'
      });
      
      if (res.ok) {
        const data = await res.json();
        setDeactivateWarning(data.warningCount);
        setShowDeactivateModal(true);
      }
    } catch (error) {
      console.error('Error checking deactivate:', error);
    }
  };

  const handleConfirmDeactivate = async () => {
    if (!selectedRoom) return;

    try {
      const res = await fetch(`/api/rooms/${selectedRoom.id}/deactivate?confirm=true`, {
        method: 'POST'
      });
      
      if (res.ok) {
        // Actualizar lista de salones
        setRooms(rooms.map(r => r.id === selectedRoom.id ? { ...r, is_active: false } : r));
        setShowDeactivateModal(false);
        setSelectedRoom(null);
        setDeactivateWarning(null);
      }
    } catch (error) {
      console.error('Error deactivating room:', error);
    }
  };

  const filteredRooms = selectedBlock
    ? rooms.filter(r => r.block_id === selectedBlock)
    : rooms;

  const getRoomTypeLabel = (type: string): string => {
    const labels: Record<string, string> = {
      'salon': 'Salón',
      'laboratorio': 'Laboratorio',
      'auditorio': 'Auditorio',
      'sala_computo': 'Sala de Cómputo',
      'otro': 'Otro'
    };
    return labels[type] || type;
  };

  if (!user || user.role !== 'admin') {
    return (
      <AppLayout role={user?.role} userName={user?.name} showSeedBanner>
        <div className="text-center py-12">
          <div className="text-red-600">Acceso denegado. Solo administradores.</div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout role={user?.role} userName={user?.name} showSeedBanner>
      <div className="max-w-6xl mx-auto">
        {/* Encabezado */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Gestión de Salones</h1>
            <p className="text-slate-600">Administra los salones de los bloques académicos</p>
          </div>
          <Button onClick={handleCreateRoom} className="flex items-center gap-2">
            <Plus size={18} />
            Nuevo Salón
          </Button>
        </div>

        {/* Filtro por bloque */}
        <div className="mb-6 flex gap-2 flex-wrap">
          <button
            onClick={() => setSelectedBlock(null)}
            className={`px-4 py-2 rounded-lg border transition-all ${
              selectedBlock === null
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-slate-900 border-slate-200'
            }`}
          >
            Todos los bloques
          </button>
          {blocks.map(block => (
            <button
              key={block.id}
              onClick={() => setSelectedBlock(block.id)}
              className={`px-4 py-2 rounded-lg border transition-all ${
                selectedBlock === block.id
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-slate-900 border-slate-200'
              }`}
            >
              Bloque {block.code}
            </button>
          ))}
        </div>

        {/* Tabla de salones */}
        {loading ? (
          <div className="text-center py-12">
            <div className="text-slate-600">Cargando salones...</div>
          </div>
        ) : filteredRooms.length === 0 ? (
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-8 text-center">
            <div className="text-slate-600">No hay salones para mostrar</div>
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-slate-100 border-b border-slate-200">
                <tr>
                  <th className="text-left px-6 py-3 font-semibold text-slate-900">Código</th>
                  <th className="text-left px-6 py-3 font-semibold text-slate-900">Tipo</th>
                  <th className="text-left px-6 py-3 font-semibold text-slate-900">Capacidad</th>
                  <th className="text-left px-6 py-3 font-semibold text-slate-900">Equipamiento</th>
                  <th className="text-left px-6 py-3 font-semibold text-slate-900">Estado</th>
                  <th className="text-right px-6 py-3 font-semibold text-slate-900">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredRooms.map(room => (
                  <tr key={room.id} className={room.is_active ? '' : 'bg-slate-50'}>
                    <td className="px-6 py-3 font-semibold text-slate-900">{room.code}</td>
                    <td className="px-6 py-3 text-slate-600">{getRoomTypeLabel(room.type)}</td>
                    <td className="px-6 py-3 text-slate-600">{room.capacity} personas</td>
                    <td className="px-6 py-3 text-slate-600 text-sm">
                      {room.equipment ? room.equipment.substring(0, 30) + (room.equipment.length > 30 ? '...' : '') : '—'}
                    </td>
                    <td className="px-6 py-3">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        room.is_active
                          ? 'bg-green-100 text-green-900'
                          : 'bg-slate-200 text-slate-900'
                      }`}>
                        {room.is_active ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleEditRoom(room.id)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                          title="Editar"
                        >
                          <Edit size={18} />
                        </button>
                        {room.is_active && (
                          <button
                            onClick={() => handleDeactivateClick(room)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                            title="Desactivar"
                          >
                            <Trash2 size={18} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal de confirmación de desactivación */}
      {showDeactivateModal && selectedRoom && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Desactivar Salón</h3>
            
            {deactivateWarning && deactivateWarning > 0 ? (
              <div>
                <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded text-amber-900 text-sm">
                  ⚠️ Advertencia: Hay {deactivateWarning} reserva{deactivateWarning !== 1 ? 's' : ''} futuras confirmada{deactivateWarning !== 1 ? 's' : ''} en este salón.
                </div>
                <div className="text-slate-600 mb-6 text-sm">
                  ¿Deseas desactivar este salón de todas formas?
                </div>
              </div>
            ) : (
              <div className="text-slate-600 mb-6">
                ¿Deseas desactivar el salón <span className="font-semibold">{selectedRoom.code}</span>?
              </div>
            )}
            
            <div className="flex gap-3 justify-end">
              <Button
                variant="secondary"
                onClick={() => setShowDeactivateModal(false)}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleConfirmDeactivate}
                className="bg-red-600 hover:bg-red-700"
              >
                Desactivar
              </Button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
