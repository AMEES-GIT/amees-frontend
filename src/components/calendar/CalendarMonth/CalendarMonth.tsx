import { useState, useEffect } from 'react';
import { Button } from '../../primitives/Button';
import './CalendarMonth.css';

export interface CalendarEvent {
  id: string;
  date: string;
  title: string;
  description?: string;
  type?: 'default' | 'special' | 'holiday';
}

export interface CalendarMonthProps {
  year: number;
  month: number;
  events: readonly CalendarEvent[];
  now: string | Date;
  highlightRange?: { start: string; end: string };
  onPrev?: () => void;
  onNext?: () => void;
  onToday?: () => void;
  onEventClick?: (id: string) => void;
  className?: string;
}

function getMonthName(year: number, month: number): string {
  return new Date(year, month, 1).toLocaleString('en-GB', { month: 'long', year: 'numeric' });
}

function dateKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function CalendarMonth({ year, month, events, now, highlightRange, onPrev, onNext, onToday, onEventClick, className }: CalendarMonthProps) {
  const todayDate = new Date(now);
  const todayKey = dateKey(todayDate);
  
  // Mobile selection state
  const [selectedDate, setSelectedDate] = useState<string>(todayKey);

  // When navigating months, default the selected date to the 1st of that month
  useEffect(() => {
    if (todayDate.getFullYear() === year && todayDate.getMonth() === month) {
      setSelectedDate(todayKey);
    } else {
      setSelectedDate(dateKey(new Date(year, month, 1)));
    }
  }, [year, month, todayKey]);

  const firstDay = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const offset = (firstDay.getDay() + 6) % 7; // Monday-first
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

    return { dayNum: isCurrentMonth ? dayNum : null, cellKey, dayEvents, isToday, isInRange };
  });

  const dows = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  // Events for the mobile view
  const selectedEvents = events.filter(e => e.date === selectedDate);

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
        {dows.map(d => <div key={d} className="amees-cal__dow">{d}</div>)}
        
        {cells.map((cell, i) => (
          <div
            key={i}
            className={[
              'amees-cal__day',
              cell.dayNum === null && 'amees-cal__day--off',
              cell.isInRange && 'amees-cal__day--in-range',
              cell.isToday && 'amees-cal__day--today',
              cell.cellKey === selectedDate && 'amees-cal__day--selected'
            ].filter(Boolean).join(' ')}
            onClick={() => {
              if (cell.dayNum !== null) setSelectedDate(cell.cellKey);
            }}
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
                      onClick={(e) => {
                        if (onEventClick) {
                          e.stopPropagation(); // Prevent day selection
                          onEventClick(ev.id);
                        }
                      }}
                    >
                      {ev.title}
                    </div>
                  ))}
                  {cell.dayEvents.length > 0 && (
                    <div className="amees-cal__dots">
                      {cell.dayEvents.map((_, j) => <span key={j} className="amees-cal__dot" />)}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      {/* Mobile Daily View */}
      <div className="amees-cal__mobile-view">
        <h4 className="amees-cal__mobile-date">
          {new Date(selectedDate).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}
        </h4>
        {selectedEvents.length === 0 ? (
          <p className="amees-cal__mobile-empty">No events on this day.</p>
        ) : (
          <div className="amees-cal__mobile-list">
            {selectedEvents.map(ev => (
              <div 
                key={ev.id} 
                className={`amees-cal__mobile-item amees-cal__mobile-item--${ev.type || 'default'}`}
                onClick={() => onEventClick && onEventClick(ev.id)}
              >
                <b>{ev.title}</b>
                {ev.description && <p>{ev.description}</p>}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="amees-cal__legend">
        <span className="amees-cal__legend-item amees-cal__legend-item--range">Highlighted window</span>
        <span className="amees-cal__legend-item amees-cal__legend-item--special">Special</span>
        <span className="amees-cal__legend-item amees-cal__legend-item--holiday">Holiday</span>
      </div>
    </div>
  );
}