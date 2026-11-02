import { useState } from 'react';
import { Wrap, Block } from '../components/containers/Layout';
import { PageHeader } from '../components/containers/PageHeader';
import { Button } from '../components/primitives/Button';
import { useContent } from '../content/contentProvider';

// Import all the tools
import { ResistorTool } from '../components/toolbox/ResistorTool';
import { OhmTool } from '../components/toolbox/OhmTool';
import { DividerTool } from '../components/toolbox/DividerTool';
import { LedTool } from '../components/toolbox/LedTool';
import { RcTool } from '../components/toolbox/RcTool';
import { GearTool } from '../components/toolbox/GearTool';
import { PidTool } from '../components/toolbox/PidTool';
import { PinoutTool } from '../components/toolbox/PinoutTool';

import './ToolboxPage.css';

type ToolId = 'resistor' | 'ohm' | 'divider' | 'led' | 'rc' | 'gear' | 'pid' | 'pinout';

const TOOLS: { id: ToolId; label: string; component: React.ReactNode }[] = [
  { id: 'resistor', label: 'Resistor Code', component: <ResistorTool /> },
  { id: 'ohm', label: "Ohm's Law", component: <OhmTool /> },
  { id: 'divider', label: 'Voltage Divider', component: <DividerTool /> },
  { id: 'led', label: 'LED Resistor', component: <LedTool /> },
  { id: 'rc', label: 'RC Filter', component: <RcTool /> },
  { id: 'gear', label: 'Gear Train', component: <GearTool /> },
  { id: 'pid', label: 'PID Tuning', component: <PidTool /> },
  { id: 'pinout', label: 'Pinouts', component: <PinoutTool /> },
];

export function ToolboxPage() {
  const content = useContent();
  const [activeTool, setActiveTool] = useState<ToolId>('resistor');

  const activeComponent = TOOLS.find(t => t.id === activeTool)?.component;

  return (
    <Wrap>
      <Block>
        <PageHeader 
          className="toolbox-header"
          kicker={content.pages.toolbox.kicker} 
          title={content.pages.toolbox.title} 
          lede={content.pages.toolbox.lede} 
        />
      </Block>

      <Block>
        <div className="toolbox-nav" role="tablist">
          {TOOLS.map(t => (
            <Button
              key={t.id}
              pressed={activeTool === t.id}
              onClick={() => setActiveTool(t.id)}
            >
              {t.label}
            </Button>
          ))}
        </div>

        {/* Render the selected tool */}
        <div role="tabpanel">
          {activeComponent}
        </div>
      </Block>
    </Wrap>
  );
}