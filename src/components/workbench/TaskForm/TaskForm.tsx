import { useState } from 'react';
import { Field } from '../../primitives/Field';
import { TextInput } from '../../primitives/TextInput';
import { Select } from '../../primitives/Select';
import { Button } from '../../primitives/Button';
import './TaskForm.css';

export interface TaskFormData {
  title: string;
  who: string;
}

export interface TaskFormProps {
  team: readonly string[];
  onSubmit: (data: TaskFormData) => void;
  className?: string;
}

export function TaskForm({ team, onSubmit, className }: TaskFormProps) {
  const [data, setData] = useState<TaskFormData>({
    title: '',
    who: team[0] || 'Anyone',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(data);
  };

  return (
    <form className={['amees-task-form', className].filter(Boolean).join(' ')} onSubmit={handleSubmit}>
      <div className="amees-task-form__row">
        <Field label="Task">
          <TextInput 
            value={data.title} 
            onChange={v => setData(s => ({ ...s, title: v }))} 
            required 
            maxLength={80} 
            placeholder="e.g. Waterproof the sensor"
          />
        </Field>
        <Field label="Owner">
          <Select 
            options={['Anyone', ...team].map(t => ({ value: t, label: t }))} 
            value={data.who} 
            onChange={v => setData(s => ({ ...s, who: v }))} 
          />
        </Field>
      </div>
      <Button type="submit" variant="primary" size="sm">Add task</Button>
    </form>
  );
}