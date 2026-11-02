import { useState } from 'react';
import { Field } from '../../primitives/Field';
import { TextInput } from '../../primitives/TextInput';
import { Select } from '../../primitives/Select';
import { Button } from '../../primitives/Button';

export interface TestFormData {
  name: string;
  type: 'numeric' | 'qualitative';
  
  // Numeric
  exp: string;
  meas: string;
  unit: string;
  tol: string;
  
  // Qualitative
  expectedText: string;
  result: 'Pass' | 'Fail';
}

export function TestForm({ onSubmit }: { onSubmit: (data: TestFormData) => void }) {
  const [data, setData] = useState<TestFormData>({ 
    name: '', type: 'numeric', exp: '', meas: '', unit: 'cm', tol: '5',
    expectedText: '', result: 'Pass'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 'var(--sp-3)', marginBottom: 'var(--sp-4)' }}>
      
      <div style={{ display: 'grid', gap: 'var(--sp-3)', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
        <Field label="Test name">
          <TextInput value={data.name} onChange={v => setData(s => ({ ...s, name: v }))} required placeholder="e.g. Motor spin direction" />
        </Field>
        <Field label="Test Type">
          <Select 
            options={[{ value: 'numeric', label: 'Quantitative (Numbers)' }, { value: 'qualitative', label: 'Qualitative (Pass/Fail)' }]} 
            value={data.type} 
            onChange={v => setData(s => ({ ...s, type: v as 'numeric' | 'qualitative' }))} 
          />
        </Field>
      </div>

      {data.type === 'numeric' ? (
        <div style={{ display: 'grid', gap: 'var(--sp-3)', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', alignItems: 'end' }}>
          <Field label="Expected">
            <TextInput type="numeric" value={data.exp} onChange={v => setData(s => ({ ...s, exp: v }))} required />
          </Field>
          <Field label="Measured">
            <TextInput type="numeric" value={data.meas} onChange={v => setData(s => ({ ...s, meas: v }))} required />
          </Field>
          <Field label="Unit">
            <TextInput value={data.unit} onChange={v => setData(s => ({ ...s, unit: v }))} required />
          </Field>
          <Field label="Tol %">
            <TextInput type="numeric" value={data.tol} onChange={v => setData(s => ({ ...s, tol: v }))} required />
          </Field>
          <div style={{ paddingBottom: '2px' }}>
            <Button type="submit" variant="primary" size="sm">Log Test</Button>
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 'var(--sp-3)', gridTemplateColumns: 'minmax(200px, 2fr) minmax(120px, 1fr)', alignItems: 'end' }}>
          <Field label="Expected Result">
            <TextInput value={data.expectedText} onChange={v => setData(s => ({ ...s, expectedText: v }))} required placeholder="e.g. LED turns on immediately" />
          </Field>
          <Field label="Result">
            <Select 
              options={[{ value: 'Pass', label: 'Pass' }, { value: 'Fail', label: 'Fail' }]} 
              value={data.result} 
              onChange={v => setData(s => ({ ...s, result: v as 'Pass' | 'Fail' }))} 
            />
          </Field>
          <div style={{ paddingBottom: '2px' }}>
            <Button type="submit" variant="primary" size="sm">Log Test</Button>
          </div>
        </div>
      )}
    </form>
  );
}