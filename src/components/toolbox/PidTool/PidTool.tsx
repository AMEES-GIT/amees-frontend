import { useEffect, useRef, useState } from 'react';
import { simulatePID, calculateZN, type PidParams } from '../../../lib/toolbox/pid';
import { fmtSI } from '../../../lib/toolbox/si';
import { Window } from '../../containers/Window';
import { Button } from '../../primitives/Button';
import { StatGrid, StatTile } from '../../primitives/StatTile';

export function PidTool({ theme, defaultParams }: { theme?: string; defaultParams?: Partial<PidParams> }) {
  const [params, setParams] = useState<PidParams>({
    kp: 2, ki: 1, kd: 0, K: 1, tau: 1.5, L: 0.3,
    ...defaultParams
  });
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const res = simulatePID(params);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    
    const w = rect.width;
    const h = rect.height;
    const pad = { top: 20, right: 20, bottom: 30, left: 40 };
    const pw = w - pad.left - pad.right;
    const ph = h - pad.top - pad.bottom;
    
    let maxY = 1.2;
    res.output.forEach(y => { if (y > maxY) maxY = y; });
    
    ctx.clearRect(0, 0, w, h);
    
    const cs = getComputedStyle(canvas);
    const gridColor = cs.getPropertyValue('--line').trim() || '#ccc';
    const textColor = cs.getPropertyValue('--muted').trim() || '#666';
    const lineColor = cs.getPropertyValue('--fill').trim() || '#3b82f6';
    
    // Axes
    ctx.strokeStyle = gridColor;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(pad.left, pad.top);
    ctx.lineTo(pad.left, h - pad.bottom);
    ctx.lineTo(w - pad.right, h - pad.bottom);
    ctx.stroke();
    
    // Y-axis grid & labels
    ctx.fillStyle = textColor;
    ctx.font = '10px "Space Grotesk", sans-serif';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    for (let y = 0; y <= maxY; y += 0.5) {
      const py = h - pad.bottom - (y / maxY) * ph;
      ctx.beginPath();
      ctx.moveTo(pad.left - 5, py);
      ctx.lineTo(w - pad.right, py);
      ctx.strokeStyle = `color-mix(in srgb, ${gridColor} 30%, transparent)`;
      ctx.stroke();
      ctx.fillText(y.toFixed(1), pad.left - 8, py);
    }
    
    // X-axis grid & labels
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    for (let t = 0; t <= 12; t += 2) {
      const px = pad.left + (t / 12) * pw;
      ctx.fillText(`${t}s`, px, h - pad.bottom + 5);
    }
    
    // Target line (1.0)
    const py1 = h - pad.bottom - (1 / maxY) * ph;
    ctx.beginPath();
    ctx.setLineDash([4, 4]);
    ctx.moveTo(pad.left, py1);
    ctx.lineTo(w - pad.right, py1);
    ctx.strokeStyle = textColor;
    ctx.stroke();
    ctx.setLineDash([]);
    
    // Response curve
    ctx.beginPath();
    for (let i = 0; i < res.output.length; i++) {
      const px = pad.left + (res.time[i] / 12) * pw;
      const py = h - pad.bottom - (Math.min(maxY, Math.max(0, res.output[i])) / maxY) * ph;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.strokeStyle = lineColor;
    ctx.lineWidth = 2;
    ctx.stroke();

  }, [params, theme]);

  const update = (key: keyof PidParams, val: number) => {
    setParams(p => ({ ...p, [key]: val }));
  };

  const applyZN = (type: 'PI' | 'PID') => {
    const zn = calculateZN(params, type);
    setParams(p => ({ ...p, ...zn }));
  };

  const sliders: { key: keyof PidParams, label: string, min: number, max: number, step: number, unit?: string }[] = [
    { key: 'kp', label: 'Kp', min: 0, max: 20, step: 0.1 },
    { key: 'ki', label: 'Ki', min: 0, max: 20, step: 0.1 },
    { key: 'kd', label: 'Kd', min: 0, max: 5, step: 0.05 },
    { key: 'K', label: 'Plant gain', min: 0.5, max: 3, step: 0.1 },
    { key: 'tau', label: 'Time constant', min: 0.2, max: 5, step: 0.1, unit: 's' },
    { key: 'L', label: 'Dead time', min: 0.05, max: 2, step: 0.05, unit: 's' },
  ];

  return (
    <Window title="PID playground" meta="step response">
      <div style={{ display: 'grid', gap: 'var(--sp-4)' }}>
        <canvas 
          ref={canvasRef} 
          style={{ width: '100%', height: 260, border: 'var(--bw) solid var(--line)', background: 'var(--panel-2)' }} 
        />

        <div style={{ display: 'grid', gap: 'var(--sp-3)', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))' }}>
          {sliders.map(s => (
            <div key={s.key} style={{ display: 'grid', gap: 'var(--sp-1)' }}>
              <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'flex', justifyContent: 'space-between' }}>
                <span>{s.label}</span>
                <span>{params[s.key].toFixed(s.step >= 0.1 ? 1 : 2)}{s.unit}</span>
              </label>
              <input 
                type="range" min={s.min} max={s.max} step={s.step} value={params[s.key]} 
                onChange={e => update(s.key, parseFloat(e.target.value))} 
                style={{ accentColor: 'var(--fill)' }} 
              />
            </div>
          ))}
        </div>

        <StatGrid>
          <StatTile label="Overshoot" value={`${res.overshoot.toFixed(1)}%`} />
          <StatTile label="Rise time" value={fmtSI(res.riseTime, 's')} />
          <StatTile label="Settling (2%)" value={fmtSI(res.settleTime, 's')} />
          <StatTile label="Steady-state error" value={`${(res.sse * 100).toFixed(1)}%`} />
        </StatGrid>

        <div style={{ display: 'flex', gap: 'var(--sp-2)', flexWrap: 'wrap' }}>
          <Button size="sm" onClick={() => applyZN('PI')}>Ziegler-Nichols PI</Button>
          <Button size="sm" onClick={() => applyZN('PID')}>Ziegler-Nichols PID</Button>
        </div>
      </div>
    </Window>
  );
}