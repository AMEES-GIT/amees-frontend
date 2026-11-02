import type { ReactNode } from 'react';
import './DotList.css';

export interface DotListProps {
  items: readonly ReactNode[];
  className?: string;
}

export function DotList({ items, className }: DotListProps) {
  return (
    <ul className={['amees-dot-list', className].filter(Boolean).join(' ')}>
      {items.map((item, i) => (
        <li key={i}>{item}</li>
      ))}
    </ul>
  );
}