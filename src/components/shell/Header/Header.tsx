import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Logo } from '../../foundations/Logo';
import { Icon } from '../../foundations/Icon';
import './Header.css';

export interface HeaderNavItem {
  key: string;
  label: string;
  href: string;
}

export interface HeaderProps {
  nav: readonly HeaderNavItem[];
  current?: string;
  theme: 'light' | 'dark';
  onThemeToggle: () => void;
  /** Slot for the site search (for example <SearchBox />). Rendered once. */
  search?: ReactNode;
  /** Keys shown under "More" on wide screens. */
  moreKeys?: readonly string[];
}

const DEFAULT_MORE = ['workbench', 'toolbox', 'opportunities', 'projects'];
const WIDE_QUERY = '(min-width: 1041px)';

function useWide(): boolean {
  const [wide, setWide] = useState(() => window.matchMedia(WIDE_QUERY).matches);
  useEffect(() => {
    const mq = window.matchMedia(WIDE_QUERY);
    const onChange = () => setWide(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);
  return wide;
}

export function Header({
  nav,
  current,
  theme,
  onThemeToggle,
  search,
  moreKeys = DEFAULT_MORE,
}: HeaderProps) {
  const wide = useWide();
  const [moreOpen, setMoreOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const moreRef = useRef<HTMLDivElement>(null);
  const moreBtnRef = useRef<HTMLButtonElement>(null);
  const menuBtnRef = useRef<HTMLButtonElement>(null);

  const closeAll = () => {
    setMoreOpen(false);
    setMenuOpen(false);
  };

  useEffect(() => {
    if (!moreOpen && !menuOpen) return;
    const onDown = (e: PointerEvent) => {
      const target = e.target as Node;
      if (moreOpen && moreRef.current && !moreRef.current.contains(target)) setMoreOpen(false);
      if (menuOpen && headerRef.current && !headerRef.current.contains(target)) setMenuOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      if (moreOpen) {
        setMoreOpen(false);
        moreBtnRef.current?.focus();
      }
      if (menuOpen) {
        setMenuOpen(false);
        menuBtnRef.current?.focus();
      }
    };
    document.addEventListener('pointerdown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [moreOpen, menuOpen]);

  const renderLink = (item: HeaderNavItem) => (
    <a
      key={item.key}
      href={item.href}
      className="hdr__link"
      aria-current={item.key === current ? 'page' : undefined}
      onClick={closeAll}
    >
      {item.label}
    </a>
  );

  const moreItems = nav.filter((n) => moreKeys.includes(n.key));
  const primaryItems = nav.filter((n) => !moreKeys.includes(n.key));
  const moreActive = moreItems.some((n) => n.key === current);
  const nextTheme = theme === 'dark' ? 'light' : 'dark';

  const themeButton = (
    <button
      type="button"
      className="hdr__link hdr__icon"
      onClick={onThemeToggle}
      aria-label={`Switch to ${nextTheme} theme`}
    >
      <Icon name={theme === 'dark' ? 'sun' : 'moon'} />
    </button>
  );

  return (
    <header className="hdr" ref={headerRef}>
      <div className="hdr__bar">
        <a className="hdr__brand" href="#home" aria-label="AMEES home" onClick={closeAll}>
          <Logo variant="mark" height={32} />
          <span className="hdr__brand-text">AMEES</span>
        </a>

        {wide ? (
          <>
            <nav className="hdr__nav" aria-label="Main">
              {primaryItems.map(renderLink)}

              {moreItems.length > 0 && (
                <div className="hdr__more" ref={moreRef}>
                  <button
                    ref={moreBtnRef}
                    type="button"
                    className="hdr__link"
                    data-active={moreActive}
                    aria-expanded={moreOpen}
                    aria-controls="hdr-more"
                    onClick={() => setMoreOpen((v) => !v)}
                  >
                    More
                  </button>
                  {moreOpen && (
                    <div className="hdr__dropdown" id="hdr-more">
                      {moreItems.map(renderLink)}
                    </div>
                  )}
                </div>
              )}
            </nav>

            <div className="hdr__tools">
              {search && <div className="hdr__search">{search}</div>}
              {themeButton}
            </div>
          </>
        ) : (
          <div className="hdr__tools hdr__tools--narrow">
            {themeButton}
            <button
              ref={menuBtnRef}
              type="button"
              className="hdr__link"
              aria-expanded={menuOpen}
              aria-controls="hdr-panel"
              onClick={() => setMenuOpen((v) => !v)}
            >
              {menuOpen ? 'Close' : 'Menu'}
            </button>
          </div>
        )}
      </div>

      {!wide && menuOpen && (
        <div className="hdr__panel" id="hdr-panel">
          {search && <div className="hdr__panel-search">{search}</div>}
          <nav className="hdr__panel-nav" aria-label="All pages">
            {nav.map(renderLink)}
          </nav>
        </div>
      )}
    </header>
  );
}