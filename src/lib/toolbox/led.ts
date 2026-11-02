export function calculateLed(vs: number, vf: number, i: number) {
  if (!(vs > 0 && vf > 0 && i > 0)) return null;
  if (vs <= vf) return null;

  const exactR = (vs - vf) / i;
  return { exactR };
}