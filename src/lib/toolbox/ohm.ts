export interface OhmResult {
  V?: number;
  I?: number;
  R?: number;
  P?: number;
  error?: string;
}

/** Given any two of V, I, R, P, calculates the other two. */
export function calculateOhm(inputs: Partial<Record<'V'|'I'|'R'|'P', number>>): OhmResult {
  const keys = Object.keys(inputs).filter((k) => inputs[k as keyof typeof inputs] !== undefined) as ('V'|'I'|'R'|'P')[];
  
  if (keys.length !== 2) {
    return { error: 'Fill exactly two values to solve the rest.' };
  }

  const [a, b] = keys;
  const valA = inputs[a]!;
  const valB = inputs[b]!;

  if (valA < 0 || valB < 0) {
    return { error: 'Values must be positive numbers.' };
  }

  const out: OhmResult = { ...inputs };
  const pair = [a, b].sort().join('');

  if (pair === 'IV') {
    out.R = valA / valB; // Wait, need to match V and I specifically. Let's do a switch.
  }
  
  // Reset and do a proper switch
  if ((a === 'V' && b === 'I') || (a === 'I' && b === 'V')) {
    out.V = inputs.V;
    out.I = inputs.I;
    out.R = out.V! / out.I!;
    out.P = out.V! * out.I!;
  } else if ((a === 'V' && b === 'R') || (a === 'R' && b === 'V')) {
    out.V = inputs.V;
    out.R = inputs.R;
    out.I = out.V! / out.R!;
    out.P = (out.V! * out.V!) / out.R!;
  } else if ((a === 'V' && b === 'P') || (a === 'P' && b === 'V')) {
    out.V = inputs.V;
    out.P = inputs.P;
    out.I = out.P! / out.V!;
    out.R = (out.V! * out.V!) / out.P!;
  } else if ((a === 'I' && b === 'R') || (a === 'R' && b === 'I')) {
    out.I = inputs.I;
    out.R = inputs.R;
    out.V = out.I! * out.R!;
    out.P = out.I! * out.I! * out.R!;
  } else if ((a === 'I' && b === 'P') || (a === 'P' && b === 'I')) {
    out.I = inputs.I;
    out.P = inputs.P;
    out.V = out.P! / out.I!;
    out.R = out.P! / (out.I! * out.I!);
  } else if ((a === 'R' && b === 'P') || (a === 'P' && b === 'R')) {
    out.R = inputs.R;
    out.P = inputs.P;
    out.V = Math.sqrt(out.P! * out.R!);
    out.I = Math.sqrt(out.P! / out.R!);
  }

  return out;
}