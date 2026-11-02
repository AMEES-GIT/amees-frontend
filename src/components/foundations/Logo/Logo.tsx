import { forwardRef, type CSSProperties, type ElementType } from 'react';
import logoUrl from './logo.svg';
import './Logo.css';

export type LogoVariant = 'mark' | 'full';

export interface LogoProps {
  /** 'mark' shows the A-with-gear SVG only. 'full' adds the AMEES wordmark. */
  variant?: LogoVariant;
  /** Height in px. Default 42 (matches the mockup header). */
  height?: number;
  /** If given, the wrapper is a link. */
  href?: string;
  /** Optional custom link component (React Router, Next Link). Receives href, className, children. */
  LinkComponent?: ElementType;
  /** Screen-reader text. Defaults to "AMEES". */
  label?: string;
  /** Override the wrapper tag for the non-linked case. Default 'span'. */
  as?: 'span' | 'div';
  className?: string;
}

const WRAP_STYLE = (height: number): CSSProperties => ({ height });

export const Logo = forwardRef<HTMLElement, LogoProps>(function Logo(
  {
    variant = 'mark',
    height = 42,
    href,
    LinkComponent,
    label = 'AMEES',
    as = 'span',
    className,
  },
  ref,
) {
  const cls = ['amees-logo', variant === 'full' && 'amees-logo--full', className]
    .filter(Boolean)
    .join(' ');

  const inner = (
    <>
      <img
        src={logoUrl}
        alt=""
        aria-hidden="true"
        className="amees-logo__img"
        style={{ height }}
        draggable={false}
      />
      {variant === 'full' ? (
        <span className="amees-logo__wordmark" aria-hidden="true">
          AMEES
        </span>
      ) : null}
      <span className="amees-logo__sr">{label}</span>
    </>
  );

  if (href) {
    if (LinkComponent) {
      return (
        <LinkComponent
          ref={ref}
          href={href}
          className={cls}
          style={WRAP_STYLE(height)}
          aria-label={label}
        >
          {inner}
        </LinkComponent>
      );
    }
    return (
      <a
        ref={ref as React.Ref<HTMLAnchorElement>}
        href={href}
        className={cls}
        style={WRAP_STYLE(height)}
        aria-label={label}
      >
        {inner}
      </a>
    );
  }

  if (as === 'div') {
    return (
      <div ref={ref as React.Ref<HTMLDivElement>} className={cls} style={WRAP_STYLE(height)}>
        {inner}
      </div>
    );
  }
  return (
    <span ref={ref as React.Ref<HTMLSpanElement>} className={cls} style={WRAP_STYLE(height)}>
      {inner}
    </span>
  );
});