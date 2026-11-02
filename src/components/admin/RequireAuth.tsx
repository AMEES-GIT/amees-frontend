import { useEffect, useState, type ReactNode } from 'react';
import { getValidToken, clearToken } from '../../lib/authToken';
import { API_BASE } from '../../lib/apiBase';

type Gate = 'checking' | 'authenticated' | 'rejected';

export function RequireAuth({ children }: { children: ReactNode }) {
  const [gate, setGate] = useState<Gate>('checking');

  useEffect(() => {
    const token = getValidToken();
    if (!token) {
      setGate('rejected');
      window.location.hash = 'login';
      return;
    }

    let cancelled = false;
    fetch(`${API_BASE}/api/admin/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (cancelled) return;
        if (res.ok) {
          setGate('authenticated');
        } else {
          clearToken();
          setGate('rejected');
          window.location.hash = 'login';
        }
      })
      .catch(() => {
        if (cancelled) return;
        setGate('rejected');
        window.location.hash = 'login';
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (gate === 'checking') {
    return (
      <div
        style={{
          padding: 'var(--sp-6)',
          textAlign: 'center',
          color: 'var(--muted)',
          fontFamily: 'var(--font)',
        }}
      >
        Checking session…
      </div>
    );
  }

  if (gate === 'rejected') return null;

  return <>{children}</>;
}