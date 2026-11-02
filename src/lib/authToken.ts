const TOKEN_KEY = 'amees_admin_token';
const EMAIL_KEY = 'amees_admin_email';
const ROLE_KEY = 'amees_admin_role';

export interface AdminTokenClaims {
  sub: string;
  role: string;
  email: string;
  iat: number;
  exp: number;
}

/** Decode payload without verifying signature — that's the server's job. */
function decode(token: string): AdminTokenClaims | null {
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  try {
    const payload = JSON.parse(
      atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')),
    );
    if (typeof payload?.sub !== 'string' || typeof payload?.exp !== 'number') {
      return null;
    }
    return payload as AdminTokenClaims;
  } catch {
    return null;
  }
}

/**
 * Returns the stored token only if it is a structurally valid JWT that has
 * not expired. Clears stale garbage (e.g. the old "pro" mock token) on the
 * way out so subsequent calls are cheap.
 */
export function getValidToken(): string | null {
  const raw = localStorage.getItem(TOKEN_KEY);
  if (!raw) return null;

  const claims = decode(raw);
  if (!claims) {
    clearToken();
    return null;
  }

  // 30s buffer before expiry
  if (claims.exp * 1000 < Date.now() + 30_000) {
    clearToken();
    return null;
  }

  return raw;
}

export function getAdminEmail(): string | null {
  return localStorage.getItem(EMAIL_KEY);
}

export function getAdminRole(): string | null {
  return localStorage.getItem(ROLE_KEY);
}

export function setAuth(token: string, email: string, role: string): void {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(EMAIL_KEY, email);
  localStorage.setItem(ROLE_KEY, role);
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(EMAIL_KEY);
  localStorage.removeItem(ROLE_KEY);
}