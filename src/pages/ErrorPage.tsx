import { Wrap, Block } from '../components/containers/Layout';
import { Window } from '../components/containers/Window';
import { Button } from '../components/primitives/Button';

export function ErrorPage({
  onRetry,
  title = 'Could not load the site.',
  message = "We couldn't connect to the server. Please check your connection and try again.",
}: {
  onRetry: () => void;
  title?: string;
  message?: string;
}) {
  return (
    <Wrap>
      <Block>
        <div style={{ minHeight: '60vh', display: 'grid', placeItems: 'center' }}>
          <Window title="500.exe" meta="system failure">
            <div style={{ padding: 'var(--sp-5) var(--sp-3)', textAlign: 'center', maxWidth: 400 }}>
              <h1 style={{ fontFamily: 'var(--font)', fontSize: 'clamp(40px, 10vw, 80px)', margin: 0, color: 'var(--c-bad)', lineHeight: 1 }}>500</h1>
              <p style={{ fontFamily: 'var(--font)', fontSize: 'var(--fs-lg)', marginTop: 'var(--sp-3)', fontWeight: 'bold' }}>
                {title}
              </p>
              <p style={{ fontFamily: 'var(--font)', color: 'var(--muted)', marginBottom: 'var(--sp-5)' }}>
                {message}
              </p>
              <Button variant="primary" onClick={onRetry}>Try Again</Button>
            </div>
          </Window>
        </div>
      </Block>
    </Wrap>
  );
}