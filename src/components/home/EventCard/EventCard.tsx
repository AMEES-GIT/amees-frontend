import { Window } from '../../containers/Window';
import { Badge } from '../../primitives/Badge';
import './EventCard.css';

export interface EventCardProps {
  title: string;
  text: string;
  /** Optional tag, e.g. "Second semester", "Workshop". */
  tag?: string;
  className?: string;
}

export function EventCard({ title, text, tag, className }: EventCardProps) {
  return (
    <Window title={title} className={className}>
      <div className="amees-event-card__body">
        <p className="amees-event-card__text">{text}</p>
        {tag ? (
          <div className="amees-event-card__tag-row">
            <Badge tone="neutral" kind="tag">
              {tag}
            </Badge>
          </div>
        ) : null}
      </div>
    </Window>
  );
}