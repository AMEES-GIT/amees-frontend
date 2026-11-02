import type { ElementType, MouseEvent } from 'react';

export interface NavItem {
  /** Visible text in the link. */
  label: string;
  /** Anchor href. */
  href: string;
  /** Stable key matched against `current`. */
  key: string;
  /** When true, gets yellow highlight unless it's current. */
  highlight?: boolean;
}

export interface NavbarProps {
  items: readonly NavItem[];
  current?: string;
  onNavClick?: (key: string) => void;
  LinkComponent?: ElementType;
}

export function Navbar({ items, current, onNavClick, LinkComponent }: NavbarProps) {
  const Link = LinkComponent ?? 'a';
  return (
    <nav className="amees-nav" aria-label="Main">
      {items.map((item) => {
        const isCurrent = item.key === current;
        const isHighlighted = item.highlight && !isCurrent;
        return (
          <Link
            key={item.key}
            href={item.href}
            className={[
              'amees-nav__link',
              isHighlighted && 'amees-nav__link--highlight',
            ]
              .filter(Boolean)
              .join(' ')}
            aria-current={isCurrent ? 'page' : undefined}
            onClick={
              onNavClick
                ? (e: MouseEvent<HTMLAnchorElement>) => {
                    e.preventDefault();
                    onNavClick(item.key);
                  }
                : undefined
            }
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}