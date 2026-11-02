import { useState } from 'react';
import { Window } from '../../containers/Window';
import { Field } from '../../primitives/Field';
import { TextInput } from '../../primitives/TextInput';
import { StatGrid, StatTile } from '../../primitives/StatTile';
import { parseSI, fmtSI } from '../../../lib/toolbox/si';
import { calculateOhm } from '../../../lib/toolbox/ohm';

export function OhmTool() {
  const [inputs, setInputs] = useState({ V: '', I: '', R: '', P: '' });

  const parsed = {
    V: inputs.V ? parseSI(inputs.V) : undefined,
    I: inputs.I ? parseSI(inputs.I) : undefined,
    R: inputs.R ? parseSI(inputs.R) : undefined,
    P: inputs.P ? parseSI(inputs.P) : undefined,
  };

  const result = calculateOhm(parsed);

  const handleChange = (key: keyof typeof inputs, val: string) => {
    setInputs(prev => ({ ...prev, [key]: val }));
  };

  return (
    <Window title="Ohm's law" meta="fill any two">
      <div style={{ display: 'grid', gap: 'var(--sp-3)' }}>
        <div style={{ display: 'grid', gap: 'var(--sp-3)', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))' }}>
          <Field label="Voltage (V)">
            <TextInput value={inputs.V} onChange={v => handleChange('V', v)} placeholder="5" />
          </Field>
          <Field label="Current (A)">
            <TextInput value={inputs.I} onChange={v => handleChange('I', v)} placeholder="20m" />
          </Field>
          <Field label="Resistance (Ω)">
            <TextInput value={inputs.R} onChange={v => handleChange('R', v)} placeholder="250" />
          </Field>
          <Field label="Power (W)">
            <TextInput value={inputs.P} onChange={v => handleChange('P', v)} placeholder="" />
          </Field>
        </div>

        {result.error && (
          <p style={{ color: 'var(--c-warn)', fontWeight: 'bold', fontSize: 'var(--fs-sm)', margin: 0 }}>
            {result.error}
          </p>
        )}

        {!result.error && (
          <StatGrid>
            <StatTile label="Voltage" value={fmtSI(result.V!, 'V')} highlight={!inputs.V} />
            <StatTile label="Current" value={fmtSI(result.I!, 'A')} highlight={!inputs.I} />
            <StatTile label="Resistance" value={fmtSI(result.R!, 'Ω')} highlight={!inputs.R} />
            <StatTile label="Power" value={fmtSI(result.P!, 'W')} highlight={!inputs.P} />
          </StatGrid>
        )}
      </div>
    </Window>
  );
}