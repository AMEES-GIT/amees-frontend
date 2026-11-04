import { useState, useMemo } from 'react';
import { Wrap, Block, Grid, Row } from '../components/containers/Layout';
import { PageHeader } from '../components/containers/PageHeader';
import { Window } from '../components/containers/Window';
import { RowList } from '../components/containers/RowList';
import { DotList } from '../components/containers/DotList';
import { Button } from '../components/primitives/Button';
import { CalendarMonth } from '../components/calendar/CalendarMonth';
import { RegistrationForm } from '../components/home/RegistrationForm';
import { AmeesLive, type LiveEvent } from '../components/home/LiveWindow/LiveWindow';
import { useNow } from '../lib/useNow';
import { eventState } from '../lib/eventState';
import { fmtDay, fmtYear, fmtTime, watIsoDate, watMonth, monthLabel } from '../lib/format';
import { useContent, useFeatured } from '../content/contentProvider';
import { monthEvents, weeklyRows } from '../content/selectors';
import type { PageId } from './types';
import './EventsPage.css';

interface EventsPageProps {
  onNavigate: (page: PageId) => void;
}

/** Scrolls to the form and focuses its first field. Honours reduced motion. */
function goToRegister() {
  const el = document.getElementById('register');
  if (!el) return;
  const reduce =
    window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
    document.documentElement.dataset.motion === 'reduce';
  el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
  el.querySelector<HTMLElement>('input, select, textarea')?.focus({ preventScroll: true });
}

