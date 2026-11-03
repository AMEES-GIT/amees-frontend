import { Window } from '../../containers/Window';
import { Badge } from '../../primitives/Badge';
import { Button } from '../../primitives/Button';
import { Icon } from '../../foundations/Icon';
import type { Opportunity } from '../../../content/types';
import './OpportunityCard.css';

export interface OpportunityCardProps {
  opp: Opportunity;
  now: Date;
  saved: boolean;
  onToggleSave: (id: string) => void;
  shareHref?: string;
  className?: string;
}

export function OpportunityCard({
  opp,
  now,
  saved,
  onToggleSave,
  shareHref,
  className,
}: OpportunityCardProps) {
  const start = new Date(opp.startDate);
  const end = new Date(opp.endDate);
  
  const isOpen = now >= start && now <= end;
  const isUpcoming = now < start;

  const waLink = shareHref ?? `https://wa.me/?text=${encodeURIComponent(
    `Check out this opportunity: ${opp.name} (${opp.type}). Closes ${end.toLocaleDateString()}. Seen on the AMEES portal.`
  )}`;

  return (
    <Window title={opp.type} meta={isOpen ? 'Open Now' : isUpcoming ? 'Upcoming' : 'Closed'} className={className}>
      <div className="amees-opp">
        <div className="amees-opp__header">
          <h3 className="amees-opp__title">{opp.name}</h3>
        </div>
        
        <p className="amees-opp__desc">{opp.description}</p>
        
        <div className="amees-opp__meta" style={{ margin: 'var(--sp-3) 0' }}>
          {isOpen ? (
            <Badge tone="ok" kind="tag">Open Now</Badge>
          ) : isUpcoming ? (
            <Badge tone="warn" kind="tag">Opens {start.toLocaleDateString()}</Badge>
          ) : (
            <Badge tone="bad" kind="tag">Closed</Badge>
          )}
          <span style={{ fontSize: 'var(--fs-sm)', color: 'var(--muted)', marginLeft: 'var(--sp-2)' }}>
            Deadline: {end.toLocaleDateString()}
          </span>
        </div>

        <div className="amees-opp__actions" style={{ display: 'flex', gap: 'var(--sp-2)', flexWrap: 'wrap' }}>
          <Button
            size="sm"
            pressed={saved}
            onClick={() => onToggleSave(opp.id)}
            aria-label={saved ? 'Remove from saved' : 'Save opportunity'}
          >
            <Icon name={saved ? 'star-filled' : 'star'} size={16} />
            {saved ? 'Saved' : 'Save'}
          </Button>

          {opp.externalLink && isOpen && (
            <Button as="a" href={opp.externalLink} target="_blank" rel="noopener noreferrer" size="sm" variant="primary">
              Apply →
            </Button>
          )}
          
          <Button as="a" href={waLink} target="_blank" rel="noopener noreferrer" size="sm">
            Share
          </Button>
        </div>
      </div>
    </Window>
  );
}