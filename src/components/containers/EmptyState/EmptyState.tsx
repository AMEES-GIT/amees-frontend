import type { ReactNode } from 'react';
import './EmptyState.css';

export interface EmptyStateProps {
  title: string;
  text?: string;
  /** Usually a Button, e.g. "Clear filters" or "Try again". */
  action?: ReactNode;
  className?: string;
}

export function EmptyState({ title, text, action, className }: EmptyStateProps) {
  return (
    <div className={['amees-empty-state', className].filter(Boolean).join(' ')}>
      <h3 className="amees-empty-state__title">{title}</h3>
      {text ? <p className="amees-empty-state__text">{text}</p> : null}
      {action ? <div className="amees-empty-state__action">{action}</div> : null}
    </div>
  );
}