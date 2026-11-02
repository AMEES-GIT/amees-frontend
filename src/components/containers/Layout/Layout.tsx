import type { ReactNode } from 'react';
import './Layout.css';

/* ---------- Wrap: centered max-width container with safe-area padding ---------- */

export interface WrapProps {
  children: ReactNode;
  className?: string;
}

export function Wrap({ children, className }: WrapProps) {
  return <div className={['amees-wrap', className].filter(Boolean).join(' ')}>{children}</div>;
}

/* ---------- Grid: auto-fit grid with configurable min column width ---------- */

export interface GridProps {
  children: ReactNode;
  /** Minimum column width in px. Default 320. */
  min?: number;
  className?: string;
}

export function Grid({ children, min = 320, className }: GridProps) {
  return (
    <div
      className={['amees-grid', className].filter(Boolean).join(' ')}
      style={{ ['--amees-grid-min' as string]: `${min}px` }}
    >
      {children}
    </div>
  );
}

/* ---------- FormGrid: auto-fit grid tuned for form fields ---------- */

export interface FormGridProps {
  children: ReactNode;
  className?: string;
}

export function FormGrid({ children, className }: FormGridProps) {
  return (
    <div
      className={['amees-grid', className].filter(Boolean).join(' ')}
      style={{ ['--amees-grid-min' as string]: '150px' }}
    >
      {children}
    </div>
  );
}

/* ---------- Block: vertical spacing wrapper between major sections ---------- */

export interface BlockProps {
  children: ReactNode;
  className?: string;
}

export function Block({ children, className }: BlockProps) {
  return <div className={['amees-block', className].filter(Boolean).join(' ')}>{children}</div>;
}

/* ---------- Row: wrapping flex row ---------- */

export interface RowProps {
  children: ReactNode;
  className?: string;
}

export function Row({ children, className }: RowProps) {
  return <div className={['amees-row', className].filter(Boolean).join(' ')}>{children}</div>;
}