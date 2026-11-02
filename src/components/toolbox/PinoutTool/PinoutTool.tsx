import { useState } from 'react';
import { Window } from '../../containers/Window';
import { ChipGroup } from '../../primitives/ChipGroup';
import { DataTable, type DataTableColumn } from '../../containers/DataTable';
import { Badge } from '../../primitives/Badge';
import { PIN_DATA, FILTERS, type PinData } from '../../../lib/toolbox/pinouts';

const COLUMNS: DataTableColumn<PinData>[] = [
  { 
    key: 'pin', 
    label: 'Pin', 
    width: 100,
    render: (r) => <b>{r.pin}</b> 
  },
  { 
    key: 'funcs', 
    label: 'Functions',
    render: (r) => (
      <div>
        {r.funcs}
        {r.avoid && <span style={{ marginLeft: 8 }}><Badge tone="bad" kind="pill">Avoid</Badge></span>}
      </div>
    )
  },
  { key: 'note', label: 'Notes' }
];

export function PinoutTool() {
  const [board, setBoard] = useState<'esp32' | 'uno'>('esp32');
  const [filter, setFilter] = useState('all');

  const data = PIN_DATA[board];
  const filteredPins = data.pins.filter(p => {
    if (filter === 'all') return true;
    if (filter === 'avoid') return p.avoid;
    return p.tags.includes(filter);
  });

  return (
    <Window title="Pinout cheat sheet" meta={data.name}>
      <div style={{ display: 'grid', gap: 'var(--sp-4)' }}>
        
        <div style={{ display: 'grid', gap: 'var(--sp-3)' }}>
          <ChipGroup
            label="Board"
            items={[
              { value: 'esp32', label: 'ESP32' },
              { value: 'uno', label: 'Arduino Uno' }
            ]}
            value={board}
            onChange={(v) => {
              setBoard(v as 'esp32' | 'uno');
              setFilter('all'); // Reset filter on board change
            }}
            showLabel={false}
          />

          <ChipGroup
            label="Filter"
            items={FILTERS.map(f => ({ value: f.id, label: f.label }))}
            value={filter}
            onChange={setFilter}
            showLabel={false}
          />
        </div>

        <DataTable
          columns={COLUMNS}
          rows={filteredPins}
          rowKey={(r) => r.pin}
          empty={`No pins match the "${filter}" filter.`}
        />

        <p style={{ fontSize: 'var(--fs-sm)', color: 'var(--muted)', margin: 0 }}>
          {board === 'esp32' 
            ? 'ADC2 pins cannot be read while Wi-Fi is on. GPIO6 to 11 connect to the flash chip and are not usable.'
            : 'Analog pins also work as digital pins 14 to 19. Each pin sources up to 20 mA.'}
        </p>
      </div>
    </Window>
  );
}