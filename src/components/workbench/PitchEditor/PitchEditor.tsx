import { Textarea } from '../../primitives/Textarea';
import { Field } from '../../primitives/Field';
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
  onChange: (field: keyof PitchData, val: string) => void;
  className?: string;
}

export function PitchEditor({ value, onChange, className }: PitchEditorProps) {
  return (
    <div className={['amees-pitch-editor', className].filter(Boolean).join(' ')}>
      <Field label="Elevator Pitch (The Hook)">
        <Textarea
          value={value.pitch}
          onChange={v => onChange('pitch', v)}
          maxLength={140}
          rows={2}
          showCount
          placeholder="One sentence. What is it and why does it matter?"
        />
      </Field>
      
      <Field label="The Problem">
        <Textarea
          value={value.problem}
          onChange={v => onChange('problem', v)}
          maxLength={200}
          rows={3}
          showCount
          placeholder="What is broken in the world right now?"
        />
      </Field>
      
      <Field label="The Solution">
        <Textarea
          value={value.solution}
          onChange={v => onChange('solution', v)}
          maxLength={200}
          rows={3}
          showCount
          placeholder="How does your hardware fix it?"
        />
      </Field>
      
      <Field label="Current Status (Works / Broken)">
        <Textarea
          value={value.status}
          onChange={v => onChange('status', v)}
          maxLength={200}
          rows={2}
          showCount
          placeholder="Honest assessment. e.g. 'Reads perfectly, but enclosure isn't waterproof yet.'"
        />
      </Field>

      <Field label="Demo Steps (Script)">
        <Textarea
          value={value.demo}
          onChange={v => onChange('demo', v)}
          maxLength={400}
          rows={4}
          showCount
          placeholder="1. Press power button&#10;2. Show the OLED displaying live data&#10;3. Trigger the alarm"
        />
      </Field>
      
      <Field label="The Ask">
        <Textarea
          value={value.ask}
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