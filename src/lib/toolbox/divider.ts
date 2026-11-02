export function calculateDivider(vin: number, r1: number, r2: number) {
  if (!(vin > 0 && r1 > 0 && r2 > 0)) return null;
  const vout = vin * (r2 / (r1 + r2));
  const current = vin / (r1 + r2);
  const power = vin * current;
  return { vout, current, power };
}

export function solveDividerR2(vin: number, r1: number, targetVout: number) {
  if (!(vin > 0 && r1 > 0 && targetVout > 0 && targetVout < vin)) return null;
  const r2Exact = r1 * (targetVout / (vin - targetVout));
  return r2Exact;
}