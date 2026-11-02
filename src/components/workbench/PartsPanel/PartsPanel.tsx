import { StatGrid, StatTile } from '../../primitives/StatTile';
import { DataTable, type DataTableColumn } from '../../containers/DataTable';
import { Button } from '../../primitives/Button';

export interface Part {
  id: string;
  name: string;
  qty: number;
  cost: number;
  status: string;
}

export function PartsPanel({
  parts,
  budget,
  onDelete,
}: {
  parts: readonly Part[];
  budget: number;
  onDelete: (id: string) => void;
}) {
  const spend = parts.reduce((s, x) => s + (x.status !== 'Owned' ? x.qty * x.cost : 0), 0);
  const need = parts.reduce((s, x) => s + (x.status === 'Needed' ? x.qty * x.cost : 0), 0);
  const value = parts.reduce((s, x) => s + x.qty * x.cost, 0);
  const remain = budget - spend;

  const columns: DataTableColumn<Part>[] = [
    { key: 'name', label: 'Part', render: r => <b>{r.name}</b> },
    { key: 'qty', label: 'Qty', align: 'right' },
    { key: 'cost', label: 'Unit Cost', align: 'right', render: r => `₦${r.cost.toLocaleString()}` },
    { key: 'status', label: 'Status' },
    { key: 'sub', label: 'Subtotal', align: 'right', render: r => `₦${(r.qty * r.cost).toLocaleString()}` },
    { key: 'del', label: '', align: 'right', render: r => <Button size="sm" onClick={() => onDelete(r.id)}>✕</Button> }
  ];

  return (
    <div style={{ display: 'grid', gap: 'var(--sp-4)' }}>
      <StatGrid>
        <StatTile label="Parts value" value={`₦${value.toLocaleString()}`} />
        <StatTile label="To spend" value={`₦${spend.toLocaleString()}`} highlight />
        <StatTile label="Still to buy" value={`₦${need.toLocaleString()}`} />
        <StatTile label="Budget left" value={`₦${remain.toLocaleString()}`} />
      </StatGrid>
      <DataTable columns={columns} rows={parts} rowKey={r => r.id} empty="No parts yet." />
    </div>
  );
}