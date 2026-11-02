export function calculateTestResult(exp: number, meas: number, tol: number) {
  if (exp === 0) {
    const err = Math.abs(meas) * 100;
    return { err, pass: err <= tol };
  }
  const err = Math.abs(meas - exp) / Math.abs(exp) * 100;
  return { err, pass: err <= tol };
}