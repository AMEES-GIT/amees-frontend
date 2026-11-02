import type { ReactNode } from 'react';
import './Badge.css';

export type BadgeTone = 'neutral' | 'ok' | 'warn' | 'bad' | 'info' | 'purple';
export type BadgeKind = 'tag' | 'pill' | 'stat' | 'type';

export interface BadgeProps {
  children: ReactNode;
  tone?: BadgeTone;
  kind?: BadgeKind;
  /** Optional. When true, background uses the tone colour and text uses --on-fill. */
  filled?: boolean;
  className?: string;
}

export function Badge({
  children,
  tone = 'neutral',
  kind = 'tag',
  filled = false,
  className,
}: BadgeProps) {
  return (
    <span
      className={[
        'amees-badge',
        `amees-badge--${kind}`,
        `amees-badge--${tone}`,
        filled && 'amees-badge--filled',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {children}
    </span>
  );
}