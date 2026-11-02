export function calculateRC(r: number, c: number) {
  if (!(r > 0 && c > 0)) return null;
  const tau = r * c;
  const fc = 1 / (2 * Math.PI * tau);
  const riseTime = 2.2 * tau;
  const settleTime = 4.6 * tau;
  return { tau, fc, riseTime, settleTime };
}