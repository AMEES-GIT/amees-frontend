import { forwardRef, type ReactNode } from 'react';
import './PageHeader.css';

export interface PageHeaderProps {
  /** Kicker text above the h1. Uppercase caps, --blue. */
  kicker?: string;
  /** Page title. Rendered as the only h1 on the page. */
  title: string;
  /** Lede paragraph below the title. */
  lede?: string;
  /** Optional extra content below the lede (e.g. filter chips). */
  children?: ReactNode;
  className?: string;
}

export const PageHeader = forwardRef<HTMLHeadingElement, PageHeaderProps>(function PageHeader(
  { kicker, title, lede, children, className },
  ref,
) {
  return (
    <div className={['amees-page-head', className].filter(Boolean).join(' ')}>
      {kicker ? <span className="amees-page-head__kicker">{kicker}</span> : null}
      <h1 ref={ref} className="amees-page-head__title" tabIndex={-1}>
        {title}
      </h1>
      {lede ? <p className="amees-page-head__lede">{lede}</p> : null}
      {children}
    </div>
  );
});