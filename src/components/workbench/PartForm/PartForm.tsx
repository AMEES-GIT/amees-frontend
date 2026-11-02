import { useState } from 'react';
import { Field } from '../../primitives/Field';
import { TextInput } from '../../primitives/TextInput';
import { Select } from '../../primitives/Select';
import { Button } from '../../primitives/Button';

export interface PartFormData {
  name: string;
  qty: string;
  cost: string;
  status: string;
}

export function PartForm({ onSubmit }: { onSubmit: (data: PartFormData) => void }) {
  const [data, setData] = useState<PartFormData>({ name: '', qty: '1', cost: '0', status: 'Needed' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(data);
  };

  return (
    <form className="amees-wb-form-row" onSubmit={handleSubmit} style={{ display: 'grid', gap: 'var(--sp-3)', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', alignItems: 'end', marginBottom: 'var(--sp-4)' }}>
      <Field label="Part name">
        <TextInput value={data.name} onChange={v => setData(s => ({ ...s, name: v }))} required />
      </Field>
      <Field label="Qty">
        <TextInput type="numeric" value={data.qty} onChange={v => setData(s => ({ ...s, qty: v }))} required />
      </Field>
      <Field label="Unit Cost (₦)">
        <TextInput type="numeric" value={data.cost} onChange={v => setData(s => ({ ...s, cost: v }))} required />
      </Field>
      <Field label="Status">
        <Select options={['Needed', 'Ordered', 'Owned'].map(s => ({ value: s, label: s }))} value={data.status} onChange={v => setData(s => ({ ...s, status: v }))} />
      </Field>
      <div style={{ paddingBottom: '2px' }}>
        <Button type="submit" variant="primary" size="sm">Add Part</Button>
      </div>
    </form>
  );
}