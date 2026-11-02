import { Window } from '../../containers/Window';
import './TrackCard.css';

export interface TrackCardProps {
  /** The track name, e.g. "Embedded Systems and Sensing". */
  title: string;
  /** A short description of what the track covers. */
  description: string;
  className?: string;
}

export function TrackCard({ title, description, className }: TrackCardProps) {
  return (
    <Window title={title} scrollbar className={className}>
      <p className="amees-track-card__desc">{description}</p>
    </Window>
  );
}