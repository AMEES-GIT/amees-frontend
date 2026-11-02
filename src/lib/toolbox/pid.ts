export interface PidParams {
  kp: number; ki: number; kd: number;
  K: number; tau: number; L: number;
}

export function simulatePID(p: PidParams) {
  const dt = 0.01;
  const totalTime = 12; // seconds
  const steps = totalTime / dt;
  
  const delaySteps = Math.round(p.L / dt);
  const buffer = new Array(delaySteps).fill(0);
  
  let y = 0;
  let integral = 0;
  let prevError = 1; // target is 1
  
  const time: number[] = [];
  const output: number[] = [];
  
  for (let i = 0; i <= steps; i++) {
    const t = i * dt;
    const error = 1 - y;
    
    integral += error * dt;
    const derivative = (error - prevError) / dt;
    prevError = error;
    
    let u = p.kp * error + p.ki * integral + p.kd * derivative;
    
    // Anti-windup & saturation (-10 to 10)
    const uSat = Math.max(-10, Math.min(10, u));
    if (u !== uSat && ((u > 0 && error > 0) || (u < 0 && error < 0))) {
      integral -= error * dt; // revert integration
    }
    
    buffer.push(uSat);
    const delayedU = buffer.shift()!;
    
    // Plant: first order + dead time
    y += dt * (p.K * delayedU - y) / p.tau;
    
    time.push(t);
    output.push(y);
  }
  
  // Metrics
  let maxY = 0;
  let t10 = 0, t90 = 0;
  let settled = false, settleTime = totalTime;
  const finalY = output[output.length - 1];
  
  for (let i = 0; i < output.length; i++) {
    const val = output[i];
    if (val > maxY) maxY = val;
    if (t10 === 0 && val >= 0.1 * finalY) t10 = time[i];
    if (t90 === 0 && val >= 0.9 * finalY) t90 = time[i];
    if (!settled) {
      let outside = false;
      for (let j = i; j < output.length; j++) {
        if (Math.abs(output[j] - finalY) > 0.02 * finalY) { outside = true; break; }
      }
      if (!outside) { settled = true; settleTime = time[i]; }
    }
  }
  
  const overshoot = finalY > 0 ? Math.max(0, ((maxY - finalY) / finalY) * 100) : 0;
  const riseTime = t90 - t10;
  const sse = Math.abs(1 - finalY);
  
  return { time, output, overshoot, riseTime, settleTime, sse, finalY };
}

export function calculateZN(p: PidParams, type: 'PI' | 'PID') {
  const Kp = (type === 'PI' ? 0.9 : 1.2) * p.tau / (p.K * p.L);
  const Ti = type === 'PI' ? p.L / 0.3 : 2 * p.L;
  const Td = type === 'PI' ? 0 : 0.5 * p.L;
  
  return { kp: Kp, ki: Kp / Ti, kd: Kp * Td };
}