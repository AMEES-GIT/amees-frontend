import { useState } from 'react';
import { Window } from '../../containers/Window';
import { Field } from '../../primitives/Field';
import { Select } from '../../primitives/Select';
import { TextInput } from '../../primitives/TextInput';
import { Textarea } from '../../primitives/Textarea';
import { Button } from '../../primitives/Button';
import './EntryForm.css';

export type EntryType = 'log' | 'milestone' | 'decision' | 'blocker' | 'link';

export interface EntryFormData {
  type: EntryType;
  title: string;
  text: string;
  link: string;
}

export interface EntryFormProps {
  onSubmit: (data: EntryFormData) => void;
  onCancel?: () => void;
  errors?: Partial<Record<keyof EntryFormData, string>>;
  className?: string;
}

const TYPES = [
  { value: 'log', label: 'Log' },
  { value: 'milestone', label: 'Milestone' },
  { value: 'decision', label: 'Decision' },
  { value: 'blocker', label: 'Blocker' },
  { value: 'link', label: 'Social Post Link' },
];

export function EntryForm({ onSubmit, onCancel, errors = {}, className }: EntryFormProps) {
  const [data, setData] = useState<EntryFormData>({
    type: 'log',
    title: '',
    text: '',
    link: '',
  });

  const handleChange = (key: keyof EntryFormData, val: string) => {
    setData(prev => ({ ...prev, [key]: val }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(data);
  };

  return (
    <Window title="New entry" className={className}>
      <form className="amees-entry-form" onSubmit={handleSubmit}>
        <div className="amees-entry-form__row">
          <Field label="Type" error={errors.type}>
            <Select 
              options={TYPES} 
              value={data.type} 
              onChange={v => handleChange('type', v as EntryType)} 
            />
          </Field>
          <Field label="Title" error={errors.title}>
            <TextInput 
              value={data.title} 
              onChange={v => handleChange('title', v)} 
              required 
              maxLength={80} 
            />
          </Field>
        </div>

        <Field label="Details" error={errors.text}>
          <Textarea 
            value={data.text} 
            onChange={v => handleChange('text', v)} 
            rows={3} 
            maxLength={500} 
          />
        </Field>

        {data.type === 'link' && (
          <Field label="Post URL" error={errors.link}>
            <TextInput 
              type="url"
              value={data.link} 
              onChange={v => handleChange('link', v)} 
              placeholder="https://instagram.com/..." 
              required 
            />
          </Field>
        )}

        <div className="amees-entry-form__actions">
          <Button type="submit" variant="primary">Add entry</Button>
          {onCancel && <Button type="button" onClick={onCancel}>Cancel</Button>}
        </div>
      </form>
    </Window>
  );
}