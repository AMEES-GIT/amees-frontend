import type { ReactNode } from 'react';
import './SkipLink.css';

export interface SkipLinkProps {
  /** Target anchor. Usually `#main` — the id of the page's <main> element. */
  href?: string;
  children?: ReactNode;
  className?: string;
}

export function SkipLink({ href = '#main', children = 'Skip to main content', className }: SkipLinkProps) {
  return (
    <a href={href} className={['amees-skip-link', className].filter(Boolean).join(' ')}>
      {children}
    </a>
  );
}