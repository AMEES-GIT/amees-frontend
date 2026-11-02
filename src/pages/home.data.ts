import type { PageId } from './types';

// Dates from the brief: WIRED 1.0 runs 9 Nov to 3 Dec 2026, 3 pm WAT start, demo day 3 Dec 5 pm WAT (UTC+1).
export const wired = {
  pre: 'The Association of Mechatronics and Electrical and Electronics Engineering Students presents',
  title: 'Wired',
  version: '1.0',
  theme: 'Connecting minds through innovation',
  // Copy from the mockup. "Largest" is a claim: confirm it before launch.
  subtitle: "LCU's largest hardware tech bootcamp",
  start: new Date('2026-11-09T15:00:00+01:00'),
  end: new Date('2026-12-03T17:00:00+01:00'),
  venueLine: '3 to 5 pm, Faculty of Engineering Building',
} as const;

export interface QuickLink {
  id: PageId;
  title: string;
  meta: string;
  text: string;
  cta: string;
}

export const quickLinks: QuickLink[] = [
  { id: 'archive', title: 'Study archive', meta: 'by level', text: 'Past questions, notes, slides and lab manuals, sorted by level.', cta: 'Open archive' },
  { id: 'toolbox', title: 'Engineering toolbox', meta: 'new', text: "Resistor codes, Ohm's law, voltage dividers, a PID playground, and ESP32 pinouts.", cta: 'Open toolbox' },
  { id: 'workbench', title: 'Project workbench', meta: 'new', text: 'Track a Wired project with a timeline, tasks, parts, tests, and a demo-day report.', cta: 'Open workbench' },
  { id: 'calendar', title: 'Calendar', meta: 'month view', text: 'Sessions, deadlines and events in one place.', cta: 'See calendar' },
  { id: 'opportunities', title: 'Opportunities', meta: 'saved on your device', text: 'Opportunities with deadlines. Filter by level and save the ones you want.', cta: 'See opportunities' },
  { id: 'projects', title: 'Projects', meta: 'year-round', text: 'Projects built by AMEES members.', cta: 'See projects' },
];

export interface Row {
  lead: string;
  title: string;
  meta: string;
}

export const weeklyRows: Row[] = [
  { lead: 'Tue', title: 'Trivia Tuesday', meta: 'Every week' },
  { lead: 'Sun', title: 'Dialogue Evening', meta: 'Every week' },
];

// SAMPLE listing, copied from the mockup. Replace with the real archive repo later.
export interface ArchiveSample {
  title: string;
  course: string;
  kind: string;
  year: number;
  ext: string;
}

export const latestArchive: ArchiveSample[] = [
  { title: 'Control Systems I lecture slides', course: 'MCE 301', kind: 'Slides', year: 2026, ext: 'PPT' },
  { title: 'Microprocessors and Interfacing notes', course: 'MCE 303', kind: 'Notes', year: 2026, ext: 'PDF' },
  { title: 'Robotics and Kinematics slides', course: 'MCE 401', kind: 'Slides', year: 2026, ext: 'PPT' },
];

export const moreEvents: { title: string; text: string; tag: string }[] = [
  { title: 'AMEES Tech Week', text: 'Second semester, held with Student Week. Includes the joint cross-faculty event.', tag: 'Second semester' },
  { title: 'Soft skills workshop', text: 'Communication, teamwork, and presenting your work.', tag: 'Second semester' },
  { title: 'Inter-departmental challenge', text: 'Teams from other departments compete on a build brief.', tag: 'Second semester' },
  { title: 'AMEES Legacy Project', text: 'A lasting build for the department, made mostly over the holiday.', tag: 'Second semester' },
];

export const tracks: string[] = [
  'Embedded Systems and Sensing',
  'Control and Intelligent Systems',
  'Electromechanics and Power Systems',
  'Design and Modelling',
];
