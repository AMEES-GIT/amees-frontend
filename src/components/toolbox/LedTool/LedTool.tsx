import { useState } from 'react';
import { Window } from '../../containers/Window';
import { Field } from '../../primitives/Field';
import { TextInput } from '../../primitives/TextInput';
import { StatGrid, StatTile } from '../../primitives/StatTile';
import { parseSI, fmtSI } from '../../../lib/toolbox/si';
import { calculateLed } from '../../../lib/toolbox/led';
import { nextE24 } from '../../../lib/toolbox/resistor';

export function LedTool() {
  const [inputs, setInputs] = useState({ vs: '5', vf: '2', i: '10m' });

  const vs = parseSI(inputs.vs);
  const vf = parseSI(inputs.vf);
  const i = parseSI(inputs.i);

  const result = calculateLed(vs, vf, i);
  
  let finalR = 0;
  let actualI = 0;
  let power = 0;

  if (result) {
    finalR = nextE24(result.exactR);
    actualI = (vs - vf) / finalR;
    power = actualI * actualI * finalR;
  }

  return (
    <Window title="LED resistor" meta="series resistor">
      <div style={{ display: 'grid', gap: 'var(--sp-4)' }}>
        
        <div style={{ display: 'grid', gap: 'var(--sp-3)', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))' }}>
          <Field label="Supply (V)">
            <TextInput value={inputs.vs} onChange={v => setInputs(s => ({ ...s, vs: v }))} />
          </Field>
          <Field label="Forward V (Vf)">
            <TextInput value={inputs.vf} onChange={v => setInputs(s => ({ ...s, vf: v }))} />
          </Field>
          <Field label="Target I (A)">
            <TextInput value={inputs.i} onChange={v => setInputs(s => ({ ...s, i: v }))} />
          </Field>
        </div>

        {!result && (inputs.vs || inputs.vf) && (
          <p style={{ color: 'var(--c-warn)', fontSize: 'var(--fs-sm)', margin: 0 }}>Supply must be greater than Forward Voltage.</p>
        )}

        {result && (
          <StatGrid>
            <StatTile label="Exact R" value={fmtSI(result.exactR, 'Ω')} />
            <StatTile label="Use E24" value={fmtSI(finalR, 'Ω')} highlight />
            <StatTile label="Actual I" value={fmtSI(actualI, 'A')} />
            <StatTile label="Power" value={fmtSI(power, 'W')} />
          </StatGrid>
        )}
      </div>
    </Window>
  );
}