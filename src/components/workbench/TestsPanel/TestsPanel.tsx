import { StatGrid, StatTile } from '../../primitives/StatTile';
import { DataTable, type DataTableColumn } from '../../containers/DataTable';
import { Badge } from '../../primitives/Badge';
import { Button } from '../../primitives/Button';

export interface Test {
  id: string;
  name: string;
  type: 'numeric' | 'qualitative';
  pass: boolean;
  
  // Numeric only
  exp?: number;
  meas?: number;
  unit?: string;
  tol?: number;
  err?: number;
  
  // Qualitative only
  expectedText?: string;
}

export function TestsPanel({
  tests,
  onDelete,
}: {
  tests: readonly Test[];
  onDelete: (id: string) => void;
}) {
  const passed = tests.filter(t => t.pass).length;
  // Only calculate average error for numeric tests
  const numericTests = tests.filter(t => t.type === 'numeric');
  const avgErr = numericTests.length 
    ? numericTests.reduce((s, t) => s + (t.err || 0), 0) / numericTests.length 
    : 0;

  const columns: DataTableColumn<Test>[] = [
    { key: 'name', label: 'Test', render: r => (
        <div>
          <b>{r.name}</b>
          <div style={{ fontSize: 'var(--fs-xs)', color: 'var(--muted)' }}>{r.type === 'numeric' ? 'Quantitative' : 'Qualitative'}</div>
        </div>
      ) 
    },
    { key: 'exp', label: 'Expected', render: r => r.type === 'numeric' ? `${r.exp} ${r.unit}` : r.expectedText },
    { key: 'meas', label: 'Measured / Result', render: r => r.type === 'numeric' ? `${r.meas} ${r.unit}` : '—' },
    { key: 'err', label: 'Error', render: r => r.type === 'numeric' ? `${(r.err || 0).toFixed(1)}% (max ${r.tol}%)` : '—' },
    { key: 'pass', label: 'Status', render: r => <Badge kind="stat" tone={r.pass ? 'ok' : 'bad'}>{r.pass ? 'Pass' : 'Fail'}</Badge> },
    { key: 'del', label: '', align: 'right', render: r => <Button size="sm" onClick={() => onDelete(r.id)}>✕</Button> }
  ];

  return (
    <div style={{ display: 'grid', gap: 'var(--sp-4)' }}>
      <StatGrid>
        <StatTile label="Tests logged" value={String(tests.length)} />
        <StatTile label="Passed" value={`${passed} / ${tests.length}`} highlight />
        <StatTile label="Pass rate" value={`${tests.length ? Math.round((passed / tests.length) * 100) : 0}%`} />
        <StatTile label="Avg error (numeric)" value={`${avgErr.toFixed(1)}%`} />
      </StatGrid>
      <DataTable columns={columns} rows={tests} rowKey={r => r.id} empty="No tests logged yet." />
    </div>
  );
}