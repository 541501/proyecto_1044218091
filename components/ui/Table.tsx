import * as React from 'react';

export interface TableColumn<T> {
  key: keyof T;
  label: string;
  render?: (value: T[keyof T], row: T) => React.ReactNode;
  width?: string;
}

export interface TableProps<T> {
  columns: TableColumn<T>[];
  data: T[];
  rowKey: keyof T;
  onRowClick?: (row: T) => void;
}

export const Table = React.forwardRef<HTMLTableElement, TableProps<any>>(
  ({ columns, data, rowKey, onRowClick }, ref) => (
    <div className="border border-rule bg-surface overflow-x-auto">
      <table ref={ref} className="w-full text-sm">
        <thead className="bg-paper-soft border-b border-rule">
          <tr className="text-left text-ink-mute">
            {columns.map((col) => (
              <th
                key={String(col.key)}
                className="px-4 py-3 font-mono text-[10px] uppercase tracking-wide font-medium"
                style={{ width: col.width }}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-rule">
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-4 py-8 text-center text-ink-mute italic">
                Sin datos
              </td>
            </tr>
          ) : (
            data.map((row, idx) => (
              <tr
                key={String(row[rowKey]) || idx}
                className={onRowClick ? 'cursor-pointer hover:bg-paper-soft' : ''}
                onClick={() => onRowClick?.(row)}
              >
                {columns.map((col) => (
                  <td key={String(col.key)} className="px-4 py-3 text-ink-soft">
                    {col.render ? col.render(row[col.key], row) : String(row[col.key])}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  ),
);

Table.displayName = 'Table';
