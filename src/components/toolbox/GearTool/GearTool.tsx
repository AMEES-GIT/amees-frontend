import { useState } from 'react';
import { Window } from '../../containers/Window';
import { Field } from '../../primitives/Field';
import { TextInput } from '../../primitives/TextInput';
import { StatGrid, StatTile } from '../../primitives/StatTile';
import { parseSI, fmtSI } from '../../../lib/toolbox/si';
import { calculateGear } from '../../../lib/toolbox/gear';

export function GearTool() {
  const [inputs, setInputs] = useState({ 
    n1: '12', n2: '36', n3: '', n4: '', 
    rpm: '3000', torque: '0.05', eff: '95' 
  });

  const n1 = parseFloat(inputs.n1);
  const n2 = parseFloat(inputs.n2);
  const n3 = inputs.n3 ? parseFloat(inputs.n3) : null;
  const n4 = inputs.n4 ? parseFloat(inputs.n4) : null;
  const rpm = parseSI(inputs.rpm);
  const torque = parseSI(inputs.torque);
  const eff = parseFloat(inputs.eff);

  const result = calculateGear(n1, n2, n3, n4, rpm, torque, eff);

  return (
    <Window title="Gear train" meta="ratio, speed, torque">
      <div style={{ display: 'grid', gap: 'var(--sp-4)' }}>
        
        <div style={{ display: 'grid', gap: 'var(--sp-3)', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))' }}>
          <Field label="Stage 1 driver">
            <TextInput value={inputs.n1} onChange={v => setInputs(s => ({ ...s, n1: v }))} />
          </Field>
          <Field label="Stage 1 driven">
            <TextInput value={inputs.n2} onChange={v => setInputs(s => ({ ...s, n2: v }))} />
          </Field>
          <Field label="Stage 2 driver (opt)">
            <TextInput value={inputs.n3} onChange={v => setInputs(s => ({ ...s, n3: v }))} placeholder="Optional" />
          </Field>
          <Field label="Stage 2 driven (opt)">
            <TextInput value={inputs.n4} onChange={v => setInputs(s => ({ ...s, n4: v }))} placeholder="Optional" />
          </Field>
        </div>

        <div style={{ display: 'grid', gap: 'var(--sp-3)', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))' }}>
          <Field label="Input speed (rpm)">
            <TextInput value={inputs.rpm} onChange={v => setInputs(s => ({ ...s, rpm: v }))} />
          </Field>
          <Field label="Input torque (N·m)">
            <TextInput value={inputs.torque} onChange={v => setInputs(s => ({ ...s, torque: v }))} />
          </Field>
          <Field label="Efficiency / mesh (%)">
            <TextInput value={inputs.eff} onChange={v => setInputs(s => ({ ...s, eff: v }))} />
          </Field>
        </div>

        {result && (
          <StatGrid>
            <StatTile label="Total Ratio" value={`${Number(result.ratio.toPrecision(3))} : 1`} highlight />
            <StatTile label="Output Speed" value={`${Number(result.outRpm.toPrecision(3))} rpm`} />
            <StatTile label="Output Torque" value={fmtSI(result.outTorque, 'N·m')} />
            <StatTile label="Power Output" value={fmtSI(result.powerOut, 'W')} />
          </StatGrid>
        )}
        {!result && (inputs.n1 && inputs.n2) && (
          <p style={{ color: 'var(--c-warn)', fontSize: 'var(--fs-sm)', margin: 0 }}>Please enter valid positive numbers.</p>
        )}
      </div>
    </Window>
  );
}