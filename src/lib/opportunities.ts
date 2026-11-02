export type DeadlineState = 'open' | 'soon' | 'closed';

export function getDeadlineState(deadlineIso: string, nowIso: string | Date) {
  const dl = new Date(`${deadlineIso}T23:59:59+01:00`).getTime();
  const now = new Date(nowIso).getTime();
  const diff = dl - now;
  const days = Math.ceil(diff / 86_400_000);

  if (days < 0) return { state: 'closed' as DeadlineState, days, label: 'Closed' };
  if (days === 0) return { state: 'soon' as DeadlineState, days, label: 'Closes today' };
  if (days <= 14) return { state: 'soon' as DeadlineState, days, label: `Closes in ${days} day${days === 1 ? '' : 's'}` };
  return { state: 'open' as DeadlineState, days, label: `Closes in ${days} days` };
}