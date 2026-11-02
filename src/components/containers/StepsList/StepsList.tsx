import type { ReactNode } from 'react';
import './StepsList.css';

export interface StepsListProps {
  items: readonly ReactNode[];
  className?: string;
}

export function StepsList({ items, className }: StepsListProps) {
  return (
    <ol className={['amees-steps', className].filter(Boolean).join(' ')}>
      {items.map((item, i) => (
        <li key={i}>{item}</li>
      ))}
    </ol>
  );
}