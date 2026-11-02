export function calculateGear(
  n1: number, n2: number, 
  n3: number | null, n4: number | null, 
  rpm: number, torque: number, eff: number
) {
  if (!(n1 > 0 && n2 > 0 && rpm > 0 && torque > 0 && eff > 0 && eff <= 100)) return null;
  
  let ratio = n2 / n1;
  let stages = 1;
  
  if (n3 && n4 && n3 > 0 && n4 > 0) {
    ratio *= (n4 / n3);
    stages++;
  }
  
  const eta = Math.pow(eff / 100, stages);
  const outRpm = rpm / ratio;
  const outTorque = torque * ratio * eta;
  const powerOut = outTorque * outRpm * 2 * Math.PI / 60;
  
  return { ratio, outRpm, outTorque, powerOut, stages };
}