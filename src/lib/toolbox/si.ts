const MUL: Record<string, number> = {
  p: 1e-12, n: 1e-9, u: 1e-6, 'µ': 1e-6, m: 1e-3,
  '': 1, k: 1e3, K: 1e3, M: 1e6, G: 1e9,
};

/** Parses a string like "4k7", "20m", "2.2M", "100n" into a number. */
export function parseSI(val: string): number {
  if (!val) return NaN;
  let s = val.trim().replace(/ohms?|Ω/gi, '').replace(/,/g, '');
  
  // Handle "4k7" format
  const rMatch = s.match(/^(\d+)([kKMR])(\d+)$/);
  if (rMatch) {
    const prefix = rMatch[2];
    const mult = prefix === 'R' ? 1 : (MUL[prefix] || 1);
    return parseFloat(`${rMatch[1]}.${rMatch[3]}`) * mult;
  }

  // Handle standard "4.7k" or "20m" format
  const m = s.match(/^(-?\d*\.?\d+(?:e[-+]?\d+)?)\s*([pnuµmkKMGR]?)$/i);
  if (!m) return NaN;
  
  let prefix = m[2];
  if (prefix === 'R' || prefix === 'r') prefix = '';
  const mult = prefix && MUL[prefix] !== undefined ? MUL[prefix] : 1;
  return parseFloat(m[1]) * mult;
}

/** Formats a number into a readable SI string, e.g. 4700 -> "4.7 k". */
export function fmtSI(val: number, unit: string = ''): string {
  if (!isFinite(val)) return '—';
  if (val === 0) return `0 ${unit}`.trim();
  
  const abs = Math.abs(val);
  const prefixes = ['p', 'n', 'µ', 'm', '', 'k', 'M', 'G'];
  let exp = Math.floor(Math.log10(abs) / 3);
  exp = Math.max(-4, Math.min(3, exp));
  
  let num = val / Math.pow(10, exp * 3);
  // If rounding pushes us to the next magnitude (e.g. 999.9k -> 1M)
  if (Math.abs(num) >= 999.5 && exp < 3) {
    exp++;
    num = val / Math.pow(10, exp * 3);
  }
  
  // Round to 3 significant figures to avoid floating point weirdness
  const rounded = Number(num.toPrecision(3));
  return `${rounded} ${prefixes[exp + 4]}${unit}`;
}