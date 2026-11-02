import { Button } from '../../primitives/Button';
import './ErrorState.css';

export interface ErrorStateProps {
  title: string;
  text?: string;
  /** When provided, a "Try again" button renders. */
  onRetry?: () => void;
  /** Overrides the retry button label. Default "Try again". */
  retryLabel?: string;
  className?: string;
}

export function ErrorState({
  title,
  text,
  onRetry,
  retryLabel = 'Try again',
  className,
}: ErrorStateProps) {
  return (
    <div className={['amees-error-state', className].filter(Boolean).join(' ')} role="alert">
      <h3 className="amees-error-state__title">{title}</h3>
      {text ? <p className="amees-error-state__text">{text}</p> : null}
      {onRetry ? (
        <div className="amees-error-state__actions">
          <Button size="sm" onClick={onRetry}>
            {retryLabel}
          </Button>
        </div>
      ) : null}
    </div>
  );
}