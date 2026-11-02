import './SaveStatus.css';

export type SaveState = 'saved' | 'saving' | 'unsaved' | 'error';

export interface SaveStatusProps {
  status: SaveState;
  /** Timestamp string for the "saved" state. */
  at?: string;
}

export function SaveStatus({ status, at }: SaveStatusProps) {
  return (
    <div className={`amees-save-status amees-save-status--${status}`} role="status" aria-live="polite">
      {status === 'saving' && 'Saving...'}
      {status === 'unsaved' && 'Unsaved changes'}
      {status === 'error' && 'Save failed'}
      {status === 'saved' && `Saved ${at || ''}`}
    </div>
  );
}