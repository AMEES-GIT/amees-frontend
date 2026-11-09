import { useState } from 'react';
import { Window } from '../../containers/Window';
import { Field } from '../../primitives/Field';
import { TextInput } from '../../primitives/TextInput';
import { Select } from '../../primitives/Select';
import { Textarea } from '../../primitives/Textarea';
import { Button } from '../../primitives/Button';
import './NewProjectForm.css';

export interface NewProjectData {
  name: string;
  category: string;
  budget: string;
  goal: string;
}

export interface NewProjectFormProps {
  categories: readonly string[];
  defaultBudget?: number;
  onSubmit: (data: NewProjectData) => void;
  onCancel?: () => void;
  className?: string;
}

export function NewProjectForm({
  categories,
  defaultBudget = 20000,
  onSubmit,
  onCancel,
  className,
}: NewProjectFormProps) {
  const [data, setData] = useState<NewProjectData>({
    name: '',
    category: categories[0] || '',
    budget: String(defaultBudget),
    goal: '',
  });

  const handleChange = (key: keyof NewProjectData, val: string) => {
    setData(prev => ({ ...prev, [key]: val }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(data);
  };

  return (
    <Window title="New project" className={className}>
      <form className="amees-wb-newproj" onSubmit={handleSubmit}>
        <Field label="Project name">
          <TextInput value={data.name} onChange={v => handleChange('name', v)} required maxLength={60} />
        </Field>

        <div className="amees-wb-newproj__row">
          <Field label="Category">
            <Select 
              options={categories.map(c => ({ value: c, label: c }))} 
              value={data.category} 
              onChange={v => handleChange('category', v)} 
            />
          </Field>
          <Field label="Budget (₦)">
            <TextInput type="numeric" value={data.budget} onChange={v => handleChange('budget', v)} required />
          </Field>
        </div>

        <Field label="Goal in one sentence">
          <Textarea value={data.goal} onChange={v => handleChange('goal', v)} rows={2} maxLength={200} />
        </Field>

        <p style={{ fontFamily: 'var(--font)', fontSize: 'var(--fs-sm)', color: 'var(--muted)', margin: 'var(--sp-2) 0' }}>
          After creating the project, you'll get an invite link to share with teammates.
        </p>

        <div className="amees-wb-newproj__actions">
          <Button type="submit" variant="primary">Create project</Button>
          {onCancel && <Button type="button" onClick={onCancel}>Cancel</Button>}
        </div>
      </form>
    </Window>
  );
}