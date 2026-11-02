import { useState } from 'react';
import { Window } from '../../containers/Window';
import { Field } from '../../primitives/Field';
import { TextInput } from '../../primitives/TextInput';
import { StatGrid, StatTile } from '../../primitives/StatTile';
import { parseSI, fmtSI } from '../../../lib/toolbox/si';
import { calculateDivider, solveDividerR2 } from '../../../lib/toolbox/divider';
import { nearestE24 } from '../../../lib/toolbox/resistor';

export function DividerTool() {
  const [inputs, setInputs] = useState({ vin: '5', r1: '1k', r2: '2k', target: '' });

  const vin = parseSI(inputs.vin);
  const r1 = parseSI(inputs.r1);
  const r2 = parseSI(inputs.r2);
  const target = parseSI(inputs.target);

  const result = calculateDivider(vin, r1, r2);
  
  let reverseResult = null;
  if (inputs.target && target > 0) {
    const r2Exact = solveDividerR2(vin, r1, target);
    if (r2Exact) {
      const r2Std = nearestE24(r2Exact);
      const actualVout = vin * (r2Std / (r1 + r2Std));
      reverseResult = { r2Exact, r2Std, actualVout };
    }
  }

  return (
    <Window title="Voltage divider" meta="level shifting">
      <div style={{ display: 'grid', gap: 'var(--sp-4)' }}>
        
        <div style={{ display: 'grid', gap: 'var(--sp-3)', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))' }}>
          <Field label="Input (V)">
            <TextInput value={inputs.vin} onChange={v => setInputs(s => ({ ...s, vin: v }))} />
          </Field>
          <Field label="R1 (Ω)">
            <TextInput value={inputs.r1} onChange={v => setInputs(s => ({ ...s, r1: v }))} />
          </Field>
          <Field label="R2 (Ω)">
            <TextInput value={inputs.r2} onChange={v => setInputs(s => ({ ...s, r2: v }))} />
          </Field>
        </div>

        {result && (
          <StatGrid>
            <StatTile label="Output (V)" value={fmtSI(result.vout, 'V')} highlight />
            <StatTile label="Current" value={fmtSI(result.current, 'A')} />
            <StatTile label="Power" value={fmtSI(result.power, 'W')} />
          </StatGrid>
        )}

        <hr style={{ border: 0, borderTop: 'var(--bw-sm) dashed var(--line)', margin: 'var(--sp-2) 0' }} />

        <Field label="Target Output (V), solves for R2">
          <TextInput value={inputs.target} onChange={v => setInputs(s => ({ ...s, target: v }))} placeholder="3.3" />
        </Field>

        {reverseResult && (
          <StatGrid>
            <StatTile label="R2 Exact" value={fmtSI(reverseResult.r2Exact, 'Ω')} />
            <StatTile label="Nearest E24" value={fmtSI(reverseResult.r2Std, 'Ω')} highlight />
            <StatTile label="Actual Vout" value={fmtSI(reverseResult.actualVout, 'V')} />
          </StatGrid>
        )}
        {inputs.target && !reverseResult && (
          <p style={{ color: 'var(--c-warn)', fontSize: 'var(--fs-sm)', margin: 0 }}>Target must be between 0 and Input.</p>
        )}
      </div>
    </Window>
  );
}