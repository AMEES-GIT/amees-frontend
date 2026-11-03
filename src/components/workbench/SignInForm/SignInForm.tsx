import { useState } from 'react';
import { Window } from '../../containers/Window';
import { Field } from '../../primitives/Field';
import { TextInput } from '../../primitives/TextInput';
import { Button } from '../../primitives/Button';
import { API_BASE } from '../../../lib/apiBase';
import './SignInForm.css';

export type SignInStep = 'identify' | 'code';

export interface SignInValues {
  name: string;
  matric: string;
  email: string;
  code: string;
}

export interface SignInFormProps {
  onSuccess: (token: string, student: any) => void;
  className?: string;
}

export function SignInForm({ onSuccess, className }: SignInFormProps) {
  const [step, setStep] = useState<SignInStep>('identify');
  const [values, setValues] = useState<SignInValues>({ name: '', matric: '', email: '', code: '' });
  const [challengeId, setChallengeId] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const handleChange = (key: keyof SignInValues, val: string) => {
    setValues(prev => ({ ...prev, [key]: val }));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError('');

    try {
      if (step === 'identify') {
        const res = await fetch(`${API_BASE}/api/student/auth/identify`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: values.name, matric: values.matric, email: values.email })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        
        setChallengeId(data.challengeId);
        setStep('code');
      } else {
        const res = await fetch(`${API_BASE}/api/student/auth/verify`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ challengeId, code: values.code, rememberMe })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        
        onSuccess(data.token, data.student);
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Window title="Sign in" meta="Student Portal" className={className}>
      <form className="amees-wb-signin" onSubmit={handleSubmit}>
        {error && <div style={{ color: 'var(--c-bad)', marginBottom: '1rem', fontSize: '0.9rem' }}>{error}</div>}
        
        {step === 'identify' ? (
          <>
            <Field label="Full name">
              <TextInput value={values.name} onChange={v => handleChange('name', v)} required />
            </Field>
            <Field label="Matric number">
              <TextInput 
                value={values.matric} 
                onChange={v => handleChange('matric', v.toUpperCase().replace(/\s/g, ''))} 
                placeholder="LCU/UG/24/XXXXX"
                required 
              />
            </Field>
            <Field label="Email address">
              <TextInput type="email" value={values.email} onChange={v => handleChange('email', v)} required placeholder="student@lcu.edu.ng" />
            </Field>
            <div className="amees-wb-signin__actions">
              <Button type="submit" variant="primary" loading={busy}>Send code</Button>
            </div>
          </>
        ) : (
          <>
            <Field label="6-digit code from email">
              <TextInput type="text" value={values.code} onChange={v => handleChange('code', v)} required autoComplete="one-time-code" />
            </Field>
            <p className="amees-wb-signin__hint">Check your email inbox.</p>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)', margin: 'var(--sp-2) 0' }}>
              <input 
                type="checkbox" 
                id="remember" 
                checked={rememberMe} 
                onChange={(e) => setRememberMe(e.target.checked)} 
                style={{ width: '16px', height: '16px', accentColor: 'var(--fill)', cursor: 'pointer' }}
              />
              <label htmlFor="remember" style={{ fontSize: 'var(--fs-sm)', fontFamily: 'var(--font)', cursor: 'pointer', color: 'var(--fg)' }}>
                Keep me logged in for 30 days
              </label>
            </div>

            <div className="amees-wb-signin__actions">
              <Button type="submit" variant="primary" loading={busy}>Sign in</Button>
              <Button type="button" onClick={() => setStep('identify')}>Back</Button>
            </div>
          </>
        )}
      </form>
    </Window>
  );
}