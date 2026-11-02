import { useEffect, useState, type FormEvent } from 'react';
import { Wrap, Block } from '../components/containers/Layout';
import { Window } from '../components/containers/Window';
import { Field } from '../components/primitives/Field';
import { TextInput } from '../components/primitives/TextInput';
import { Button } from '../components/primitives/Button';
import { getDeviceId } from '../lib/deviceId';
import { setAuth, getValidToken, clearToken } from '../lib/authToken';
import { API_BASE } from '../lib/apiBase';
import './LoginPage.css';

const AUTH_API = `${API_BASE}/api/admin/auth`;

type Stage = 'credentials' | 'otp';

export function LoginPage() {
  const [stage, setStage] = useState<Stage>('credentials');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [challengeId, setChallengeId] = useState('');
  const [deviceLabel, setDeviceLabel] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  // If already signed in, skip the form
  useEffect(() => {
    if (getValidToken()) {
      window.location.hash = 'admin';
    } else {
      clearToken();
    }
  }, []);

  const finishLogin = (token: string, role: string, loggedInEmail: string) => {
    setAuth(token, loggedInEmail, role);
    window.location.hash = 'admin';
  };

  const handleCredentials = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      const res = await fetch(`${AUTH_API}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password,
          deviceId: getDeviceId(),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Sign in failed');
        return;
      }
      if (data.needsOtp) {
        setChallengeId(data.challengeId);
        setDeviceLabel(data.deviceLabel ?? '');
        setStage('otp');
        return;
      }
      finishLogin(data.token, data.role, data.email);
    } catch {
      setError('Network error. Check your connection.');
    } finally {
      setBusy(false);
    }
  };

  const handleOtp = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      const res = await fetch(`${AUTH_API}/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          challengeId,
          code: code.trim(),
          deviceId: getDeviceId(),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Verification failed');
        return;
      }
      finishLogin(data.token, data.role, data.email);
    } catch {
      setError('Network error. Check your connection.');
    } finally {
      setBusy(false);
    }
  };

  const backToCredentials = () => {
    setStage('credentials');
    setCode('');
    setChallengeId('');
    setDeviceLabel('');
    setError('');
  };

  return (
    <Wrap>
      <Block>
        <div className="login-container">
          <Window
            title={stage === 'credentials' ? 'Admin Login' : 'Verify this device'}
            meta="restricted"
          >
            {stage === 'credentials' ? (
              <form
                onSubmit={handleCredentials}
                style={{ display: 'grid', gap: 'var(--sp-4)' }}
              >
                <Field label="Email">
                  <TextInput
                    type="email"
                    value={email}
                    onChange={setEmail}
                    placeholder="admin@amees.com.ng"
                    autoComplete="username"
                    required
                  />
                </Field>
                <Field label="Password">
                  <TextInput
                    type="password"
                    value={password}
                    onChange={setPassword}
                    autoComplete="current-password"
                    required
                  />
                </Field>
                {error && (
                  <p
                    style={{
                      color: 'var(--c-bad)',
                      fontSize: 'var(--fs-sm)',
                      margin: 0,
                    }}
                    role="alert"
                  >
                    {error}
                  </p>
                )}
                <Button type="submit" variant="primary" loading={busy}>
                  Sign in
                </Button>
              </form>
            ) : (
              <form
                onSubmit={handleOtp}
                style={{ display: 'grid', gap: 'var(--sp-4)' }}
              >
                <p style={{ margin: 0, fontSize: 'var(--fs-sm)' }}>
                  A 6-digit code was sent to <strong>{email}</strong>.
                  {deviceLabel && (
                    <>
                      <br />
                      <span style={{ color: 'var(--muted)' }}>
                        New device: {deviceLabel}. Enter the code to trust it
                        for next time.
                      </span>
                    </>
                  )}
                </p>
                <Field label="Code">
                  <TextInput
                    value={code}
                    onChange={(v) => setCode(v.replace(/\D/g, '').slice(0, 6))}
                    placeholder="000000"
                    autoComplete="one-time-code"
                    required
                  />
                </Field>
                {error && (
                  <p
                    style={{
                      color: 'var(--c-bad)',
                      fontSize: 'var(--fs-sm)',
                      margin: 0,
                    }}
                    role="alert"
                  >
                    {error}
                  </p>
                )}
                <div style={{ display: 'flex', gap: 'var(--sp-2)' }}>
                  <Button type="submit" variant="primary" loading={busy}>
                    Verify
                  </Button>
                  <Button
                    type="button"
                    variant="default"
                    onClick={backToCredentials}
                    disabled={busy}
                  >
                    Back
                  </Button>
                </div>
              </form>
            )}
          </Window>
        </div>
      </Block>
    </Wrap>
  );
}