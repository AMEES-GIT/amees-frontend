import { useState, useMemo } from 'react';
import { Wrap, Block, Grid } from '../components/containers/Layout';
import { PageHeader } from '../components/containers/PageHeader';
import { Window } from '../components/containers/Window';
import { DotList } from '../components/containers/DotList';
import { CalendarMonth } from '../components/calendar/CalendarMonth';
import { AgendaList } from '../components/calendar/AgendaList';
import { useNow } from '../lib/useNow';
import { watMonth, monthLabel, watIsoDate } from '../lib/format';
import { useContent, useFeatured } from '../content/contentProvider';
import { monthEvents } from '../content/selectors';
import './CalendarPage.css';

export function CalendarPage() {
  const content = useContent();
  const f = useFeatured();
  const now = useNow(60_000);

  const intro = content.pages.calendar;
  const milestones = content.calendarMilestones || [];

  // If there's no featured event, still show the calendar but skip the highlight.
  const highlightRange = f
    ? { start: watIsoDate(f.start), end: watIsoDate(f.end) }
    : { start: '', end: '' };

  const initialCal = useMemo(() => watMonth(now), [now]);
  const [calDate, setCalDate] = useState(initialCal);

  const handlePrev = () => {
    setCalDate((prev) => {
      const d = new Date(prev.year, prev.month - 1, 1);
      return { year: d.getFullYear(), month: d.getMonth() };
    });
  };

  const handleNext = () => {
    setCalDate((prev) => {
      const d = new Date(prev.year, prev.month + 1, 1);
      return { year: d.getFullYear(), month: d.getMonth() };
    });
  };

  const handleToday = () => {
    setCalDate(watMonth(now));
  };

  const events = monthEvents(content, calDate.year, calDate.month);

  return (
    <Wrap>
      <Block>
        <PageHeader
          className="calendar-header"
          kicker={intro.kicker}
          title={intro.title}
          lede={intro.lede}
        />
      </Block>

      <Block>
        <Grid min={320}>
          {/* Main Calendar Window */}
          <div style={{ gridColumn: 'span 2', minWidth: 0 }}>
            <Window title={monthLabel(calDate.year, calDate.month)} meta="Africa/Lagos">
              {/* Desktop view: Month Grid */}
              <div className="cal-desktop-only">
                <CalendarMonth
                  year={calDate.year}
                  month={calDate.month}
                  events={events}
                  now={now}
                  highlightRange={highlightRange}
                  onPrev={handlePrev}
                  onNext={handleNext}
                  onToday={handleToday}
                />
              </div>

              {/* Mobile view: Agenda List */}
              <div className="cal-mobile-only">
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: 'var(--sp-3)',
                  }}
                >
                  <button className="amees-btn amees-btn--sm" onClick={handlePrev}>
                    Prev
                  </button>
                  <button className="amees-btn amees-btn--sm" onClick={handleToday}>
                    Today
                  </button>
                  <button className="amees-btn amees-btn--sm" onClick={handleNext}>
                    Next
                  </button>
                </div>
                <AgendaList
                  events={events}
                  from={`${calDate.year}-${String(calDate.month + 1).padStart(2, '0')}-01`}
                  now={now}
                />
              </div>
            </Window>
          </div>

          {/* Sidebar: Milestones */}
          <div style={{ minWidth: 0 }}>
            <Window title="Session milestones" scrollbar>
              {milestones.length > 0 ? (
                <DotList
                  items={milestones.map((m, i) => (
                    <span key={i}>
                      <b>{m.title}</b>: {m.text}
                    </span>
                  ))}
                />
              ) : (
                <p className="muted-text">Milestones will be added soon.</p>
              )}
            </Window>
          </div>
        </Grid>
      </Block>

      {content.calendarNote && (
        <Block>
          <div className="amees-note" role="note">
            {content.calendarNote}
          </div>
        </Block>
      )}
    </Wrap>
  );
}