import { useState } from 'react';
import { Wrap, Block } from '../components/containers/Layout';
import { Window } from '../components/containers/Window';
import { Field } from '../components/primitives/Field';
import { TextInput } from '../components/primitives/TextInput';
import { Button } from '../components/primitives/Button';
import './LoginPage.css';

export function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock authentication
    if ((username === 'pro' || username === 'social') && password === 'amees2026') {
      localStorage.setItem('amees_admin_token', username);
      window.location.hash = 'admin';
    } else {
      setError('Invalid credentials. Try pro / amees2026');
    }
  };

  return (
    <Wrap>
      <Block>
        <div className="login-container">
          <Window title="Admin Login" meta="restricted">
            <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 'var(--sp-4)' }}>
              <Field label="Username">
                <TextInput value={username} onChange={setUsername} placeholder="pro or social" />
              </Field>
              <Field label="Password">
                <TextInput type="password" value={password} onChange={setPassword} />
              </Field>
              {error && <p style={{ color: 'var(--c-bad)', fontSize: 'var(--fs-sm)', margin: 0 }}>{error}</p>}
              <Button type="submit" variant="primary">Sign in</Button>
            </form>
          </Window>
        </div>
      </Block>
    </Wrap>
  );
}