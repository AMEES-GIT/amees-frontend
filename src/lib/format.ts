const WAT = 'Africa/Lagos';

/** "9 Nov" */
export const fmtDay = (d: Date): string =>
  d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', timeZone: WAT });

/** "2026" */
export const fmtYear = (d: Date): string =>
  d.toLocaleDateString('en-GB', { year: 'numeric', timeZone: WAT });

/** "5pm" or "3:30pm" */
export const fmtTime = (d: Date): string =>
  d
    .toLocaleTimeString('en-GB', { hour: 'numeric', minute: '2-digit', hour12: true, timeZone: WAT })
    .replace(':00', '')
    .replace(/\s+/g, '');

/** "2026-11-09": the calendar day of an instant, as seen in WAT. */
export const watIsoDate = (d: Date): string => d.toLocaleDateString('en-CA', { timeZone: WAT });

/** Year and 0-based month of an instant, as seen in WAT. */
export const watMonth = (d: Date): { year: number; month: number } => {
  const [y, m] = watIsoDate(d).split('-').map(Number);
  return { year: y, month: m - 1 };
};

/** "November 2026" */
export const monthLabel = (year: number, month: number): string =>
  new Date(Date.UTC(year, month, 1)).toLocaleDateString('en-GB', {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  });