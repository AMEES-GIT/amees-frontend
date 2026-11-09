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
  // Bulletproofing: Ensure parts is always an array
  const safeParts = Array.isArray(parts) ? parts : [];

  // Money still to be spent (Ordered + Needed)
  const spend = safeParts.reduce(
    (s, x) => s + (x.status !== 'Owned' ? Number(x.qty || 0) * Number(x.cost || 0) : 0), 
    0
  );
  
  // Money needed for future purchases (Needed only)
  const need = safeParts.reduce(
    (s, x) => s + (x.status === 'Needed' ? Number(x.qty || 0) * Number(x.cost || 0) : 0), 
    0
  );
  
  // Total project value (all parts, regardless of status)
  const value = safeParts.reduce(
    (s, x) => s + Number(x.qty || 0) * Number(x.cost || 0), 
    0
  );

  // Budget remaining after accounting for ALL parts
  const remain = budget - value;

  const columns: DataTableColumn<Part>[] = [
    { key: 'name', label: 'Part', render: r => <b>{r.name}</b> },
    { key: 'qty', label: 'Qty', align: 'right', render: r => String(r.qty || 0) },
    { key: 'cost', label: 'Unit Cost', align: 'right', render: r => `₦${Number(r.cost || 0).toLocaleString()}` },
    { key: 'status', label: 'Status' },
    { key: 'sub', label: 'Subtotal', align: 'right', render: r => `₦${(Number(r.qty || 0) * Number(r.cost || 0)).toLocaleString()}` },
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
      <DataTable columns={columns} rows={safeParts} rowKey={r => r.id} empty="No parts yet." />
    </div>
  );
}