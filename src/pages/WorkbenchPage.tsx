import { useState } from 'react';
import { Wrap, Block, Row } from '../components/containers/Layout';
import { PageHeader } from '../components/containers/PageHeader';
import { Window } from '../components/containers/Window';
import { Button } from '../components/primitives/Button';
import { ConfirmDialog } from '../components/containers/ConfirmDialog';
import { useNow } from '../lib/useNow';
import { useContent } from '../content/contentProvider';

// Workbench Components
import { SignInForm, type SignInValues } from '../components/workbench/SignInForm';
import { NewProjectForm, type NewProjectData } from '../components/workbench/NewProjectForm';
import { StageTracker } from '../components/workbench/StageTracker';
import { HealthCard } from '../components/workbench/HealthCard';
import { PaceCard } from '../components/workbench/PaceCard';
import { ActivityHeatmap } from '../components/workbench/ActivityHeatmap';
import { Timeline, type TimelineEntry } from '../components/workbench/Timeline';
import { TaskBoard, type Task } from '../components/workbench/TaskBoard';
import { TaskForm } from '../components/workbench/TaskForm';
import { PartsPanel } from '../components/workbench/PartsPanel';
import { PartForm } from '../components/workbench/PartForm';
import { TestsPanel } from '../components/workbench/TestsPanel';
import { TestForm } from '../components/workbench/TestForm';
import { DemoChecklist } from '../components/workbench/DemoChecklist';
import { PitchEditor } from '../components/workbench/PitchEditor';
import { ExportPanel } from '../components/workbench/ExportPanel';

// Workbench Math
import { calculateHealth } from '../lib/workbench/health';
import { calculateTestResult } from '../lib/workbench/tests';
import { buildReport } from '../lib/workbench/export';

import './WorkbenchPage.css';

type Tab = 'overview' | 'timeline' | 'tasks' | 'parts' | 'tests' | 'demo';

const TRACKS = ['Embedded Systems', 'Control Systems', 'Electromechanics', 'Design', 'Other'];
const DAY = 86400000;

