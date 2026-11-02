import { Wrap, Block } from '../components/containers/Layout';
import { Window } from '../components/containers/Window';
import { Button } from '../components/primitives/Button';
import type { PageId } from './types';

export function NotFoundPage({ onNavigate }: { onNavigate: (p: PageId) => void }) {
  return (
    <Wrap>
      <Block>
        <div style={{ minHeight: '60vh', display: 'grid', placeItems: 'center' }}>
          <Window title="404.exe" meta="page not found">
            <div style={{ padding: 'var(--sp-5) var(--sp-3)', textAlign: 'center', maxWidth: 400 }}>
              <h1 style={{ fontFamily: 'var(--font)', fontSize: 'clamp(40px, 10vw, 80px)', margin: 0, color: 'var(--blue)', lineHeight: 1 }}>404</h1>
              <p style={{ fontFamily: 'var(--font)', fontSize: 'var(--fs-lg)', marginTop: 'var(--sp-3)', fontWeight: 'bold' }}>
                Page not found.
              </p>
              <p style={{ fontFamily: 'var(--font)', color: 'var(--muted)', marginBottom: 'var(--sp-5)' }}>
                The page you are looking for doesn't exist or has been moved.
              </p>
              <Button variant="primary" onClick={() => onNavigate('home')}>
                Return to Home
              </Button>
            </div>
          </Window>
        </div>
      </Block>
    </Wrap>
  );
}