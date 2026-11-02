import type { ReactNode } from 'react';
import './RowList.css';

export interface RowListItem {
  /** Left column: a badge, date, file type, or day abbreviation. */
  lead?: ReactNode;
  /** Main text of the row. */
  title: ReactNode;
  /** Sub-text under the title. */
  meta?: ReactNode;
  /** Right column: usually a small button or link. */
  action?: ReactNode;
}

export interface RowListProps {
  rows: readonly RowListItem[];
  /** Shown when rows is empty. */
  empty?: ReactNode;
  className?: string;
}

export function RowList({ rows, empty, className }: RowListProps) {
  if (rows.length === 0) {
    return (
      <div className={['amees-row-list', className].filter(Boolean).join(' ')}>
        <div className="amees-row-list__empty" role="status">
          {empty ?? 'Nothing to show.'}
        </div>
      </div>
    );
  }
  return (
    <ul className={['amees-row-list', className].filter(Boolean).join(' ')}>
      {rows.map((row, i) => (
        <li key={i}>
          {row.lead ? <div className="amees-row-list__lead">{row.lead}</div> : null}
          <div className="amees-row-list__main">
            <div className="amees-row-list__title">{row.title}</div>
            {row.meta ? <div className="amees-row-list__meta">{row.meta}</div> : null}
          </div>
          {row.action ? <div className="amees-row-list__action">{row.action}</div> : null}
        </li>
      ))}
    </ul>
  );
}