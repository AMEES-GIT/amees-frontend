import { wired } from './home.data';

/** Session hours. Not derivable from wired.start / wired.end, so it lives here. */
export const sessionHours = '3 to 5 pm WAT';

export interface TrackDetail {
  title: string;
  text: string;
}

/** The four WIRED programmes (from the mockup). Swap with the next event's tracks. */
export const trackDetails: TrackDetail[] = [
  {
    title: 'Embedded Systems and Sensing',
    text: 'Microcontrollers, sensors, and reading the physical world into code.',
  },
  {
    title: 'Control and Intelligent Systems',
    text: 'Feedback loops, PID tuning, and adding learning to control.',
  },
  {
    title: 'Electromechanics and Power Systems',
    text: 'Motors, drives, power electronics, and how energy moves.',
  },
  {
    title: 'Design and Modelling',
    text: 'CAD, simulation, and designing a part before you cut it.',
  },
];

/** Passed to RegistrationForm. */
export const registrationTracks: string[] = trackDetails.map((t) => t.title);

export const featuredEvent = {
  title: `${wired.title} ${wired.version}`,
  start: wired.start,
  end: wired.end,
};

/* ---------- sample calendar data, November 2026 ---------- */

export type CalendarKind = 'event' | 'trivia' | 'dialogue' | 'exec';

export interface CalendarEvent {
  id: string;
  date: Date;
  title: string;
  kind: CalendarKind;
}

/**
 * All dates are WAT (+01:00). Noon is used so the calendar day stays the same
 * even if the browser sits in another timezone.
 */
const wat = (day: number): Date =>
  new Date(`2026-11-${String(day).padStart(2, '0')}T12:00:00+01:00`);

/** SAMPLE ONLY. The exec meeting days follow the mockup rule and are unconfirmed. */
export const sampleNovember: CalendarEvent[] = [
  { id: 'wired-open', date: wat(9), title: `${wired.title} ${wired.version} opens`, kind: 'event' },
  ...[3, 10, 17, 24].map((d) => ({
    id: `trivia-${d}`,
    date: wat(d),
    title: 'Trivia Tuesday',
    kind: 'trivia' as const,
  })),
  ...[1, 8, 15, 22, 29].map((d) => ({
    id: `dialogue-${d}`,
    date: wat(d),
    title: 'Dialogue Evening',
    kind: 'dialogue' as const,
  })),
  ...[2, 30].map((d) => ({
    id: `exec-${d}`,
    date: wat(d),
    title: 'Executive meeting',
    kind: 'exec' as const,
  })),
];

/** JS-style month index (0 = January), so 10 = November. */
export const CAL_YEAR = 2026;
export const CAL_MONTH = 10;