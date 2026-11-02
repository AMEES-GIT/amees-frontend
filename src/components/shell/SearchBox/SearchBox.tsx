import { forwardRef, useEffect, useId, useRef, type FormEvent } from 'react';
import { Icon } from '../../foundations/Icon';
import { Button } from '../../primitives/Button';
import './SearchBox.css';

export type SearchBoxVariant = 'header' | 'large';

export interface SearchBoxProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (value: string) => void;
  variant?: SearchBoxVariant;
  placeholder?: string;
  /** When true, Ctrl+K (or Cmd+K) focuses the input. Default true. */
  enableShortcut?: boolean;
  id?: string;
  className?: string;
}

export const SearchBox = forwardRef<HTMLInputElement, SearchBoxProps>(function SearchBox(
  {
    value,
    onChange,
    onSubmit,
    variant = 'header',
    placeholder = 'Search',
    enableShortcut = true,
    id,
    className,
  },
  ref,
) {
  const autoId = useId();
  const finalId = id ?? autoId;
  const localRef = useRef<HTMLInputElement | null>(null);

  const setRefs = (node: HTMLInputElement | null) => {
    localRef.current = node;
    if (typeof ref === 'function') ref(node);
    else if (ref) ref.current = node;
  };

  useEffect(() => {
    if (!enableShortcut) return;
    const el = localRef.current;
    if (!el) return;
    const doc = el.ownerDocument;
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        el.focus();
        el.select();
      }
    };
    doc.addEventListener('keydown', handler);
    return () => doc.removeEventListener('keydown', handler);
  }, [enableShortcut]);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit(value);
  };

  const showShortcut = variant === 'header' && enableShortcut;
  const showButton = variant === 'large';
  const showIcon = variant === 'header';

  return (
    <form
      className={['amees-searchbox', `amees-searchbox--${variant}`, className]
        .filter(Boolean)
        .join(' ')}
      role="search"
      onSubmit={handleSubmit}
    >
      {showIcon ? (
        <span className="amees-searchbox__icon" aria-hidden="true">
          <Icon name="search" size={18} />
        </span>
      ) : null}
      <label className="amees-searchbox__sr" htmlFor={finalId}>
        Search
      </label>
      <input
        ref={setRefs}
        id={finalId}
        type="search"
        className="amees-searchbox__input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete="off"
      />
      {showShortcut ? (
        <kbd className="amees-searchbox__kbd" aria-hidden="true">
          Ctrl K
        </kbd>
      ) : null}
      {showButton ? (
        <Button type="submit" variant="primary" size="sm">
          Search
        </Button>
      ) : null}
    </form>
  );
});