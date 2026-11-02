import { useState } from 'react';
import { Window } from '../../containers/Window';
import { Field } from '../../primitives/Field';
import { TextInput } from '../../primitives/TextInput';
import { StatGrid, StatTile } from '../../primitives/StatTile';
import { parseSI, fmtSI } from '../../../lib/toolbox/si';
import { calculateRC } from '../../../lib/toolbox/rc';

export function RcTool() {
  const [inputs, setInputs] = useState({ r: '10k', c: '100n' });

  const r = parseSI(inputs.r);
  const c = parseSI(inputs.c);
  const result = calculateRC(r, c);

  return (
    <Window title="RC filter" meta="timing">
      <div style={{ display: 'grid', gap: 'var(--sp-4)' }}>
        
        <div style={{ display: 'grid', gap: 'var(--sp-3)', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))' }}>
          <Field label="Resistance (Ω)">
            <TextInput value={inputs.r} onChange={v => setInputs(s => ({ ...s, r: v }))} />
          </Field>
          <Field label="Capacitance (F)">
            <TextInput value={inputs.c} onChange={v => setInputs(s => ({ ...s, c: v }))} />
          </Field>
        </div>

        {result && (
          <StatGrid>
            <StatTile label="Time constant (τ)" value={fmtSI(result.tau, 's')} highlight />
            <StatTile label="Cut-off frequency" value={fmtSI(result.fc, 'Hz')} highlight />
            <StatTile label="Rise time (10-90%)" value={fmtSI(result.riseTime, 's')} />
            <StatTile label="Settling (99%)" value={fmtSI(result.settleTime, 's')} />
          </StatGrid>
        )}
      </div>
    </Window>
  );
}