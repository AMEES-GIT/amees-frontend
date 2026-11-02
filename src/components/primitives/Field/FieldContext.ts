import { createContext, useContext } from 'react';

export interface FieldContextValue {
  /** The id to apply to the input element. */
  id: string;
  /** Space-separated ids of hint and/or error elements. Ready to pass as `aria-describedby`. */
  describedBy?: string;
  /** True when the field has an error. Inputs should set `aria-invalid="true"`. */
  invalid: boolean;
}

export const FieldContext = createContext<FieldContextValue | null>(null);

/** Returns the surrounding Field's context, or null if not inside a Field. */
export function useFieldContext(): FieldContextValue | null {
  return useContext(FieldContext);
}