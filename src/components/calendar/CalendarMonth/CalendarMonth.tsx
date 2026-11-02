import { Button } from '../../primitives/Button';
import './CalendarMonth.css';

export interface CalendarEvent {
  /** ISO date string (YYYY-MM-DD) in WAT. */
  date: string;
  title: string;
  /** Visual type. 'special' = green, 'holiday' = purple, 'default' = blue. */
  type?: 'default' | 'special' | 'holiday';
}

export interface CalendarMonthProps {
  /** 0-indexed month (0 = January, 11 = December). */
  year: number;
  /** 0-indexed month. */
  month: number;
  events: readonly CalendarEvent[];
  /** ISO string or Date for "now". Used to highlight the current day. */
  now: string | Date;
  /** Optional range to highlight (e.g. WIRED bootcamp window). */
  highlightRange?: { start: string; end: string };
  onPrev?: () => void;
  onNext?: () => void;
  onToday?: () => void;
  className?: string;
}

function getMonthName(year: number, month: number): string {
  const d = new Date(year, month, 1);
  return d.toLocaleString('en-GB', { month: 'long', year: 'numeric' });
}

function dateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function CalendarMonth({
  year,
  month,
  events,
  now,
  highlightRange,
  onPrev,
  onNext,
  onToday,
  className,
}: CalendarMonthProps) {
  const todayDate = new Date(now);
  const todayKey = dateKey(todayDate);

  // Date math for the grid
  const firstDay = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  // Monday-first offset (0 = Monday, 6 = Sunday)
  const offset = (firstDay.getDay() + 6) % 7;
  const totalCells = Math.ceil((offset + daysInMonth) / 7) * 7;

  const cells = Array.from({ length: totalCells }, (_, i) => {
    const dayNum = i - offset + 1;
    const isCurrentMonth = dayNum >= 1 && dayNum <= daysInMonth;
    const cellDate = new Date(year, month, dayNum);
    const cellKey = dateKey(cellDate);
    
    const dayEvents = isCurrentMonth ? events.filter(e => e.date === cellKey) : [];
    const isToday = isCurrentMonth && cellKey === todayKey;
    
    let isInRange = false;
    if (isCurrentMonth && highlightRange) {
      isInRange = cellKey >= highlightRange.start && cellKey <= highlightRange.end;
    }

    return { dayNum: isCurrentMonth ? dayNum : null, dayEvents, isToday, isInRange };
  });

  const dows = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <div className={['amees-cal', className].filter(Boolean).join(' ')}>
      <div className="amees-cal__header">
        <h2 className="amees-cal__title">{getMonthName(year, month)}</h2>
        <div className="amees-cal__nav">
          <Button size="sm" onClick={onPrev} aria-label="Previous month">Prev</Button>
          <Button size="sm" onClick={onToday}>Today</Button>
          <Button size="sm" onClick={onNext} aria-label="Next month">Next</Button>
        </div>
      </div>

      <div className="amees-cal__grid">
        {dows.map(d => (
          <div key={d} className="amees-cal__dow">{d}</div>
        ))}
        
        {cells.map((cell, i) => (
          <div
            key={i}
            className={[
              'amees-cal__day',
              cell.dayNum === null && 'amees-cal__day--off',
              cell.isInRange && 'amees-cal__day--in-range',
              cell.isToday && 'amees-cal__day--today',
            ].filter(Boolean).join(' ')}
          >
            {cell.dayNum && (
              <>
                <span className="amees-cal__num">{cell.dayNum}</span>
                <div className="amees-cal__events">
                  {cell.dayEvents.map((ev, j) => (
                    <div 
                      key={j} 
                      className={`amees-cal__chip amees-cal__chip--${ev.type || 'default'}`}
                      title={ev.title}
                    >
                      {ev.title}
                    </div>
                  ))}
                  {/* Mobile dots fallback (hidden >480px, shown <480px) */}
                  {cell.dayEvents.length > 0 && (
                    <div className="amees-cal__dots">
                      {cell.dayEvents.map((_, j) => (
                         <span key={j} className="amees-cal__dot" />
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      <div className="amees-cal__legend">
        <span className="amees-cal__legend-item amees-cal__legend-item--range">Highlighted window</span>
        <span className="amees-cal__legend-item amees-cal__legend-item--special">Special</span>
        <span className="amees-cal__legend-item amees-cal__legend-item--holiday">Holiday</span>
      </div>
    </div>
  );
}