import { useEffect, useId, useState, type ReactNode } from 'react';
import { Badge } from '../../primitives/Badge';
import './AdminShell.css';

export interface AdminNavItem {
  id: string;
  label: string;
}

export interface AdminShellProps {
  role: string;
  user: string;
  nav: readonly AdminNavItem[];
  current: string;
  onNav: (id: string) => void;
  saveStatus?: ReactNode;
  children: ReactNode;
}

export function AdminShell({ role, user, nav, current, onNav, saveStatus, children }: AdminShellProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const panelId = useId();

  // Close on Escape and on route change (current nav item changed).
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setMenuOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [menuOpen]);

  useEffect(() => { setMenuOpen(false); }, [current]);

  const handleNav = (id: string) => {
    onNav(id);
    setMenuOpen(false);
  };

  return (
    <div className="amees-admin" data-menu-open={menuOpen ? '' : undefined}>
      <header className="amees-admin__header">
        <div className="amees-admin__brand">
          <button
            type="button"
            className="amees-admin__menu-toggle"
            aria-label={menuOpen ? 'Close navigation' : 'Open navigation'}
            aria-expanded={menuOpen}
            aria-controls={panelId}
            onClick={() => setMenuOpen(o => !o)}
          >
            <span aria-hidden="true">{menuOpen ? '✕' : '☰'}</span>
          </button>
          <span className="amees-admin__brand-text">AMEES Admin</span>
          <Badge tone="purple" kind="tag">{role}</Badge>
        </div>
        <div className="amees-admin__user">
          {saveStatus}
          <span>{user}</span>
        </div>
      </header>

      <div className="amees-admin__layout">
        <aside className="amees-admin__sidebar" id={panelId}>
          <nav aria-label="Admin sections">
            {nav.map(item => (
              <button
                key={item.id}
                className={`amees-admin__nav-btn ${current === item.id ? 'is-active' : ''}`}
                aria-current={current === item.id ? 'page' : undefined}
                onClick={() => handleNav(item.id)}
              >
                {item.label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Backdrop: click-to-close on mobile. Rendered always, hidden on desktop via CSS. */}
        <button
          type="button"
          className="amees-admin__backdrop"
          aria-label="Close navigation"
          tabIndex={menuOpen ? 0 : -1}
          onClick={() => setMenuOpen(false)}
        />

        <main className="amees-admin__content">
          {children}
        </main>
      </div>
    </div>
  );
}