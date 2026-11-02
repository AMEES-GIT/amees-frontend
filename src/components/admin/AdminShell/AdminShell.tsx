import type { ReactNode } from 'react';
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
  return (
    <div className="amees-admin">
      <header className="amees-admin__header">
        <div className="amees-admin__brand">
          AMEES Admin <Badge tone="purple" kind="tag">{role}</Badge>
        </div>
        <div className="amees-admin__user">
          {saveStatus}
          <span>{user}</span>
        </div>
      </header>
      
      <div className="amees-admin__layout">
        <aside className="amees-admin__sidebar">
          <nav>
            {nav.map(item => (
              <button
                key={item.id}
                className={`amees-admin__nav-btn ${current === item.id ? 'is-active' : ''}`}
                onClick={() => onNav(item.id)}
              >
                {item.label}
              </button>
            ))}
          </nav>
        </aside>
        
        <main className="amees-admin__content">
          {children}
        </main>
      </div>
    </div>
  );
}