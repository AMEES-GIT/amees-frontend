import { useState } from 'react';
import { Window } from '../../containers/Window';
import { Field } from '../../primitives/Field';
import { TextInput } from '../../primitives/TextInput';
import { StatGrid, StatTile } from '../../primitives/StatTile';
import { parseSI, fmtSI } from '../../../lib/toolbox/si';
import { BAND_COLORS, MULTIPLIERS, TOLERANCES, decodeResistor, encodeResistor } from '../../../lib/toolbox/resistor';
import './ResistorTool.css';

export function ResistorTool() {
  // Default to Brown, Black, Red, Gold (1kΩ)
  const [bands, setBands] = useState([1, 0, 2, 6]);
  const [encodeVal, setEncodeVal] = useState('');

  const decoded = decodeResistor(bands);
  const encodedBands = encodeVal ? encodeResistor(parseSI(encodeVal)) : null;

  const handleBandChange = (index: number, val: string) => {
    const newBands = [...bands];
    newBands[index] = parseInt(val, 10);
    setBands(newBands);
  };

  // SVG geometry
  const bandX = [104, 134, 164, 222]; // positions for 4 bands

  return (
    <Window title="Resistor colour code" meta="decode / encode">
      <div style={{ display: 'grid', gap: 'var(--sp-4)' }}>
        
        {/* SVG Resistor */}
        <svg className="amees-res-svg" viewBox="0 0 320 80" width="100%" style={{ maxWidth: 400, height: 'auto', display: 'block', margin: '0 auto' }}>
          <line x1="10" y1="40" x2="310" y2="40" stroke="var(--line)" strokeWidth="5" />
          <rect x="64" y="14" width="192" height="52" rx="20" fill="#E8D3A8" stroke="var(--line)" strokeWidth="3" />
          {bands.map((b, i) => (
            <rect 
              key={i} 
              x={bandX[i]} 
              y="14" 
              width="14" 
              height="52" 
              fill={i === 2 ? MULTIPLIERS[b].hex : i === 3 ? TOLERANCES[b].hex : BAND_COLORS[b].hex} 
              stroke="var(--line)" 
              strokeWidth="1.5" 
            />
          ))}
        </svg>

        <StatGrid>
          <StatTile label="Value" value={fmtSI(decoded.value, 'Ω')} highlight />
          <StatTile label="Tolerance" value={`±${decoded.tol}%`} />
          <StatTile label="Range" value={`${fmtSI(decoded.value * (1 - decoded.tol/100), 'Ω')} to ${fmtSI(decoded.value * (1 + decoded.tol/100), 'Ω')}`} />
        </StatGrid>

        <div style={{ display: 'grid', gap: 'var(--sp-3)', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))' }}>
          {['Digit 1', 'Digit 2', 'Multiplier', 'Tolerance'].map((label, i) => {
            const opts = i === 2 ? MULTIPLIERS : i === 3 ? TOLERANCES : BAND_COLORS;
            return (
              <Field key={label} label={label}>
                <select
                  value={bands[i]}
                  onChange={(e) => handleBandChange(i, e.target.value)}
                  style={{ width: '100%', padding: 'var(--sp-2)', border: 'var(--bw) solid var(--line)', background: 'var(--panel-2)' }}
                >
                  {opts.map((opt, idx) => (
                    <option key={opt.name} value={idx}>{opt.name}</option>
                  ))}
                </select>
              </Field>
            );
          })}
        </div>

        <hr style={{ border: 0, borderTop: 'var(--bw-sm) dashed var(--line)', margin: 'var(--sp-2) 0' }} />

        <div style={{ display: 'grid', gap: 'var(--sp-3)' }}>
          <Field label="Find the bands for a value (e.g. 4.7k)">
            <TextInput value={encodeVal} onChange={setEncodeVal} placeholder="4.7k" />
          </Field>
          {encodeVal && !encodedBands && (
            <p style={{ color: 'var(--c-bad)', fontSize: 'var(--fs-sm)' }}>Value out of range.</p>
          )}
          {encodedBands && (
            <StatGrid>
              <StatTile label="Bands" value={encodedBands.map((b, i) => (i === 2 ? MULTIPLIERS[b].name : i === 3 ? TOLERANCES[b].name : BAND_COLORS[b].name)).join(', ')} highlight />
            </StatGrid>
          )}
        </div>
      </div>
    </Window>
  );
}