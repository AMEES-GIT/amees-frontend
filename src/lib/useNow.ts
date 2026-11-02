import { useEffect, useState } from 'react';

/** Current time, refreshed every `intervalMs`. One instance per ticking area, so the rest of the page doesn't re-render. */
export function useNow(intervalMs = 1000): Date {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), intervalMs);
    return () => window.clearInterval(id);
  }, [intervalMs]);
  return now;
}