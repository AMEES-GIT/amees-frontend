import type { ComponentProps } from 'react';
import type { CalendarMonth } from '../components/calendar/CalendarMonth';
import { watIsoDate } from '../lib/format';
import type { FeaturedEvent, SiteContent } from './types';

export type CalendarEvents = ComponentProps<typeof CalendarMonth>['events'];
type CalendarItem = CalendarEvents[number];

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const pad = (n: number) => String(n).padStart(2, '0');

export interface ParsedFeatured extends Omit<FeaturedEvent, 'start' | 'end'> {
  start: Date;
  end: Date;
}

export function parseFeatured(f: FeaturedEvent): ParsedFeatured {
  return { ...f, start: new Date(f.start), end: new Date(f.end) };
}

/** Rows for RowList: the weekly rhythm. */
export function weeklyRows(c: SiteContent) {
  return c.weekly.map((w) => ({
    lead: w.weekday !== undefined ? DAY_NAMES[w.weekday] : (w.label ?? 'Wk'),
    title: w.title,
    meta: w.text,
  }));
}

/** Every calendar item in one month: weekly items by weekday, one-offs, and the featured event's ends. */
export function monthEvents(c: SiteContent, year: number, month: number): CalendarEvents {
  const out: CalendarItem[] = [];
  const days = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  const prefix = `${year}-${pad(month + 1)}`;

  // 1. Weekly recurring items
  for (let d = 1; d <= days; d++) {
    const weekday = new Date(Date.UTC(year, month, d)).getUTCDay();
    for (const w of c.weekly) {
      if (w.weekday === weekday) {
        out.push({ 
          id: w.id, 
          date: `${prefix}-${pad(d)}`, 
          title: w.title, 
          description: w.text, // Pass description for mobile view
          type: w.type ?? 'default' 
        });
      }
    }
  }

  // 2. One-off calendar entries
  for (const e of c.calendarEntries) {
    if (e.day.startsWith(prefix)) {
      out.push({ 
        id: e.id, 
        date: e.day, 
        title: e.title, 
        description: e.description, // Pass description for mobile view
        type: e.type 
      });
    }
  }

  // 3. Featured event milestones (Open/Demo)
  const f = parseFeatured(c.featured);
  const name = `${f.title} ${f.version}`;
  const startDay = watIsoDate(f.start);
  const endDay = watIsoDate(f.end);
  
  if (startDay.startsWith(prefix)) {
    out.push({ id: 'featured-start', date: startDay, title: `${name} opens`, type: 'special' });
  }
  if (endDay.startsWith(prefix)) {
    out.push({ id: 'featured-end', date: endDay, title: `${name} demo day`, type: 'special' });
  }

  return out;
}

/** Props for <Footer />, from content. */
export function footerProps(c: SiteContent) {
  return {
    tagline: c.footer.tagline,
    groups: c.footer.groups.map((g) => ({
      title: g.title,
      links: g.links.map((l) => ({ 
        label: l.label, 
        // Changed from hash routing to path routing
        href: l.page === 'home' ? '/' : `/${l.page}` 
      })),
    })),
    external: c.footer.external,
  };
}