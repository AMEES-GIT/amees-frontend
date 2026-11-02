import { Window } from '../../containers/Window';
import { Badge } from '../../primitives/Badge';
import { Button } from '../../primitives/Button';
import { Icon } from '../../foundations/Icon';
import { getDeadlineState } from '../../../lib/opportunities';
import './OpportunityCard.css';

export interface Opportunity {
  id: string;
  ty: string;
  t: string;
  org: string;
  lv: number[];
  dl: string;
  loc: string;
  d: string;
}

export interface OpportunityCardProps {
  opp: Opportunity;
  now: string | Date;
  saved: boolean;
  onToggleSave: (id: string) => void;
  /** Optional pre-built WhatsApp share link. If omitted, one is generated. */
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
  const deadline = getDeadlineState(opp.dl, now);
  
  const waLink = shareHref ?? `https://wa.me/?text=${encodeURIComponent(
    `${opp.t} (${opp.org}), closes ${opp.dl}. Seen on the AMEES opportunities board.`
  )}`;

  return (
    <Window title={opp.ty} meta={opp.loc} className={className}>
      <div className="amees-opp">
        <div className="amees-opp__header">
          <h3 className="amees-opp__title">{opp.t}</h3>
          <p className="amees-opp__org">{opp.org}</p>
        </div>
        
        <p className="amees-opp__desc">{opp.d}</p>
        
        <div className="amees-opp__meta">
          <span className={`amees-opp__deadline amees-opp__deadline--${deadline.state}`}>
            {deadline.label}
          </span>
          <Badge tone="neutral" kind="tag">
            Levels {opp.lv.join(', ')}
          </Badge>
        </div>

        <div className="amees-opp__actions">
          <Button
            size="sm"
            pressed={saved}
            onClick={() => onToggleSave(opp.id)}
            aria-label={saved ? 'Remove from saved' : 'Save opportunity'}
          >
            <Icon name={saved ? 'star-filled' : 'star'} size={16} />
            {saved ? 'Saved' : 'Save'}
          </Button>
          
          <Button as="a" href={waLink} target="_blank" rel="noopener noreferrer" size="sm">
            Share on WhatsApp
          </Button>
        </div>
      </div>
    </Window>
  );
}