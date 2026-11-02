export const BAND_COLORS = [
  { name: 'Black', hex: '#1A1A1A', val: 0 },
  { name: 'Brown', hex: '#7B3F00', val: 1 },
  { name: 'Red', hex: '#D32F2F', val: 2 },
  { name: 'Orange', hex: '#F57C00', val: 3 },
  { name: 'Yellow', hex: '#FBC02D', val: 4 },
  { name: 'Green', hex: '#2E7D32', val: 5 },
  { name: 'Blue', hex: '#1565C0', val: 6 },
  { name: 'Violet', hex: '#6A1B9A', val: 7 },
  { name: 'Grey', hex: '#757575', val: 8 },
  { name: 'White', hex: '#F5F5F5', val: 9 },
];

export const MULTIPLIERS = [
  ...BAND_COLORS.map(c => ({ name: c.name, hex: c.hex, val: c.val })),
  { name: 'Gold', hex: '#D4AF37', val: -1 },
  { name: 'Silver', hex: '#BDBDBD', val: -2 },
];

export const TOLERANCES = [
  { name: 'Brown', hex: '#7B3F00', val: 1 },
  { name: 'Red', hex: '#D32F2F', val: 2 },
  { name: 'Green', hex: '#2E7D32', val: 0.5 },
  { name: 'Blue', hex: '#1565C0', val: 0.25 },
  { name: 'Violet', hex: '#6A1B9A', val: 0.1 },
  { name: 'Grey', hex: '#757575', val: 0.05 },
  { name: 'Gold', hex: '#D4AF37', val: 5 },
  { name: 'Silver', hex: '#BDBDBD', val: 10 },
];

export function decodeResistor(bands: number[]): { value: number; tol: number } {
  const d1 = BAND_COLORS[bands[0]].val;
  const d2 = BAND_COLORS[bands[1]].val;
  const mult = MULTIPLIERS[bands[2]].val;
  const tol = TOLERANCES[bands[3]].val;
  
  const value = (d1 * 10 + d2) * Math.pow(10, mult);
  return { value, tol };
}

export function encodeResistor(value: number): number[] | null {
  if (value <= 0) return null;
  const exp = Math.floor(Math.log10(value));
  const sig = Math.round(value / Math.pow(10, exp - 1));
  
  if (sig < 10 || sig >= 100) return null;
  
  const d1 = Math.floor(sig / 10);
  const d2 = sig % 10;
  const mult = exp - 1;
  
  const multIdx = MULTIPLIERS.findIndex(m => m.val === mult);
  if (multIdx === -1) return null;
  
  // Default to Gold tolerance (5%)
  const tolIdx = TOLERANCES.findIndex(t => t.val === 5);
  
  return [d1, d2, multIdx, tolIdx];
}

export const E24 = [
  1.0, 1.1, 1.2, 1.3, 1.5, 1.6, 1.8, 2.0, 2.2, 2.4, 2.7, 3.0,
  3.3, 3.6, 3.9, 4.3, 4.7, 5.1, 5.6, 6.2, 6.8, 7.5, 8.2, 9.1
];

/** Returns the closest E24 standard value (e.g. 1.94k -> 2k). */
export function nearestE24(val: number): number {
  if (val <= 0) return 0;
  const exp = Math.floor(Math.log10(val));
  const base = Math.pow(10, exp);
  const norm = val / base;
  
  let closest = E24[0];
  let minDiff = Math.abs(norm - closest);
  
  for (const v of E24) {
    const diff = Math.abs(norm - v);
    if (diff < minDiff) { minDiff = diff; closest = v; }
  }
  
  if (norm > 9.1 && norm <= 10) return nearestE24(10 * base);
  return closest * base;
}

/** Returns the next higher E24 standard value (e.g. 280 -> 300). */
export function nextE24(val: number): number {
  if (val <= 0) return 0;
  const exp = Math.floor(Math.log10(val));
  const base = Math.pow(10, exp);
  const norm = val / base;
  
  for (const v of E24) {
    if (v >= norm - 0.0001) return v * base;
  }
  return E24[0] * base * 10; 
}