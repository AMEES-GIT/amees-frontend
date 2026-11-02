import type { ElementType, ReactNode } from 'react';
import { Logo } from '../../foundations/Logo';
import { Icon } from '../../foundations/Icon';
import './Footer.css';

export interface FooterLink {
  label: string;
  href: string;
}

export interface FooterGroup {
  title: string;
  links: readonly FooterLink[];
}

export interface FooterProps {
  tagline: string;
  groups: readonly FooterGroup[];
  /** Outbound links, such as the WhatsApp group. Opens in a new tab. */
  external?: readonly FooterLink[];
  /** Optional slot for the FooterRunner or other decorative content. */
  runner?: ReactNode;
  /** Optional custom link component. */
  LinkComponent?: ElementType;
  /** Brand href. Default '#home'. */
  brandHref?: string;
  year?: number;
  className?: string;
}

function backToTop() {
  const reduce =
    window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
    document.documentElement.dataset.motion === 'reduce';
  window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
}

export function Footer({
  tagline,
  groups,
  external = [],
  runner,
  LinkComponent,
  brandHref = '#home',
  year = new Date().getFullYear(),
  className,
}: FooterProps) {
  const Link = LinkComponent ?? 'a';

  return (
    <footer className={['ftr', className].filter(Boolean).join(' ')}>
      {runner ? <div className="ftr__runner">{runner}</div> : null}

      <div className="ftr__wrap">
        <div className="ftr__brand">
          <Logo variant="full" height={54} href={brandHref} LinkComponent={LinkComponent} label="AMEES home" />
          <p className="ftr__tagline">{tagline}</p>
        </div>

        <nav className="ftr__groups" aria-label="Footer">
          {groups.map((g) => (
            <div key={g.title} className="ftr__group">
              <h2 className="ftr__title">{g.title}</h2>
              <ul className="ftr__list">
                {g.links.map((l) => (
                  <li key={l.href + l.label}>
                    <Link href={l.href} className="ftr__link">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {external.length > 0 && (
            <div className="ftr__group">
              <h2 className="ftr__title">Find us</h2>
              <ul className="ftr__list">
                {external.map((l) => (
                  <li key={l.href}>
                    <a className="ftr__link" href={l.href} target="_blank" rel="noopener noreferrer">
                      {l.label}
                      <Icon name="external" />
                      <span className="sr"> (opens in a new tab)</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </nav>
      </div>

      <div className="ftr__bar">
        <div className="ftr__bar-in">
          <p>
            © {year} AMEES, Lead City University, Ibadan
          </p>
          <button type="button" className="ftr__top" onClick={backToTop}>
            Back to top
          </button>
        </div>
      </div>
    </footer>
  );
}