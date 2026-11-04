import { Textarea } from '../../primitives/Textarea';
import { Field } from '../../primitives/Field';
import { Select } from '../../primitives/Select';
import { STAGES } from '../StageTracker/StageTracker';
import './PitchEditor.css';

export interface PitchData {
  pitch: string;
  problem: string;
  solution: string;
  status: string;
  demo: string;
  ask: string;
}

export interface PitchEditorProps {
  value: PitchData;
  stage: number;
  onStageChange: (stage: number) => void;
  onChange: (field: keyof PitchData, val: string) => void;
  className?: string;
}

export function PitchEditor({ value, stage, onStageChange, onChange, className }: PitchEditorProps) {
  const safeValue = value || { pitch: '', problem: '', solution: '', status: '', demo: '', ask: '' };

  return (
    <div className={['amees-pitch-editor', className].filter(Boolean).join(' ')}>
      
      {/* Stage Selector */}
      <div style={{ marginBottom: 'var(--sp-4)', background: 'var(--panel-2)', padding: 'var(--sp-3)', border: 'var(--bw-sm) solid var(--line)' }}>
        <Field label="Current Project Stage">
          <Select 
            options={STAGES.map((s, i) => ({ value: String(i), label: s }))}
            value={String(stage)}
            onChange={(v) => onStageChange(Number(v))}
          />
        </Field>
      </div>

      <Field label="Elevator Pitch (The Hook)">
        <Textarea
          value={safeValue.pitch || ''}
          onChange={v => onChange('pitch', v)}
          maxLength={140}
          rows={2}
          showCount
          placeholder="One sentence. What is it and why does it matter?"
        />
      </Field>
      
      <Field label="The Problem">
        <Textarea
          value={safeValue.problem || ''}
          onChange={v => onChange('problem', v)}
          maxLength={200}
          rows={3}
          showCount
          placeholder="What is broken in the world right now?"
        />
      </Field>
      
      <Field label="The Solution">
        <Textarea
          value={safeValue.solution || ''}
          onChange={v => onChange('solution', v)}
          maxLength={200}
          rows={3}
          showCount
          placeholder="How does your hardware fix it?"
        />
      </Field>
      
      <Field label="Current Status (Works / Broken)">
        <Textarea
          value={safeValue.status || ''}
          onChange={v => onChange('status', v)}
          maxLength={200}
          rows={2}
          showCount
          placeholder="Honest assessment. e.g. 'Reads perfectly, but enclosure isn't waterproof yet.'"
        />
      </Field>

      <Field label="Demo Steps (Script)">
        <Textarea
          value={safeValue.demo || ''}
          onChange={v => onChange('demo', v)}
          maxLength={400}
          rows={4}
          showCount
          placeholder="1. Press power button&#10;2. Show the OLED displaying live data&#10;3. Trigger the alarm"
        />
      </Field>
      
      <Field label="The Ask">
        <Textarea
          value={safeValue.ask || ''}
          onChange={v => onChange('ask', v)}
          maxLength={200}
          rows={2}
          showCount
          placeholder="What do you need from the judges/sponsors? (e.g. Funding for a proper PCB)"
        />
      </Field>
    </div>
  );
}