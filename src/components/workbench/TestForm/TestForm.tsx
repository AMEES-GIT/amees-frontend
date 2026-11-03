import { useState } from 'react';
import { Field } from '../../primitives/Field';
import { TextInput } from '../../primitives/TextInput';
import { Select } from '../../primitives/Select';
import { Button } from '../../primitives/Button';

export interface TestFormData {
  name: string;
  type: 'numeric' | 'qualitative';
  exp: string;
  meas: string;
  unit: string;
  tol: string;
  pass: string;
}

export function TestForm({ onSubmit }: { onSubmit: (data: TestFormData) => void }) {
  const [data, setData] = useState<TestFormData>({ name: '', type: 'numeric', exp: '', meas: '', unit: 'cm', tol: '5', pass: 'Pass' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(data);
    setData({ name: '', type: 'numeric', exp: '', meas: '', unit: 'cm', tol: '5', pass: 'Pass' });
  };

  return (
    <form className="amees-wb-form-row" onSubmit={handleSubmit} style={{ display: 'grid', gap: 'var(--sp-3)', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', alignItems: 'end', marginBottom: 'var(--sp-4)' }}>
      <Field label="Test Name">
        <TextInput value={data.name} onChange={v => setData(s => ({ ...s, name: v }))} required placeholder="Max range" />
      </Field>
      
      <Field label="Type">
        <Select options={[{value: 'numeric', label: 'Numeric'}, {value: 'qualitative', label: 'Qualitative'}]} value={data.type} onChange={v => setData(s => ({ ...s, type: v as any }))} />
      </Field>

      {data.type === 'numeric' ? (
        <>
          <Field label="Expected Value">
            <TextInput type="numeric" value={data.exp} onChange={v => setData(s => ({ ...s, exp: v }))} required />
          </Field>
          <Field label="Measured Value">
            <TextInput type="numeric" value={data.meas} onChange={v => setData(s => ({ ...s, meas: v }))} required />
          </Field>
          <Field label="Unit">
            <Select options={['cm', 'V', 'mA', '°C', '%'].map(u => ({ value: u, label: u }))} value={data.unit} onChange={v => setData(s => ({ ...s, unit: v }))} />
          </Field>
          <Field label="Tolerance (%)">
            <TextInput type="numeric" value={data.tol} onChange={v => setData(s => ({ ...s, tol: v }))} required />
          </Field>
        </>
      ) : (
        <Field label="Result">
          <Select options={[{value: 'Pass', label: 'Pass'}, {value: 'Fail', label: 'Fail'}]} value={data.pass} onChange={v => setData(s => ({ ...s, pass: v }))} />
        </Field>
      )}

      <div style={{ paddingBottom: '2px' }}>
        <Button type="submit" variant="primary" size="sm">Log Test</Button>
      </div>
    </form>
  );
}