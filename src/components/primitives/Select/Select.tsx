import { useState, useRef, useEffect, forwardRef, useId } from 'react';
import { useFieldContext } from '../Field/FieldContext';
import './Select.css';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps {
  options: readonly SelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  invalid?: boolean;
  id?: string;
  disabled?: boolean;
  className?: string;
  'aria-describedby'?: string;
}

export const Select = forwardRef<HTMLButtonElement, SelectProps>(function Select(
  { options, value, onChange, placeholder, invalid, id, disabled, className, 'aria-describedby': callerDescribedBy },
  ref,
) {
  const field = useFieldContext();
  const autoId = useId();
  const finalId = id ?? field?.id ?? autoId;
  const finalInvalid = invalid ?? field?.invalid ?? false;
  const describedBy = [field?.describedBy, callerDescribedBy].filter(Boolean).join(' ') || undefined;

  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const selectedOption = options.find(o => o.value === value);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
        setHighlightedIndex(options.findIndex(o => o.value === value));
      } else {
        setHighlightedIndex(prev => (prev + 1) % options.length);
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
        setHighlightedIndex(options.findIndex(o => o.value === value));
      } else {
        setHighlightedIndex(prev => (prev - 1 + options.length) % options.length);
      }
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
      } else if (highlightedIndex >= 0) {
        const opt = options[highlightedIndex];
        if (!opt.disabled) {
          onChange(opt.value);
          setIsOpen(false);
        }
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  // Scroll to highlighted item
  useEffect(() => {
    if (isOpen && highlightedIndex >= 0 && listRef.current) {
      const el = listRef.current.children[highlightedIndex] as HTMLElement;
      if (el) el.scrollIntoView({ block: 'nearest' });
    }
  }, [isOpen, highlightedIndex]);

  return (
    <div className={`amees-custom-select ${className || ''}`} ref={containerRef}>
      <button
        ref={ref}
        type="button"
        id={finalId}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-describedby={describedBy}
        aria-invalid={finalInvalid || undefined}
        className={`amees-custom-select__trigger ${finalInvalid ? 'is-invalid' : ''} ${isOpen ? 'is-open' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
      >
        <span className={!selectedOption ? 'is-placeholder' : ''}>
          {selectedOption ? selectedOption.label : (placeholder || 'Select...')}
        </span>
        <svg viewBox="0 0 12 12" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square">
          <path d="M2 4L6 8L10 4" />
        </svg>
      </button>

      {isOpen && (
        <ul ref={listRef} role="listbox" className="amees-custom-select__menu" tabIndex={-1}>
          {options.map((opt, i) => (
            <li
              key={opt.value}
              role="option"
              aria-selected={value === opt.value}
              className={`amees-custom-select__option ${value === opt.value ? 'is-selected' : ''} ${highlightedIndex === i ? 'is-highlighted' : ''} ${opt.disabled ? 'is-disabled' : ''}`}
              onClick={() => {
                if (!opt.disabled) {
                  onChange(opt.value);
                  setIsOpen(false);
                }
              }}
              onMouseEnter={() => setHighlightedIndex(i)}
            >
              {opt.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
});