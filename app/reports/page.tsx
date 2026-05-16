'use client';

import { useEffect, useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/Button';
import { Download, RefreshCw } from 'lucide-react';

interface Block {
  id: string;
  name: string;
  code: string;
}

interface ReportRow {
  fecha: string;
  bloque: string;
  salon: string;
  codigo: string;
  franja: string;
  profesor: string;
  materia: string;
  grupo: string;
  estado: string;
}

export default function ReportsPage() {
  const [user, setUser] = useState<any>(null);
  const [blocks, setBlocks] = useState<Block[]>([]);
  
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [selectedBlockId, setSelectedBlockId] = useState('');
  
  const [reportData, setReportData] = useState<ReportRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState('');

  // Initialize dates (today and 7 days ago)
  useEffect(() => {
    const today = new Date();
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    setToDate(today.toISOString().split('T')[0]);
    setFromDate(weekAgo.toISOString().split('T')[0]);
  }, []);

  // Load user and blocks
  useEffect(() => {
    const loadData = async () => {
      try {
        // Get user
        const meRes = await fetch('/api/auth/me');
        if (meRes.ok) {
          const userData = await meRes.json();
          setUser(userData.user);
        }

        // Get blocks
        const blocksRes = await fetch('/api/blocks');
        if (blocksRes.ok) {
          const blocksData = await blocksRes.json();
          setBlocks(blocksData);
        }
      } catch (err) {
        console.error('Error loading data:', err);
      }
    };

    loadData();
  }, []);

  const handleGenerateReport = async () => {
    setError('');
    setReportData([]);

    if (!fromDate || !toDate) {
      setError('Por favor selecciona ambas fechas');
      return;
    }

    if (new Date(fromDate) > new Date(toDate)) {
      setError('La fecha inicio no puede ser posterior a la fecha fin');
      return;
    }

    setLoading(true);

    try {
      const params = new URLSearchParams();
      params.append('from', fromDate);
      params.append('to', toDate);
      params.append('format', 'json');
      
      if (selectedBlockId) {
        params.append('blockId', selectedBlockId);
      }

      const response = await fetch(`/api/reports/occupancy?${params.toString()}`);

      if (response.status === 404) {
        setError('No hay datos disponibles para el período seleccionado');
        setReportData([]);
      } else if (response.ok) {
        const data = await response.json();
        setReportData(data);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Error al generar el reporte');
      }
    } catch (err: any) {
      setError('Error al cargar el reporte: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadCSV = async () => {
    setDownloading(true);

    try {
      const params = new URLSearchParams();
      params.append('from', fromDate);
      params.append('to', toDate);
      params.append('format', 'csv');
      
      if (selectedBlockId) {
        params.append('blockId', selectedBlockId);
      }

      const response = await fetch(`/api/reports/occupancy?${params.toString()}`);

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `reporte-ocupacion-${fromDate}-${toDate}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        setError('Error al descargar el CSV');
      }
    } catch (err: any) {
      setError('Error al descargar: ' + err.message);
    } finally {
      setDownloading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <AppLayout role={user?.role || 'profesor'} userName={user?.name} showSeedBanner>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Reporte de Ocupación</h1>
          <p className="text-slate-600">
            Genera reportes de uso de salones por período y bloque
          </p>
        </div>

        {/* Filters Card */}
        <div className="bg-white border border-slate-200 rounded-lg p-6 mb-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Filtros</h2>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {/* From Date */}
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">
                Fecha Inicio
              </label>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* To Date */}
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">
                Fecha Fin
              </label>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Block Filter */}
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">
                Bloque
              </label>
              <select
                value={selectedBlockId}
                onChange={(e) => setSelectedBlockId(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todos los bloques</option>
                {blocks.map((block) => (
                  <option key={block.id} value={block.id}>
                    {block.name} ({block.code})
                  </option>
                ))}
              </select>
            </div>

            {/* Generate Button */}
            <div className="flex items-end">
              <Button
                onClick={handleGenerateReport}
                disabled={loading}
                className="w-full"
              >
                {loading ? (
                  <>
                    <RefreshCw size={16} className="mr-2 animate-spin" />
                    Generando...
                  </>
                ) : (
                  <>
                    <RefreshCw size={16} className="mr-2" />
                    Generar Reporte
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-300 rounded-lg text-red-900">
              {error}
            </div>
          )}
        </div>

        {/* Preview Table */}
        {reportData.length > 0 && (
          <>
            {/* Download Button */}
            <div className="mb-6 flex gap-2">
              <Button
                onClick={handleDownloadCSV}
                disabled={downloading}
                className="bg-green-600 hover:bg-green-700"
              >
                {downloading ? (
                  <>
                    <RefreshCw size={16} className="mr-2 animate-spin" />
                    Descargando...
                  </>
                ) : (
                  <>
                    <Download size={16} className="mr-2" />
                    Descargar CSV
                  </>
                )}
              </Button>
              <span className="text-slate-600 text-sm self-center">
                {reportData.length} registros encontrados
              </span>
            </div>

            {/* Table */}
            <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">
                        Fecha
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">
                        Bloque
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">
                        Salón
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">
                        Código
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">
                        Franja
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">
                        Profesor
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">
                        Materia
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">
                        Grupo
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">
                        Estado
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.map((row, idx) => (
                      <tr key={idx} className="border-b border-slate-200 hover:bg-slate-50">
                        <td className="px-4 py-3 text-sm text-slate-900">
                          {formatDate(row.fecha)}
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-900">{row.bloque}</td>
                        <td className="px-4 py-3 text-sm text-slate-900">{row.salon}</td>
                        <td className="px-4 py-3 text-sm font-semibold text-slate-900">
                          {row.codigo}
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-900">{row.franja}</td>
                        <td className="px-4 py-3 text-sm text-slate-900">{row.profesor}</td>
                        <td className="px-4 py-3 text-sm text-slate-900">{row.materia}</td>
                        <td className="px-4 py-3 text-sm text-slate-900">{row.grupo}</td>
                        <td className="px-4 py-3 text-sm">
                          <span className="inline-block px-2 py-1 rounded text-xs font-semibold bg-green-100 text-green-900">
                            {row.estado}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* Empty State */}
        {reportData.length === 0 && !loading && !error && (
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-12 text-center">
            <div className="text-slate-600">
              Selecciona fechas y haz clic en &quot;Generar Reporte&quot; para ver los datos
            </div>
          </div>
        )}

        {/* No Data After Generation */}
        {reportData.length === 0 && !loading && error === '' && (fromDate && toDate) && (
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-12 text-center">
            <div className="text-slate-600">
              No hay reservas confirmadas en el período seleccionado. No se puede generar el reporte.
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
