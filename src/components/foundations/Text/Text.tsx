import type { ReactNode } from 'react';
import { Icon } from '../Icon';
import './Text.css';

type Base = { children: ReactNode; className?: string };
type Inline = 'span' | 'p' | 'div';

const join = (...parts: (string | false | undefined)[]) => parts.filter(Boolean).join(' ');

/** Small blue caps label above a heading (.k). */
export function Kicker({ as: Tag = 'span', className, children }: Base & { as?: Inline }) {
  return <Tag className={join('amees-kicker', className)}>{children}</Tag>;
}

/** Intro sentence under a page title, capped at 64ch. */
export function Lede({ className, children }: Base) {
  return <p className={join('amees-lede', className)}>{children}</p>;
}

/** Yellow note box: sample labels and short warnings. */
export function Note({ className, children }: Base) {
  return (
    <div role="note" className={join('amees-note', className)}>
      {children}
    </div>
  );
}

/** Small grey help text, for example under a field. */
export function Hint({ as: Tag = 'p', className, children }: Base & { as?: Inline }) {
  return <Tag className={join('amees-hint', className)}>{children}</Tag>;
}

/** Inline grey text. */
export function Muted({ as: Tag = 'span', className, children }: Base & { as?: Inline }) {
  return <Tag className={join('amees-muted', className)}>{children}</Tag>;
}

/** Display face in caps (.d). Size follows the type scale. */
export function Display({
  as: Tag = 'p',
  size = 'base',
  className,
  children,
}: Base & { as?: Inline; size?: 'base' | 'lg' | 'xl' }) {
  return <Tag className={join('amees-display', size !== 'base' && `amees-display--${size}`, className)}>{children}</Tag>;
}

/** Section title (h2.sec). `level` changes the tag, not the look. */
export function SectionHeading({
  level = 2,
  className,
  children,
}: Base & { level?: 2 | 3 | 4 }) {
  const Tag = `h${level}` as 'h2' | 'h3' | 'h4';
  return <Tag className={join('amees-section-heading', className)}>{children}</Tag>;
}

/** Link to another site: new tab, safe rel, visible marker, announced to screen readers. */
export function ExtLink({ href, className, children }: Base & { href: string }) {
  return (
    <a className={join('amees-extlink', className)} href={href} target="_blank" rel="noopener noreferrer">
      {children}
      <Icon name="external" size={14} className="amees-extlink__icon" />
      <span className="amees-sr">, opens in a new tab</span>
    </a>
  );
}