export function EventsPage({ onNavigate }: EventsPageProps) {
  const content = useContent();
  const f = useFeatured();
  if (!f) {
    return (
      <Wrap>
        <Block>
          <PageHeader
            kicker={content.pages.events.kicker}
            title={content.pages.events.title}
            lede="No featured event is scheduled right now. Check back soon."
          />
        </Block>
      </Wrap>
    );
  }
  
  const now = useNow(60_000);
  const nowTime = now.getTime();
  const state = eventState(now, f.start, f.end);
  const name = `${f.title} ${f.version}`;
  const canRegister = f.registrationOpen && state !== 'after';
  const intro = content.pages.events;

  // --- FIND LIVE EVENT ---
  let liveEvent: LiveEvent | null = null;

  // 1. Check Featured Event
  if (nowTime >= f.start.getTime() && nowTime <= f.end.getTime()) {
    liveEvent = {
      title: f.title,
      subtitle: f.subtitle,
      theme: f.theme,
      venue: f.venue,
      start: f.start.toISOString(),
      end: f.end.toISOString(),
      joinUrl: f.joinUrl || undefined,
      registrationUrl: f.registrationUrl || undefined,
    };
  }

  // 2. Check Calendar Entries (One-off)
  if (!liveEvent) {
    const activeCal = content.calendarEntries.find(e => {
      const startStr = `${e.day}T${e.startTime || '00:00'}:00`;
      const endStr = e.endDate || `${e.day}T${e.endTime || '23:59'}:00`;
      const start = new Date(startStr).getTime();
      const end = new Date(endStr).getTime();
      return nowTime >= start && nowTime <= end;
    });

    if (activeCal) {
      liveEvent = {
        title: activeCal.title,
        subtitle: activeCal.description,
        venue: activeCal.venue || undefined,
        start: new Date(`${activeCal.day}T${activeCal.startTime || '00:00'}:00`).toISOString(),
        end: activeCal.endDate || new Date(`${activeCal.day}T${activeCal.endTime || '23:59'}:00`).toISOString(),
        joinUrl: activeCal.joinUrl || undefined,
        registrationUrl: activeCal.registrationUrl || undefined,
      };
    }
  }

  // 3. Check Weekly Rhythm
  if (!liveEvent) {
    const today = now.getDay();
    const activeWeekly = content.weekly.find(w => {
      if (w.weekday !== today || !w.startTime || !w.endTime) return false;
      const [h1, m1] = w.startTime.split(':').map(Number);
      const [h2, m2] = w.endTime.split(':').map(Number);
      
      const start = new Date(now); start.setHours(h1, m1, 0, 0);
      const end = new Date(now); end.setHours(h2, m2, 0, 0);
      
      return nowTime >= start.getTime() && nowTime <= end.getTime();
    });
    
    if (activeWeekly) {
      const [h1, m1] = activeWeekly.startTime!.split(':').map(Number);
      const [h2, m2] = activeWeekly.endTime!.split(':').map(Number);
      const start = new Date(now); start.setHours(h1, m1, 0, 0);
      const end = new Date(now); end.setHours(h2, m2, 0, 0);
      
      liveEvent = {
        title: activeWeekly.title,
        subtitle: activeWeekly.text,
        venue: activeWeekly.venue || undefined,
        start: start.toISOString(),
        end: end.toISOString(),
        joinUrl: activeWeekly.joinUrl || undefined,
        registrationUrl: activeWeekly.registrationUrl || undefined,
      };
    }
  }

  // Calendar state
  const initialCal = useMemo(() => watMonth(state === 'before' ? f.start : now), [state, f.start, now]);
  const [calDate, setCalDate] = useState(initialCal);

  const handlePrev = () => {
    setCalDate(prev => {
      const d = new Date(prev.year, prev.month - 1, 1);
      return { year: d.getFullYear(), month: d.getMonth() };
    });
  };

  const handleNext = () => {
    setCalDate(prev => {
      const d = new Date(prev.year, prev.month + 1, 1);
      return { year: d.getFullYear(), month: d.getMonth() };
    });
  };

  const handleToday = () => {
    setCalDate(watMonth(now));
  };

  const factRows = [
    { 
      lead: 'Dates', 
      title: `${fmtDay(f.start)} to ${fmtDay(f.end)}`, 
      meta: `${fmtYear(f.end)} • ${f.sessionHours}` 
    },
    { 
      lead: 'Venue', 
      title: f.venue 
    },
    { 
      lead: 'Demo Day', 
      title: `${fmtDay(f.end)} at ${fmtTime(f.end)} WAT`, 
      meta: f.demoNote 
    },
  ];

  const trackRows = f.tracks.map((t, i) => ({ 
    lead: String(i + 1), 
    title: t.title, 
    meta: t.text 
  }));

  return (
    <Wrap>
      <Block>
        <PageHeader 
          className="events-header" 
          kicker={intro.kicker} 
          title={intro.title} 
          lede={intro.lede} 
        />
      </Block>

      {/* RENDER LIVE WINDOW IF ANY EVENT IS CURRENTLY HAPPENING */}
      {liveEvent && (
        <Block>
          <AmeesLive event={liveEvent} />
        </Block>
      )}

      <Block>
        <Window
          className="events-hero"
          title={name}
          meta={state === 'before' ? 'Coming up' : state === 'during' ? 'Happening now' : 'Finished'}
        >
          <RowList rows={factRows} />
          
          <Row className="mt-4">
            {canRegister && (
              <Button variant="primary" onClick={goToRegister}>
                Register for {f.title} {f.version} →
              </Button>
            )}
            <Button onClick={() => onNavigate('calendar')}>
              See the full calendar
            </Button>
          </Row>
        </Window>
      </Block>

      {state === 'after' ? (
        <Block>
          <Window title="Registration" meta="Closed">
            <p>Registration has closed. Check the calendar to see what is coming up next.</p>
            <Row className="mt-4">
              <Button variant="primary" onClick={() => onNavigate('calendar')}>
                View calendar →
              </Button>
            </Row>
          </Window>
        </Block>
      ) : (
        <Block>
          <Grid min={320}>
            <Window title="Programs" meta={`${f.tracks.length} tracks`}>
              <RowList rows={trackRows} />
            </Window>

            <div id="register">
              {canRegister ? (
                <RegistrationForm
                  eventTitle={f.title}
                  formUrl={content.eventRegistrationFormUrl}
                  eventFieldId={content.eventRegistrationEventFieldId}
                  open={f.registrationOpen}
                />
              ) : (
                <Window title="Registration" meta="Closed">
                  <p>Registration is not open right now.</p>
                </Window>
              )}
            </div>
          </Grid>
        </Block>
      )}

      <Block>
        <Window title="Weekly Schedule" meta="Every week">
          <RowList rows={weeklyRows(content)} />
        </Window>
      </Block>

      <Block>
        <Window title={monthLabel(calDate.year, calDate.month)}>
          <CalendarMonth
            year={calDate.year}
            month={calDate.month}
            events={monthEvents(content, calDate.year, calDate.month)}
            now={now}
            highlightRange={{ start: watIsoDate(f.start), end: watIsoDate(f.end) }}
            onPrev={handlePrev}
            onNext={handleNext}
            onToday={handleToday}
            onEventClick={(id) => {
              window.history.pushState({}, '', `/event/${id}`);
              window.dispatchEvent(new PopStateEvent('popstate'));
            }}
          />
        </Window>
      </Block>

      {content.upcoming.length > 0 && (
        <Block>
          <Window title="Later this year">
            <DotList
              items={content.upcoming.map((e) => (
                <span key={e.id}>
                  <b>{e.title}</b>: {e.text}
                </span>
              ))}
            />
          </Window>
        </Block>
      )}
    </Wrap>
  );
}