export function WorkbenchPage() {
  const content = useContent();
  const now = useNow(60000);

  const [user, setUser] = useState<string | null>('Demo Student'); 
  const [project, setProject] = useState<any>({
    name: 'Water Level Monitor',
    category: 'Embedded Systems',
    goal: 'Read water level in a tank with an ultrasonic sensor.',
    team: ['Ada', 'Tunde'],
    start: now.getTime() - 15 * DAY,
    stage: 4,
    entries: [
      { id: 'e1', ts: now.getTime() - 2 * DAY, type: 'milestone', title: 'Readings stable within 3%' },
      { id: 'e2', ts: now.getTime() - 5 * DAY, type: 'blocker', title: 'Tank lid reflection', text: 'False reads near the top.', resolved: false }
    ],
    tasks: [{ id: 't1', title: 'Waterproof sensor', col: 'todo', who: 'Tunde' }],
    parts: [{ id: 'p1', name: 'ESP32', qty: 1, cost: 9500, status: 'Owned' }],
    tests: [{ id: 'ts1', name: 'Distance at 20cm', type: 'numeric', exp: 20, meas: 20.4, unit: 'cm', tol: 3, err: 2.0, pass: true }],
    pitch: { pitch: 'A low-cost tank monitor.', problem: 'Tanks overflow.', solution: 'Uses ultrasonic sensors.', status: 'Works.', demo: 'Step 1', ask: 'Funding.' },
    checks: [
      { id: 'c1', label: 'Pitch written', checked: true },
      { id: 'c2', label: 'Tests logged', checked: false }
    ]
  });

  const [tab, setTab] = useState<Tab>('overview');
  const [modal, setModal] = useState<{ open: boolean; action?: () => void }>({ open: false });
  const [timelineFilter, setTimelineFilter] = useState('all');

  const confirmDelete = (action: () => void) => {
    setModal({ open: true, action });
  };

  const handleSignIn = (val: SignInValues) => setUser(val.name);
  const handleSignOut = () => setUser(null);

  const handleNewProject = (data: NewProjectData) => {
    setProject({
      name: data.name, category: data.category, goal: data.goal, team: data.team.split(',').map(s => s.trim()),
      start: Date.now(), stage: 0, entries: [], tasks: [], parts: [], tests: [], checks: [], pitch: {}
    });
  };

  if (!user) {
    return (
      <Wrap>
        <Block>
          <PageHeader className="wb-header" kicker={content.pages.workbench.kicker} title={content.pages.workbench.title} lede={content.pages.workbench.lede} />
        </Block>
        <Block>
          <div style={{ maxWidth: 400, margin: '0 auto' }}>
            <SignInForm onSubmit={handleSignIn} />
          </div>
        </Block>
      </Wrap>
    );
  }

  if (!project) {
    return (
      <Wrap>
        <Block>
          <PageHeader className="wb-header" kicker={content.pages.workbench.kicker} title="New project" lede="Create a project to start tracking your build." />
        </Block>
        <Block>
          <div style={{ maxWidth: 600, margin: '0 auto' }}>
            <NewProjectForm categories={TRACKS} onSubmit={handleNewProject} onCancel={handleSignOut} />
          </div>
        </Block>
      </Wrap>
    );
  }

  const health = calculateHealth(project, now.getTime());
  const daysLeft = Math.max(0, Math.ceil((new Date('2026-12-03T17:00:00+01:00').getTime() - now.getTime()) / DAY));
  const tasksLeft = project.tasks.filter((t: Task) => t.col !== 'done').length;
  const blockers = project.entries.filter((e: TimelineEntry) => e.type === 'blocker' && !e.resolved).length;

  const exportData = {
    name: project.name,
    track: project.category,
    goal: project.goal,
    team: project.team,
    pitch: {
      pitch: project.pitch.pitch || '',
      problem: project.pitch.problem || '',
      works: project.pitch.solution || '',
      broken: project.pitch.status || '',
      ask: project.pitch.ask || ''
    },
    milestones: project.entries.filter((e:any) => e.type === 'milestone').map((e:any) => ({ title: e.title, date: new Date(e.ts).toLocaleDateString() })),
    tests: project.tests.map((t:any) => ({ name: t.name, type: t.type, result: t.pass ? 'Pass' : 'Fail' })),
    parts: project.parts.map((p:any) => ({ name: p.name, qty: p.qty, status: p.status }))
  };

  const TABS: { id: Tab, label: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'timeline', label: 'Timeline' },
    { id: 'tasks', label: 'Tasks' },
    { id: 'parts', label: 'Parts' },
    { id: 'tests', label: 'Tests' },
    { id: 'demo', label: 'Demo' },
  ];

  return (
    <Wrap>
      <Block>
        <PageHeader className="wb-header" kicker={content.pages.workbench.kicker} title={project.name} lede={`Track: ${project.category}`} />
      </Block>

      <Block>
        <Window title="Project Stages">
          <StageTracker current={project.stage} />
          <Row className="wb-stage-actions">
            <Button size="sm" onClick={() => setProject({...project, stage: Math.max(0, project.stage - 1)})}>← Back</Button>
            <Button size="sm" variant="primary" onClick={() => setProject({...project, stage: Math.min(5, project.stage + 1)})}>Next Stage →</Button>
            <Button size="sm" className="wb-signout-btn" onClick={handleSignOut}>Sign out</Button>
          </Row>
        </Window>
      </Block>

      <div className="wb-tabs">
        {TABS.map(t => (
          <Button 
            key={t.id}
            pressed={tab === t.id} 
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </Button>
        ))}
      </div>

      {tab === 'overview' && (
        <div className="wb-grid">
          <HealthCard health={health} />
          <PaceCard daysLeft={daysLeft} tasksLeft={tasksLeft} pace={tasksLeft / Math.max(1, daysLeft)} streakWeeks={2} openBlockers={blockers} />
          <div className="wb-span-full">
             <Window title="Activity">
               <ActivityHeatmap counts={Array(56).fill(0).map(() => Math.floor(Math.random() * 4))} />
             </Window>
          </div>
        </div>
      )}

      {tab === 'timeline' && (
        <div className="wb-grid">
          <div className="wb-span-full">
             <Timeline
               entries={project.entries}
               filter={timelineFilter}
               onFilterChange={setTimelineFilter}
               projectStart={project.start}
               now={now.getTime()}
               onResolveBlocker={(id) => {
                 const newEntries = project.entries.map((e: any) => e.id === id ? { ...e, resolved: !e.resolved } : e);
                 setProject({ ...project, entries: newEntries });
               }}
               onDeleteEntry={(id) => confirmDelete(() => setProject({ ...project, entries: project.entries.filter((e: any) => e.id !== id) }))}
             />
          </div>
        </div>
      )}

      {tab === 'tasks' && (
        <div className="wb-grid">
          <div className="wb-span-full">
            <Window title="Add task">
               <TaskForm team={project.team} onSubmit={(d) => setProject({ ...project, tasks: [...project.tasks, { id: Date.now().toString(), title: d.title, who: d.who, col: 'todo' }] })} />
            </Window>
            <div style={{ marginTop: 'var(--sp-4)' }}>
              <TaskBoard
                tasks={project.tasks}
                team={project.team}
                onMove={(id, dir) => {
                  const cols = ['todo', 'doing', 'done'];
                  setProject({ ...project, tasks: project.tasks.map((t: any) => {
                    if (t.id !== id) return t;
                    const idx = cols.indexOf(t.col) + dir;
                    return idx >= 0 && idx <= 2 ? { ...t, col: cols[idx] } : t;
                  })});
                }}
                onDelete={(id) => confirmDelete(() => setProject({ ...project, tasks: project.tasks.filter((t: any) => t.id !== id) }))}
              />
            </div>
          </div>
        </div>
      )}

      {tab === 'parts' && (
        <Window title="Parts & Budget">
           <PartForm onSubmit={(d) => setProject({ ...project, parts: [...project.parts, { id: Date.now().toString(), name: d.name, qty: Number(d.qty), cost: Number(d.cost), status: d.status }] })} />
           <PartsPanel parts={project.parts} budget={30000} onDelete={(id) => confirmDelete(() => setProject({ ...project, parts: project.parts.filter((p: any) => p.id !== id) }))} />
        </Window>
      )}

      {tab === 'tests' && (
        <Window title="Test Log">
           <TestForm onSubmit={(d) => {
             const exp = Number(d.exp); const meas = Number(d.meas); const tol = Number(d.tol);
             const { err, pass } = calculateTestResult(exp, meas, tol);
             setProject({ ...project, tests: [...project.tests, { id: Date.now().toString(), name: d.name, type: 'numeric', exp, meas, unit: d.unit, tol, err, pass }] });
           }} />
           <TestsPanel tests={project.tests} onDelete={(id) => confirmDelete(() => setProject({ ...project, tests: project.tests.filter((t: any) => t.id !== id) }))} />
        </Window>
      )}

      {tab === 'demo' && (
        <div className="wb-grid">
           <div className="wb-span-full">
             <Window title="Checklist">
               <DemoChecklist
                 checks={project.checks}
                 onToggle={(id) => setProject({ ...project, checks: project.checks.map((c: any) => c.id === id ? { ...c, checked: !c.checked } : c) })}
                 onAdd={(label) => setProject({ ...project, checks: [...project.checks, { id: Date.now().toString(), label, checked: false }] })}
                 onDelete={(id) => confirmDelete(() => setProject({ ...project, checks: project.checks.filter((c: any) => c.id !== id) }))}
               />
             </Window>
           </div>
           
           <div className="wb-span-full">
             <Window title="Pitch Editor">
               <PitchEditor value={project.pitch} onChange={(f, v) => setProject({ ...project, pitch: { ...project.pitch, [f]: v } })} />
             </Window>
           </div>

           <div className="wb-span-full">
             <Window title="Export">
               <ExportPanel exportData={buildReport(exportData)} onCopy={() => navigator.clipboard.writeText(buildReport(exportData))} />
             </Window>
           </div>
        </div>
      )}

      <ConfirmDialog
        open={modal.open}
        title="Confirm Delete"
        body="Are you sure you want to delete this item? This cannot be undone."
        confirmLabel="Delete"
        type="confirm"
        onCancel={() => setModal({ open: false })}
        onConfirm={() => { modal.action?.(); setModal({ open: false }); }}
      />
    </Wrap>
  );
}