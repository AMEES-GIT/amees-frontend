export type EventState = 'before' | 'during' | 'after';

export function eventState(now: Date, start: Date, end: Date): EventState {
  if (now.getTime() < start.getTime()) return 'before';
  if (now.getTime() < end.getTime()) return 'during';
  return 'after';
}