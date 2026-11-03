import { useState } from 'react';
import { Meter } from '../../primitives/Meter';
import { TextInput } from '../../primitives/TextInput';
import { Button } from '../../primitives/Button';
import './DemoChecklist.css';

export interface CheckItem {
  id: string;
  label: string;
  checked: boolean;
}

export interface DemoChecklistProps {
  checks: readonly CheckItem[];
  onToggle: (id: string) => void;
  onAdd: (label: string) => void;
  onDelete: (id: string) => void;
  className?: string;
}

export function DemoChecklist({ checks, onToggle, onAdd, onDelete, className }: DemoChecklistProps) {
  const [newLabel, setNewLabel] = useState('');
  
  // Bulletproofing: Ensure checks is always an array
  const safeChecks = Array.isArray(checks) ? checks : [];
  const completed = safeChecks.filter(c => c.checked).length;

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLabel.trim()) return;
    onAdd(newLabel.trim());
    setNewLabel('');
  };

  return (
    <div className={['amees-demo-checklist', className].filter(Boolean).join(' ')}>
      <Meter 
        label="Demo checklist readiness" 
        value={completed} 
        max={safeChecks.length || 1} 
        valueText={`${completed} of ${safeChecks.length} complete`} 
        tone={completed === safeChecks.length && safeChecks.length > 0 ? 'default' : 'warn'}
      />
      
      <ul className="amees-demo-checklist__list">
        {safeChecks.map(c => (
          <li key={c.id} className={c.checked ? 'is-checked' : ''}>
            <div className="amees-demo-checklist__item">
              <button
                type="button"
                className="amees-demo-checklist__check"
                onClick={() => onToggle(c.id)}
                aria-pressed={c.checked}
              >
                <span className="amees-demo-checklist__box" aria-hidden="true">
                  {c.checked && '✓'}
                </span>
                <span className="amees-demo-checklist__label">{c.label}</span>
              </button>
              <Button size="sm" onClick={() => onDelete(c.id)} aria-label="Delete check">✕</Button>
            </div>
          </li>
        ))}
      </ul>

      <form className="amees-demo-checklist__add" onSubmit={handleAdd}>
        <TextInput 
          value={newLabel} 
          onChange={setNewLabel} 
          placeholder="Add a custom demo requirement..." 
          maxLength={80}
        />
        <Button type="submit" size="sm" variant="primary">Add</Button>
      </form>
    </div>
  );
}