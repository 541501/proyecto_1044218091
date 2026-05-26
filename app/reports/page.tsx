'use client';

import { useEffect, useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import {
  IconDot,
  IconDownload,
  IconChart,
  IconCalendar,
  IconAlert,
  IconArrowRight,
} from '@/components/icons';

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
  const [hasGenerated, setHasGenerated] = useState(false);

  useEffect(() => {
    const today = new Date();
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    setToDate(today.toISOString().split('T')[0]);
    setFromDate(weekAgo.toISOString().split('T')[0]);
  }, []);

  useEffect(() => {
    (async () => {
      const meRes = await fetch('/api/auth/me');
      if (meRes.ok) setUser((await meRes.json()).user);
      const b = await fetch('/api/blocks');
      if (b.ok) setBlocks(await b.json());
    })();
  }, []);

  const handleGenerate = async () => {
    setError('');
    setReportData([]);
    setHasGenerated(false);
    if (!fromDate || !toDate) return setError('Selecciona ambas fechas.');
    if (new Date(fromDate) > new Date(toDate)) return setError('La fecha inicio no puede ser posterior a la fin.');

    setLoading(true);
    try {
      const p = new URLSearchParams({ from: fromDate, to: toDate, format: 'json' });
      if (selectedBlockId) p.set('blockId', selectedBlockId);
      const res = await fetch(`/api/reports/occupancy?${p.toString()}`);
      if (res.status === 404) {
        setHasGenerated(true);
      } else if (res.ok) {
        setReportData(await res.json());
        setHasGenerated(true);
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.error || 'Error al generar el reporte');
      }
    } catch (e: any) {
      setError('Error: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const p = new URLSearchParams({ from: fromDate, to: toDate, format: 'csv' });
      if (selectedBlockId) p.set('blockId', selectedBlockId);
      const res = await fetch(`/api/reports/occupancy?${p.toString()}`);
      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ocupacion-${fromDate}-${toDate}.csv`;
        document.body.appendChild(a);
        a.click();
        URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        setError('Error al descargar el CSV.');
      }
    } finally {
      setDownloading(false);
    }
  };

  const fmtDate = (s: string) =>
    new Date(s).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });

  return (
    <AppLayout role={user?.role || 'profesor'} userName={user?.name}>
      <div className="max-w-7xl mx-auto">
        <header className="mb-10 animate-rise">
          <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-wide text-ink-mute mb-3">
            <IconDot size={6} className="text-accent" />
            <span>Reportería · Ocupación</span>
          </div>
          <h1 className="font-display text-5xl md:text-6xl leading-[0.95] text-ink">
            Reporte de
            <span className="italic text-accent"> ocupación</span>
          </h1>
          <p className="mt-4 max-w-xl text-ink-soft text-[15px] leading-relaxed">
            Genera consolidados por período y bloque, exportables a CSV para análisis externo.
          </p>
        </header>

        {/* Filters */}
        <div className="border border-rule bg-surface p-6 mb-8">
          <div className="font-mono text-[10px] uppercase tracking-wide text-ink-mute mb-4 inline-flex items-center gap-2">
            <IconChart size={12} />
            Parámetros del reporte
          </div>
          <div className="grid md:grid-cols-4 gap-5 items-end">
            <div>
              <label className="block font-mono text-[10px] uppercase tracking-wide text-ink-soft mb-2">
                Desde
              </label>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="field"
              />
            </div>
            <div>
              <label className="block font-mono text-[10px] uppercase tracking-wide text-ink-soft mb-2">
                Hasta
              </label>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="field"
              />
            </div>
            <div>
              <label className="block font-mono text-[10px] uppercase tracking-wide text-ink-soft mb-2">
                Bloque
              </label>
              <select
                value={selectedBlockId}
                onChange={(e) => setSelectedBlockId(e.target.value)}
                className="field"
              >
                <option value="">Todos</option>
                {blocks.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>
            <Button variant="ink" onClick={handleGenerate} isLoading={loading}>
              <IconArrowRight size={14} />
              Generar reporte
            </Button>
          </div>
        </div>

        {error ? (
          <div className="mb-6 px-4 py-3 border-l-2 border-bad bg-bad-bg text-bad text-sm inline-flex items-center gap-2.5">
            <IconAlert size={16} />
            {error}
          </div>
        ) : null}

        {hasGenerated && reportData.length > 0 ? (
          <>
            <div className="flex items-end justify-between mb-4 border-y border-rule py-3">
              <div className="flex items-center gap-4 text-sm">
                <IconCalendar size={16} className="text-ink-soft" />
                <span className="font-mono text-[12px] text-ink-soft uppercase tracking-wide">
                  {fmtDate(fromDate)} → {fmtDate(toDate)}
                </span>
                <Badge variant="info">{reportData.length} registros</Badge>
              </div>
              <Button variant="secondary" onClick={handleDownload} isLoading={downloading}>
                <IconDownload size={14} />
                Descargar CSV
              </Button>
            </div>

            <div className="border border-rule bg-surface overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-paper-soft border-b border-rule">
                    <tr className="text-left text-ink-mute">
                      <Th>Fecha</Th>
                      <Th>Bloque</Th>
                      <Th>Salón</Th>
                      <Th>Código</Th>
                      <Th>Franja</Th>
                      <Th>Profesor</Th>
                      <Th>Materia</Th>
                      <Th>Grupo</Th>
                      <Th>Estado</Th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-rule">
                    {reportData.map((row, idx) => (
                      <tr key={idx}>
                        <td className="px-3 py-2.5 font-mono text-[11px] text-ink-soft whitespace-nowrap">
                          {fmtDate(row.fecha)}
                        </td>
                        <td className="px-3 py-2.5 text-ink-soft">{row.bloque}</td>
                        <td className="px-3 py-2.5 text-ink-soft">{row.salon}</td>
                        <td className="px-3 py-2.5 font-mono text-ink">{row.codigo}</td>
                        <td className="px-3 py-2.5 text-ink-soft">{row.franja}</td>
                        <td className="px-3 py-2.5 text-ink-soft">{row.profesor}</td>
                        <td className="px-3 py-2.5 text-ink">{row.materia}</td>
                        <td className="px-3 py-2.5 font-mono text-[12px] text-ink-soft">
                          {row.grupo}
                        </td>
                        <td className="px-3 py-2.5">
                          <Badge variant="success">{row.estado}</Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        ) : null}

        {!loading && !error && (!hasGenerated || reportData.length === 0) ? (
          <EmptyState
            eyebrow={hasGenerated ? 'Sin datos en el rango' : 'Sin generar'}
            title={
              hasGenerated
                ? 'No hay reservas confirmadas en el período seleccionado.'
                : 'Selecciona un rango y genera el reporte.'
            }
            description="El reporte incluye sólo reservas con estado confirmadas."
          />
        ) : null}
      </div>
    </AppLayout>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="px-3 py-3 font-mono text-[10px] uppercase tracking-wide font-medium whitespace-nowrap">
      {children}
    </th>
  );
}
