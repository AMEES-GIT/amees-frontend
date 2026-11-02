import type { ReactNode } from 'react';
import './DataTable.css';

export interface DataTableColumn<T> {
  /** Unique key for the column, also the row property name when `render` is omitted. */
  key: string;
  /** Column header text. Rendered uppercase bold. */
  label: string;
  /** Optional column width (px or CSS length). */
  width?: number | string;
  /** Cell alignment. Default left. */
  align?: 'left' | 'center' | 'right';
  /** Custom cell renderer. When omitted, `String(row[key] ?? '')` is used. */
  render?: (row: T, index: number) => ReactNode;
}

export interface DataTableProps<T> {
  columns: readonly DataTableColumn<T>[];
  rows: readonly T[];
  /** Optional caption rendered as a real <caption> above the table. */
  caption?: string;
  /** Shown when `rows` is empty. Rendered as a full-width cell. */
  empty?: ReactNode;
  /** Footer note rendered below the table. */
  note?: string;
  /** Stable key for each row. Default: index. */
  rowKey?: (row: T, index: number) => string | number;
  className?: string;
}

function defaultRender<T>(row: T, key: string): ReactNode {
  const v = (row as Record<string, unknown>)[key];
  if (v === null || v === undefined) return '';
  return String(v);
}

export function DataTable<T>({
  columns,
  rows,
  caption,
  empty,
  note,
  rowKey,
  className,
}: DataTableProps<T>) {
  const getKey = rowKey ?? ((_: T, i: number) => i);
  return (
    <div className={['amees-table', className].filter(Boolean).join(' ')}>
      <table>
        {caption ? <caption className="amees-table__caption">{caption}</caption> : null}
        <thead>
          <tr>
            {columns.map((c) => (
              <th
                key={c.key}
                scope="col"
                style={{
                  width: c.width,
                  textAlign: c.align ?? 'left',
                }}
              >
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="amees-table__empty-cell">
                {empty ?? 'No rows.'}
              </td>
            </tr>
          ) : (
            rows.map((row, i) => (
              <tr key={getKey(row, i)}>
                {columns.map((c) => (
                  <td key={c.key} style={{ textAlign: c.align ?? 'left' }}>
                    {c.render ? c.render(row, i) : defaultRender(row, c.key)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
      {note ? <p className="amees-table__note">{note}</p> : null}
    </div>
  );
}