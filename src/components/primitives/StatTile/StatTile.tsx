import type { ReactNode } from 'react';
import './StatTile.css';

export interface StatTileProps {
  label: string;
  value: string;
  /** When true, background is --tint and the tile stands out. */
  highlight?: boolean;
  className?: string;
}

export function StatTile({ label, value, highlight = false, className }: StatTileProps) {
  return (
    <div
      className={[
        'amees-stat-tile',
        highlight && 'amees-stat-tile--highlight',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div className="amees-stat-tile__label">{label}</div>
      <div className="amees-stat-tile__value">{value}</div>
    </div>
  );
}

export interface StatGridProps {
  children: ReactNode;
  className?: string;
}

export function StatGrid({ children, className }: StatGridProps) {
  return (
    <div className={['amees-stat-grid', className].filter(Boolean).join(' ')}>{children}</div>
  );
}