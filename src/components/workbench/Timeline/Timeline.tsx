import { Badge } from '../../primitives/Badge';
import { Button } from '../../primitives/Button';
import type { EntryType } from '../EntryForm';
import './Timeline.css';

export interface TimelineEntry {
  id: string;
  ts: number;
  type: EntryType | 'calc' | 'test';
  title: string;
  text?: string;
  link?: string;
  resolved?: boolean;
}

export interface TimelineProps {
  entries: readonly TimelineEntry[];
  filter: string;
  onFilterChange: (type: string) => void;
  projectStart: number;
  now: number;
  onResolveBlocker: (id: string) => void;
  onDeleteEntry: (id: string) => void;
  shareHref?: string;
  className?: string;
}

function formatDate(ts: number) {
  return new Date(ts).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

// Maps entry types to badge colors that match the timeline squares
const TYPE_TONES: Record<string, 'neutral' | 'ok' | 'warn' | 'info' | 'bad'> = {
  log: 'neutral',
  milestone: 'ok',
  decision: 'info',
  blocker: 'bad',
  test: 'warn',
  calc: 'neutral',
  link: 'info',
};

export function Timeline({
  entries,
  filter,
  onFilterChange,
  projectStart,
  now,
  onResolveBlocker,
  onDeleteEntry,
  shareHref,
  className,
}: TimelineProps) {
  const dayMs = 86400000;
  
  const types = [
    { id: 'all', label: 'All' },
    { id: 'log', label: 'Log' },
    { id: 'milestone', label: 'Milestone' },
    { id: 'decision', label: 'Decision' },
    { id: 'blocker', label: 'Blocker' },
    { id: 'test', label: 'Test' },
    { id: 'link', label: 'Post' },
  ];

  const filtered = entries
    .filter(e => filter === 'all' || e.type === filter)
    .sort((a, b) => b.ts - a.ts); 

  return (
    <div className={['amees-timeline', className].filter(Boolean).join(' ')}>
      <div className="amees-timeline__filters">
        {types.map(t => (
          <button
            key={t.id}
            className="amees-timeline__filter-btn"
            aria-pressed={filter === t.id}
            onClick={() => onFilterChange(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="amees-timeline__list">
        {filtered.length === 0 ? (
          <p className="amees-timeline__empty">No entries found.</p>
        ) : (
          filtered.map(entry => {
            const dayNum = Math.floor((entry.ts - projectStart) / dayMs) + 1;
            const isOpenBlocker = entry.type === 'blocker' && !entry.resolved;
            const age = Math.floor((now - entry.ts) / dayMs);
            
            const waLink = shareHref ?? `https://wa.me/?text=${encodeURIComponent(
              `Help needed on "${entry.title}": ${entry.text || 'No details provided.'}`
            )}`;

            return (
              <article
                key={entry.id}
                className={[
                  'amees-timeline__item',
                  isOpenBlocker && 'amees-timeline__item--open-blocker',
                ].filter(Boolean).join(' ')}
              >
                <div className={`amees-timeline__marker amees-timeline__marker--${entry.type}`} />
                
                <div className="amees-timeline__content">
                  <div className="amees-timeline__header">
                    <Badge tone={TYPE_TONES[entry.type] || 'neutral'} kind="type">
                      {entry.type.toUpperCase()}
                    </Badge>
                    <h3 className="amees-timeline__title">{entry.title}</h3>
                    {isOpenBlocker && (
                      <span className="amees-timeline__age">Open {age}d</span>
                    )}
                  </div>
                  
                  <div className="amees-timeline__meta">
                    Day {dayNum} · {formatDate(entry.ts)}
                  </div>

                  {entry.text && (
                    <p className="amees-timeline__text">{entry.text}</p>
                  )}

                  <div className="amees-timeline__actions">
                    {entry.type === 'blocker' && (
                      <Button size="sm" pressed={entry.resolved} onClick={() => onResolveBlocker(entry.id)}>
                        {entry.resolved ? 'Reopen' : 'Mark resolved'}
                      </Button>
                    )}
                    {isOpenBlocker && (
                      <Button as="a" href={waLink} target="_blank" rel="noopener noreferrer" size="sm">
                        Ask on WhatsApp
                      </Button>
                    )}
                    {entry.type === 'link' && entry.link && (
                      <Button as="a" href={entry.link} target="_blank" rel="noopener noreferrer" size="sm">
                        Open Post
                      </Button>
                    )}
                    <Button size="sm" onClick={() => onDeleteEntry(entry.id)}>Delete</Button>
                  </div>
                </div>
              </article>
            );
          })
        )}
      </div>
    </div>
  );
}