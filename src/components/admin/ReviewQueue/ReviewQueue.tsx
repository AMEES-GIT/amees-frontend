import { Button } from '../../primitives/Button';
import { Badge } from '../../primitives/Badge';
import './ReviewQueue.css';

export interface AdminChange {
  id: string;
  author: string;
  timestamp: string;
  target: string;
  before: string;
  after: string;
}

export interface ReviewQueueProps {
  changes: readonly AdminChange[];
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}

export function ReviewQueue({ changes, onApprove, onReject }: ReviewQueueProps) {
  if (changes.length === 0) {
    return <p className="amees-review__empty">No pending changes.</p>;
  }

  return (
    <div className="amees-review">
      {changes.map(change => (
        <div key={change.id} className="amees-review__card">
          <div className="amees-review__header">
            <div>
              <Badge tone="warn" kind="tag">Pending Review</Badge>
              <span className="amees-review__target">{change.target}</span>
            </div>
            <span className="amees-review__meta">{change.author} · {change.timestamp}</span>
          </div>
          
          <div className="amees-review__diff">
            <div className="amees-review__row">
              <span className="amees-review__label">Before</span>
              <div className="amees-review__text amees-review__text--old">{change.before}</div>
            </div>
            <div className="amees-review__row">
              <span className="amees-review__label">After</span>
              <div className="amees-review__text amees-review__text--new">{change.after}</div>
            </div>
          </div>

          <div className="amees-review__actions">
            <Button size="sm" onClick={() => onReject(change.id)}>Reject</Button>
            <Button size="sm" variant="primary" onClick={() => onApprove(change.id)}>Approve</Button>
          </div>
        </div>
      ))}
    </div>
  );
}