import { useState, useEffect } from 'react';
import { Wrap, Block, Row } from '../components/containers/Layout';
import { PageHeader } from '../components/containers/PageHeader';
import { Window } from '../components/containers/Window';
import { Button } from '../components/primitives/Button';
import { ConfirmDialog } from '../components/containers/ConfirmDialog';
import { TextInput } from '../components/primitives/TextInput';
import { useNow } from '../lib/useNow';
import { useContent } from '../content/contentProvider';
import { API_BASE } from '../lib/apiBase';

// Workbench Components
import { SignInForm } from '../components/workbench/SignInForm';
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

type Tab = 'overview' | 'team' | 'timeline' | 'tasks' | 'parts' | 'tests' | 'demo';
const TRACKS = ['Embedded Systems', 'Control Systems', 'Electromechanics', 'Design', 'Other'];
const DAY = 86400000;

export function WorkbenchPage() {
  const content = useContent();
  const now = useNow(60000);

  const [token, setToken] = useState<string | null>(localStorage.getItem('amees_student_token'));
  const [student, setStudent] = useState<any>(null);
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [tab, setTab] = useState<Tab>('overview');
  const [modal, setModal] = useState<{ open: boolean; action?: () => void }>({ open: false });
  const [timelineFilter, setTimelineFilter] = useState('all');

  // 1. Handle URL Join Parameter
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const joinId = params.get('join');
    if (joinId && token) {
      fetch(`${API_BASE}/api/student/workbench/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ projectId: joinId })
      }).then(() => {
        // Remove the param from URL and reload data
        window.history.replaceState({}, '', '/workbench');
        window.location.reload();
      });
    }
  }, [token]);

  // 2. Fetch Workbench Data
  useEffect(() => {
    if (!token) { setLoading(false); return; }
    
    fetch(`${API_BASE}/api/student/workbench`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data.student) {
          setStudent(data.student);
          if (data.project) {
            // Merge workbenchData with the DB members array
            setProject({
              ...data.project.workbenchData,
              members: data.project.members,
              builderString: data.project.builder
            });
          }
        } else {
          handleSignOut();
        }
      })
      .catch(() => handleSignOut())
      .finally(() => setLoading(false));
  }, [token]);

  // 3. Auto-Save Data (Debounced 1s)
  useEffect(() => {
    if (!project || !token) return;
    
    const timeoutId = setTimeout(() => {
      fetch(`${API_BASE}/api/student/workbench`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ project })
      }).catch(err => console.error('Auto-save failed', err));
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [project, token]);

  const handleSignIn = (newToken: string, newStudent: any) => {
    localStorage.setItem('amees_student_token', newToken);
    setToken(newToken);
    setStudent(newStudent);
  };

  const handleSignOut = () => {
    localStorage.removeItem('amees_student_token');
    setToken(null);
    setStudent(null);
    setProject(null);
  };

  const handleNewProject = (data: NewProjectData) => {
    setProject({
      name: data.name, category: data.category, goal: data.goal, team: [], members: [],
      start: Date.now(), stage: 0, entries: [], tasks: [], parts: [], tests: [], checks: [], pitch: {}
    });
  };

  const confirmDelete = (action: () => void) => setModal({ open: true, action });

  if (loading) return <div style={{ padding: 'var(--sp-6)', textAlign: 'center', fontFamily: 'var(--font)' }}>Loading your workbench...</div>;

  if (!token) {
    return (
      <Wrap>
        <Block><PageHeader className="wb-header" kicker={content.pages.workbench.kicker} title={content.pages.workbench.title} lede={content.pages.workbench.lede} /></Block>
        <Block><div style={{ maxWidth: 400, margin: '0 auto' }}><SignInForm onSuccess={handleSignIn} /></div></Block>
      </Wrap>
    );
  }

  if (!project) {
    return (
      <Wrap>
        <Block><PageHeader className="wb-header" kicker={content.pages.workbench.kicker} title="New project" lede="Create a project to start tracking your build." /></Block>
        <Block><div style={{ maxWidth: 600, margin: '0 auto' }}><NewProjectForm categories={TRACKS} onSubmit={handleNewProject} onCancel={handleSignOut} /></div></Block>
      </Wrap>
    );
  }

  const myRole = project.members?.find((m: any) => m.studentId === student.id)?.role;
  const isLead = myRole === 'Lead';
  
  // Extract just names for the TaskBoard/TaskForm components
  const teamNames = project.members?.map((m: any) => m.student.name) || [];

  const health = calculateHealth(project, now.getTime());
  const daysLeft = Math.max(0, Math.ceil((new Date('2026-12-03T17:00:00+01:00').getTime() - now.getTime()) / DAY));
  const tasksLeft = project.tasks?.filter((t: Task) => t.col !== 'done').length || 0;
  const blockers = project.entries?.filter((e: TimelineEntry) => e.type === 'blocker' && !e.resolved).length || 0;

  const exportData = {
    name: project.name, track: project.category, goal: project.goal, team: teamNames,
    pitch: { pitch: project.pitch?.pitch || '', problem: project.pitch?.problem || '', works: project.pitch?.solution || '', broken: project.pitch?.status || '', ask: project.pitch?.ask || '' },
    milestones: project.entries?.filter((e:any) => e.type === 'milestone').map((e:any) => ({ title: e.title, date: new Date(e.ts).toLocaleDateString() })) || [],
    tests: project.tests?.map((t:any) => ({ name: t.name, type: t.type, result: t.pass ? 'Pass' : 'Fail' })) || [],
    parts: project.parts?.map((p:any) => ({ name: p.name, qty: p.qty, status: p.status })) || []
  };

  const TABS: { id: Tab, label: string }[] = [
    { id: 'overview', label: 'Overview' }, 
    { id: 'team', label: 'Team' },
    { id: 'timeline', label: 'Timeline' },
    { id: 'tasks', label: 'Tasks' }, 
    { id: 'parts', label: 'Parts' },
    { id: 'tests', label: 'Tests' }, 
    { id: 'demo', label: 'Demo' },
  ];

  const joinUrl = `${window.location.origin}/workbench?join=${project.id || ''}`;

  return (
    <Wrap>
      <Block><PageHeader className="wb-header" kicker={content.pages.workbench.kicker} title={project.name} lede={`Track: ${project.category} · Signed in as ${student?.name || 'Student'} (${myRole || 'Member'})`} /></Block>

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
        {TABS.map(t => <Button key={t.id} pressed={tab === t.id} onClick={() => setTab(t.id)}>{t.label}</Button>)}
      </div>

      {tab === 'overview' && (
        <div className="wb-grid">
          <HealthCard health={health} />
          <PaceCard daysLeft={daysLeft} tasksLeft={tasksLeft} pace={tasksLeft / Math.max(1, daysLeft)} streakWeeks={2} openBlockers={blockers} />
          <div className="wb-span-full"><Window title="Activity"><ActivityHeatmap counts={Array(56).fill(0).map(() => Math.floor(Math.random() * 4))} /></Window></div>
        </div>
      )}

      {tab === 'team' && (
        <Window title="Project Team" meta={isLead ? "You are the Lead" : "View only"}>
          {!project.id ? (
             <p style={{ color: 'var(--muted)' }}>Team management unlocks after your first auto-save.</p>
          ) : (
            <div style={{ display: 'grid', gap: 'var(--sp-4)' }}>
              <div style={{ background: 'var(--panel-2)', padding: 'var(--sp-3)', borderRadius: '4px' }}>
                <h4 style={{ margin: '0 0 var(--sp-2)' }}>Invite Link</h4>
                <p style={{ fontSize: 'var(--fs-sm)', color: 'var(--muted)', margin: '0 0 var(--sp-2)' }}>
                  Share this link with your teammates. When they log into the Workbench, they will join this project.
                </p>
                <div style={{ display: 'flex', gap: 'var(--sp-2)' }}>
                  <TextInput value={joinUrl} onChange={() => {}} disabled />
                  <Button onClick={() => navigator.clipboard.writeText(joinUrl)}>Copy</Button>
                </div>
              </div>

              <div>
                <h4 style={{ margin: '0 0 var(--sp-2)' }}>Members</h4>
                {project.members?.map((m: any) => (
                  <div key={m.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 'var(--sp-2) 0', borderBottom: '1px solid var(--line)' }}>
                    <div>
                      <div style={{ fontWeight: 'bold' }}>{m.student.name}</div>
                      <div style={{ fontSize: 'var(--fs-sm)', color: 'var(--muted)' }}>{m.student.matric}</div>
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)' }}>
                      {isLead && m.role !== 'Lead' ? (
                        <>
                          <TextInput 
                            value={m.role} 
                            onChange={(val) => {
                              const newMembers = project.members.map((x: any) => x.id === m.id ? { ...x, role: val } : x);
                              setProject({ ...project, members: newMembers });
                            }} 
                          />
                          <Button variant="default" onClick={() => confirmDelete(() => setProject({ ...project, members: project.members.filter((x: any) => x.id !== m.id) }))}>Remove</Button>
                        </>
                      ) : (
                        <span style={{ fontWeight: 'bold', padding: '0 var(--sp-2)' }}>{m.role}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Window>
      )}

      {tab === 'timeline' && (
        <div className="wb-grid">
          <div className="wb-span-full">
             <Timeline
               entries={project.entries || []} filter={timelineFilter} onFilterChange={setTimelineFilter} projectStart={project.start} now={now.getTime()}
               onResolveBlocker={(id) => setProject({ ...project, entries: project.entries.map((e: any) => e.id === id ? { ...e, resolved: !e.resolved } : e) })}
               onDeleteEntry={(id) => confirmDelete(() => setProject({ ...project, entries: project.entries.filter((e: any) => e.id !== id) }))}
             />
          </div>
        </div>
      )}

      {tab === 'tasks' && (
        <div className="wb-grid">
          <div className="wb-span-full">
            <Window title="Add task"><TaskForm team={teamNames} onSubmit={(d) => setProject({ ...project, tasks: [...(project.tasks || []), { id: Date.now().toString(), title: d.title, who: d.who, col: 'todo' }] })} /></Window>
            <div style={{ marginTop: 'var(--sp-4)' }}>
              <TaskBoard
                tasks={project.tasks || []} team={teamNames}
                onMove={(id, dir) => {
                  const cols = ['todo', 'doing', 'done'];
                  setProject({ ...project, tasks: (project.tasks || []).map((t: any) => {
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
           <PartForm onSubmit={(d) => setProject({ ...project, parts: [...(project.parts || []), { id: Date.now().toString(), name: d.name, qty: Number(d.qty), cost: Number(d.cost), status: d.status }] })} />
           <PartsPanel parts={project.parts || []} budget={30000} onDelete={(id) => confirmDelete(() => setProject({ ...project, parts: project.parts.filter((p: any) => p.id !== id) }))} />
        </Window>
      )}

      {tab === 'tests' && (
        <Window title="Test Log">
           <TestForm onSubmit={(d) => {
             const exp = Number(d.exp); const meas = Number(d.meas); const tol = Number(d.tol);
             const { err, pass } = calculateTestResult(exp, meas, tol);
             setProject({ ...project, tests: [...(project.tests || []), { id: Date.now().toString(), name: d.name, type: 'numeric', exp, meas, unit: d.unit, tol, err, pass }] });
           }} />
           <TestsPanel tests={project.tests || []} onDelete={(id) => confirmDelete(() => setProject({ ...project, tests: project.tests.filter((t: any) => t.id !== id) }))} />
        </Window>
      )}

      {tab === 'demo' && (
        <div className="wb-grid">
           <div className="wb-span-full">
             <Window title="Checklist">
               <DemoChecklist
                 checks={project.checks || []}
                 onToggle={(id) => setProject({ ...project, checks: project.checks.map((c: any) => c.id === id ? { ...c, checked: !c.checked } : c) })}
                 onAdd={(label) => setProject({ ...project, checks: [...(project.checks || []), { id: Date.now().toString(), label, checked: false }] })}
                 onDelete={(id) => confirmDelete(() => setProject({ ...project, checks: project.checks.filter((c: any) => c.id !== id) }))}
               />
             </Window>
           </div>
           <div className="wb-span-full"><Window title="Pitch Editor"><PitchEditor value={project.pitch || {}} onChange={(f, v) => setProject({ ...project, pitch: { ...(project.pitch || {}), [f]: v } })} /></Window></div>
           <div className="wb-span-full"><Window title="Export"><ExportPanel exportData={buildReport(exportData)} onCopy={() => navigator.clipboard.writeText(buildReport(exportData))} /></Window></div>
        </div>
      )}

      <ConfirmDialog
        open={modal.open} title="Confirm Delete" body="Are you sure you want to remove this team member?" confirmLabel="Remove" type="confirm"
        onCancel={() => setModal({ open: false })}
        onConfirm={() => { modal.action?.(); setModal({ open: false }); }}
      />
    </Wrap>
  );
}