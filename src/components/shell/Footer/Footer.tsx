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
  links: FooterLink[];
}

export interface FooterProps {
  tagline: string;
  groups: FooterGroup[];
  external?: { label: string; href: string }[];
  runner?: ReactNode;
  LinkComponent?: ElementType;
  brandHref?: string;
  year?: number;
  className?: string;
}

export function Footer({
  tagline,
  groups,
  runner,
  LinkComponent,
  brandHref = '#home',
  year = new Date().getFullYear(),
  className,
}: FooterProps) {
  const Link = LinkComponent ?? 'a';
  
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className={['amees-footer', className].filter(Boolean).join(' ')}>
      {runner ? <div className="amees-footer__runner-slot">{runner}</div> : null}
      
      <div className="amees-footer__wrap">
        <div className="amees-footer__brand">
          <Logo variant="full" height={54} href={brandHref} LinkComponent={LinkComponent} label="AMEES home" />
          <p className="amees-footer__tagline">{tagline}</p>
        </div>
        
        <div className="amees-footer__nav-groups">
          {groups.map((group) => (
            <div key={group.title} className="amees-footer__group">
              <h3 className="amees-footer__group-title">{group.title}</h3>
              <ul className="amees-footer__list">
                {group.links.map((l) => (
                  <li key={l.label}>
                    <Link href={l.href} className="amees-footer__link">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="amees-footer__bottom">
        <span className="amees-footer__copyright">
          © {year} AMEES, Lead City University, Ibadan
        </span>
        <button type="button" onClick={scrollToTop} className="amees-footer__top-btn">
          Back to top <Icon name="arrow-left" size={14} className="footer-rotate-up" />
        </button>
      </div>
    </footer>
  );
}