import type { CalendarEvent } from '../CalendarMonth';
import { Badge } from '../../primitives/Badge';
import './AgendaList.css';

export interface AgendaListProps {
  events: readonly CalendarEvent[];
  /** ISO date string. Hide events before this. */
  from?: string;
  /** ISO date string. Hide events after this. */
  to?: string;
  /** ISO string or Date for "now". */
  now: string | Date;
  className?: string;
}

function formatDateGroup(iso: string): string {
  const d = new Date(`${iso}T12:00:00`); // Midday prevents timezone rolling
  return d.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}

export function AgendaList({ events, from, to, now, className }: AgendaListProps) {
  const todayKey = new Date(now).toISOString().split('T')[0];

  // Filter and sort events
  const filtered = events
    .filter(e => (!from || e.date >= from) && (!to || e.date <= to))
    .sort((a, b) => a.date.localeCompare(b.date));

  if (filtered.length === 0) {
    return (
      <div className={['amees-agenda', className].filter(Boolean).join(' ')}>
        <p className="amees-agenda__empty">No upcoming events scheduled.</p>
      </div>
    );
  }

  // Group by date
  const groups: Record<string, typeof events[number][]> = {};
  filtered.forEach(e => {
    if (!groups[e.date]) groups[e.date] = [];
    groups[e.date].push(e);
  });

  return (
    <div className={['amees-agenda', className].filter(Boolean).join(' ')}>
      {Object.entries(groups).map(([date, dayEvents]) => {
        const isToday = date === todayKey;
        return (
          <div key={date} className="amees-agenda__group">
            <h3 className={`amees-agenda__date ${isToday ? 'amees-agenda__date--today' : ''}`}>
              {formatDateGroup(date)}
              {isToday && <span className="amees-agenda__today-badge"> (Today)</span>}
            </h3>
            <div className="amees-agenda__items">
              {dayEvents.map((ev, i) => (
                <div key={i} className="amees-agenda__item">
                  <div className="amees-agenda__title">{ev.title}</div>
                  {ev.type && ev.type !== 'default' && (
                    <Badge tone={ev.type === 'special' ? 'ok' : 'purple'} kind="tag">
                      {ev.type}
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}