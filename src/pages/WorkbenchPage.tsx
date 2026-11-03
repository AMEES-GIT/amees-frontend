import { useState, useEffect, useMemo, useRef } from 'react';
import { Wrap, Block, Row } from '../components/containers/Layout';
import { PageHeader } from '../components/containers/PageHeader';
import { Window } from '../components/containers/Window';
import { Button } from '../components/primitives/Button';
import { TextInput } from '../components/primitives/TextInput';
import { Select } from '../components/primitives/Select'; 
import { ConfirmDialog } from '../components/containers/ConfirmDialog';
import { Toast } from '../components/shell/Toast';
import { useNow } from '../lib/useNow';
import { useContent } from '../content/contentProvider';
import { API_BASE } from '../lib/apiBase';

import { SignInForm } from '../components/workbench/SignInForm';
import { NewProjectForm, type NewProjectData } from '../components/workbench/NewProjectForm';
import { StageTracker } from '../components/workbench/StageTracker';
import { HealthCard } from '../components/workbench/HealthCard';
import { PaceCard } from '../components/workbench/PaceCard';
import { ActivityHeatmap } from '../components/workbench/ActivityHeatmap';
import { Timeline, type TimelineEntry } from '../components/workbench/Timeline';
import { EntryForm } from '../components/workbench/EntryForm';
import { TaskBoard, type Task } from '../components/workbench/TaskBoard';
import { TaskForm } from '../components/workbench/TaskForm';
import { PartsPanel } from '../components/workbench/PartsPanel';
import { PartForm } from '../components/workbench/PartForm';
import { TestsPanel } from '../components/workbench/TestsPanel';
import { TestForm } from '../components/workbench/TestForm';
import { DemoChecklist } from '../components/workbench/DemoChecklist';
import { PitchEditor } from '../components/workbench/PitchEditor';
import { ExportPanel } from '../components/workbench/ExportPanel';

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
  
  const [projects, setProjects] = useState<any[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [isCreatingProject, setIsCreatingProject] = useState(false);

  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>('overview');
  const [modal, setModal] = useState<{ open: boolean; action?: () => void }>({ open: false });
  const [timelineFilter, setTimelineFilter] = useState('all');

  // Toast State
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const showToast = (message: string, type: 'success' | 'error' = 'success') => setToast({ message, type });

  const pendingJoinRef = useRef<string | null>(null);

  // 1. Handle URL Join Parameter on Mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const joinId = params.get('join');
    if (joinId) {
      pendingJoinRef.current = joinId;
      window.history.replaceState({}, '', '/workbench');
    }
  }, []);

  // 2. Fetch Workbench Data & Process Pending Join
  useEffect(() => {
    if (!token) { setLoading(false); return; }
    
    let isMounted = true;

    const initialize = async () => {
      setLoading(true);
      try {
        if (pendingJoinRef.current) {
          await fetch(`${API_BASE}/api/student/workbench/join`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({ projectId: pendingJoinRef.current })
          });
        }

        const res = await fetch(`${API_BASE}/api/student/workbench`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        
        if (!isMounted) return;

        if (data.student) {
          setStudent(data.student);
          setProjects(data.projects || []);
          
          if (data.projects?.length > 0) {
            const targetId = pendingJoinRef.current && data.projects.find((p:any) => p.id === pendingJoinRef.current) 
              ? pendingJoinRef.current 
              : data.projects[0].id;
            setActiveProjectId(targetId);
          } else {
            setIsCreatingProject(true);
          }
        } else {
          handleSignOut();
        }
      } catch (err) {
        if (isMounted) handleSignOut();
      } finally {
        if (isMounted) setLoading(false);
        pendingJoinRef.current = null;
      }
    };

    initialize();
    
    return () => { isMounted = false; };
  }, [token]);

  const project = projects.find(p => p.id === activeProjectId) || null;

  // 3. Auto-Save Data (Debounced 1s)
  useEffect(() => {
    if (!project || !token) return;
    
    const timeoutId = setTimeout(() => {
      const payloadProject = { ...project };
      if (payloadProject.id === 'temp') {
        delete payloadProject.id;
      }

      fetch(`${API_BASE}/api/student/workbench`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ 
          project: payloadProject,
          studentName: student?.name || 'Unknown'
        })
      })
      .then(res => res.json())
      .then(data => {
        if (project.id === 'temp' && data.id) {
          setProjects(prev => prev.map(p => p.id === 'temp' ? { ...p, id: data.id } : p));
          setActiveProjectId(data.id);
        }
      })
      .catch(err => console.error('Auto-save failed', err));
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [project, token, student]);

  const handleSignIn = (newToken: string, newStudent: any) => {
    localStorage.setItem('amees_student_token', newToken);
    setToken(newToken);
    setStudent(newStudent);
  };

  const handleSignOut = () => {
    localStorage.removeItem('amees_student_token');
    setToken(null);
    setStudent(null);
    setProjects([]);
    setActiveProjectId(null);
  };

  const handleNewProject = (data: NewProjectData) => {
    const newProj = {
      id: 'temp',
      name: data.name, 
      category: data.category, 
      goal: data.goal, 
      team: [], 
      members: [],
      start: Date.now(), 
      stage: 0, 
      entries: [], 
      tasks: [], 
      parts: [], 
      tests: [], 
      checks: [], 
      pitch: {}
    };
    setProjects([...projects, newProj]);
    setActiveProjectId(newProj.id);
    setIsCreatingProject(false);
  };

  const deleteProject = async () => {
    if (!project || !project.id || project.id === 'temp') return;
    try {
      await fetch(`${API_BASE}/api/student/workbench/${project.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const remaining = projects.filter(p => p.id !== project.id);
      setProjects(remaining);
      if (remaining.length > 0) setActiveProjectId(remaining[0].id);
      else {
        setIsCreatingProject(true);
        setActiveProjectId(null);
      }
      showToast('Project deleted');
    } catch {
      showToast('Failed to delete project', 'error');
    }
  };

  const confirmDelete = (action: () => void) => setModal({ open: true, action });

  // 4. Dynamic Heatmap Calculation
  const heatmapCounts = useMemo(() => {
    const counts = Array(56).fill(0);
    const entries = project?.workbenchData?.entries || project?.entries || [];
    if (!entries.length) return counts;
    
    const today = new Date().setHours(0,0,0,0);
    entries.forEach((e: any) => {
      const entryDate = new Date(e.ts).setHours(0,0,0,0);
      const daysAgo = Math.floor((today - entryDate) / DAY);
      if (daysAgo >= 0 && daysAgo < 56) {
        counts[55 - daysAgo] += 1;
      }
    });
    return counts;
  }, [project]);

  if (loading) return <div style={{ padding: 'var(--sp-6)', textAlign: 'center', fontFamily: 'var(--font)' }}>Loading your workbench...</div>;

  if (!token) {
    return (
      <Wrap>
        <Block><PageHeader className="wb-header" kicker={content.pages.workbench.kicker} title={content.pages.workbench.title} lede={content.pages.workbench.lede} /></Block>
        <Block><div style={{ maxWidth: 400, margin: '0 auto' }}><SignInForm onSuccess={handleSignIn} /></div></Block>
      </Wrap>
    );
  }

  if (isCreatingProject || !project) {
    return (
      <Wrap>
        <Block><PageHeader className="wb-header" kicker={content.pages.workbench.kicker} title="New Project" lede="Create a project to start tracking your build." /></Block>
        <Block>
          <div style={{ maxWidth: 600, margin: '0 auto' }}>
            <NewProjectForm categories={TRACKS} onSubmit={handleNewProject} onCancel={projects.length > 0 ? () => setIsCreatingProject(false) : handleSignOut} />
          </div>
        </Block>
      </Wrap>
    );
  }

  const rawWb = project.workbenchData || project;
  const wb = {
    ...rawWb,
    name: rawWb.name || project.title || '',
    category: rawWb.category || (project.tags && project.tags[0]) || 'Other',
    goal: rawWb.goal || project.description || '',
    start: rawWb.start || project.createdAt || Date.now(),
    stage: typeof rawWb.stage === 'number' ? rawWb.stage : (Number(project.stage) || 0),
    tasks: rawWb.tasks || [],
    entries: rawWb.entries || [],
    parts: rawWb.parts || [],
    tests: rawWb.tests || [],
    checks: rawWb.checks || [],
    pitch: rawWb.pitch || {},
  };

  const myRole = project.myRole || 'Lead';
  const isLead = myRole === 'Lead';
  const teamNames = project.members?.map((m: any) => m.student.name) || [];

  const health = calculateHealth(wb, now.getTime());
  const daysLeft = Math.max(0, Math.ceil((new Date('2026-12-03T17:00:00+01:00').getTime() - now.getTime()) / DAY));
  const tasksLeft = wb.tasks.filter((t: Task) => t.col !== 'done').length;
  const blockers = wb.entries.filter((e: TimelineEntry) => e.type === 'blocker' && !e.resolved).length;

  const exportData = {
    name: wb.name, track: wb.category, goal: wb.goal, team: teamNames,
    pitch: { pitch: wb.pitch.pitch || '', problem: wb.pitch.problem || '', works: wb.pitch.solution || '', broken: wb.pitch.status || '', ask: wb.pitch.ask || '' },
    milestones: wb.entries.filter((e:any) => e.type === 'milestone').map((e:any) => ({ title: e.title, date: new Date(e.ts).toLocaleDateString() })),
    tests: wb.tests.map((t:any) => ({ name: t.name, type: t.type, result: t.pass ? 'Pass' : 'Fail' })),
    parts: wb.parts.map((p:any) => ({ name: p.name, qty: p.qty, status: p.status }))
  };

  const handleSubmitProject = () => {
    if (wb.stage < 5) {
      showToast("You must reach the 'Demo' stage before submitting.", 'error');
      return;
    }
    const newEntry = { 
      id: Date.now().toString(), ts: Date.now(), type: 'milestone', 
      title: 'Project Submitted for Showcase', text: 'Submitted for review.'
    };
    updateWb({ entries: [newEntry, ...wb.entries] });
    showToast('Project submitted successfully!');
  };

  const autoLog = (title: string, type: any = 'log') => {
    const entry = { id: Date.now().toString() + Math.random(), ts: Date.now(), type, title };
    return [entry, ...wb.entries];
  };

  const updateWb = (updates: any) => {
    setProjects(prev => prev.map(p => p.id === project.id ? { ...p, workbenchData: { ...wb, ...updates } } : p));
  };

  const TABS: { id: Tab, label: string }[] = [
    { id: 'overview', label: 'Overview' }, { id: 'team', label: 'Team' },
    { id: 'timeline', label: 'Timeline' }, { id: 'tasks', label: 'Tasks' }, 
    { id: 'parts', label: 'Parts' }, { id: 'tests', label: 'Tests' }, { id: 'demo', label: 'Demo' },
  ];

  const joinUrl = `${window.location.origin}/workbench?join=${project.id || ''}`;

  return (
    <Wrap>
      <Block>
        {/* Project Library Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 'var(--sp-3)', marginBottom: 'var(--sp-4)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)', flex: 1 }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: 'var(--fs-sm)', color: 'var(--muted)', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>Project Library</span>
              <div style={{ minWidth: '250px' }}>
                <Select 
                  options={projects.map(p => ({ value: p.id, label: p.title || p.name || 'Untitled Project' }))}
                  value={activeProjectId || ''} 
                  onChange={(v) => setActiveProjectId(v)}
                />
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 'var(--sp-2)', paddingBottom: '2px' }}>
            <Button onClick={() => setIsCreatingProject(true)}>+ New Project</Button>
            <Button variant="default" className="btn-danger" onClick={() => confirmDelete(deleteProject)}>Delete</Button>
            <Button variant="default" onClick={handleSignOut}>Sign out</Button>
          </div>
        </div>

        <PageHeader kicker={content.pages.workbench.kicker} title={wb.name} lede={`Track: ${wb.category} · Signed in as ${student?.name} (${myRole})`} />
      </Block>

      <Block>
        <Window title="Project Stages">
          <StageTracker current={wb.stage} />
          <Row className="wb-stage-actions">
            <Button size="sm" onClick={() => updateWb({ stage: Math.max(0, wb.stage - 1) })}>← Back</Button>
            <Button size="sm" variant="primary" onClick={() => updateWb({ stage: Math.min(5, wb.stage + 1) })}>Next Stage →</Button>
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
          <div className="wb-span-full"><Window title="Activity"><ActivityHeatmap counts={heatmapCounts} /></Window></div>
        </div>
      )}

      {tab === 'team' && (
        <Window title="Project Team" meta={isLead ? "You are the Lead" : "View only"}>
          <div style={{ display: 'grid', gap: 'var(--sp-4)' }}>
            <div style={{ background: 'var(--panel-2)', padding: 'var(--sp-3)', borderRadius: '4px' }}>
              <h4 style={{ margin: '0 0 var(--sp-2)' }}>Invite Link</h4>
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
                        <TextInput value={m.role} onChange={(val: string) => {
                          const newMembers = project.members.map((x: any) => x.id === m.id ? { ...x, role: val } : x);
                          setProjects(prev => prev.map(p => p.id === project.id ? { ...p, members: newMembers } : p));
                        }} />
                        <Button variant="default" className="btn-danger" onClick={() => confirmDelete(() => {
                          const newMembers = project.members.filter((x: any) => x.id !== m.id);
                          setProjects(prev => prev.map(p => p.id === project.id ? { ...p, members: newMembers } : p));
                        })}>Remove</Button>
                      </>
                    ) : <span style={{ fontWeight: 'bold', padding: '0 var(--sp-2)' }}>{m.role}</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Window>
      )}

      {tab === 'timeline' && (
        <div className="wb-grid"><div className="wb-span-full">
          <EntryForm onSubmit={(data) => {
            const entry = { id: Date.now().toString(), ts: Date.now(), ...data };
            updateWb({ entries: [entry, ...wb.entries] });
          }} />
          <div style={{ marginTop: 'var(--sp-4)' }}>
            <Timeline entries={wb.entries} filter={timelineFilter} onFilterChange={setTimelineFilter} projectStart={wb.start} now={now.getTime()}
              onResolveBlocker={(id) => updateWb({ entries: wb.entries.map((e: any) => e.id === id ? { ...e, resolved: !e.resolved } : e) })}
              onDeleteEntry={(id) => confirmDelete(() => updateWb({ entries: wb.entries.filter((e: any) => e.id !== id) }))}
            />
          </div>
        </div></div>
      )}

      {tab === 'tasks' && (
        <div className="wb-grid"><div className="wb-span-full">
          <Window title="Add task"><TaskForm team={teamNames} onSubmit={(d) => updateWb({ tasks: [...wb.tasks, { id: Date.now().toString(), title: d.title, who: d.who, col: 'todo' }] })} /></Window>
          <div style={{ marginTop: 'var(--sp-4)' }}>
            <TaskBoard tasks={wb.tasks} team={teamNames}
              onMove={(id, dir) => {
                const cols = ['todo', 'doing', 'done'];
                updateWb({ tasks: wb.tasks.map((t: any) => {
                  if (t.id !== id) return t;
                  const idx = cols.indexOf(t.col) + dir;
                  return idx >= 0 && idx <= 2 ? { ...t, col: cols[idx] } : t;
                })});
              }}
              onDelete={(id) => confirmDelete(() => updateWb({ tasks: wb.tasks.filter((t: any) => t.id !== id) }))}
            />
          </div>
        </div></div>
      )}

      {tab === 'parts' && (
        <Window title="Parts & Budget">
           <PartForm onSubmit={(d) => {
             const cleanQty = Number(d.qty.replace(/,/g, ''));
             const cleanCost = Number(d.cost.replace(/,/g, ''));
             const newPart = { id: Date.now().toString(), name: d.name, qty: cleanQty || 0, cost: cleanCost || 0, status: d.status };
             updateWb({ parts: [...wb.parts, newPart], entries: autoLog(`Added part: ${d.name} (x${cleanQty})`) });
           }} />
           <PartsPanel parts={wb.parts} budget={30000} onDelete={(id) => confirmDelete(() => updateWb({ parts: wb.parts.filter((p: any) => p.id !== id) }))} />
        </Window>
      )}

      {tab === 'tests' && (
        <Window title="Test Log">
           <TestForm onSubmit={(d) => {
             if (d.type === 'numeric') {
               const exp = Number(d.exp.replace(/,/g, '')); const meas = Number(d.meas.replace(/,/g, '')); const tol = Number(d.tol.replace(/,/g, ''));
               const { err, pass } = calculateTestResult(exp, meas, tol);
               const newTest = { id: Date.now().toString(), name: d.name, type: 'numeric', exp, meas, unit: d.unit, tol, err, pass };
               updateWb({ tests: [...wb.tests, newTest], entries: autoLog(`Logged test: ${d.name} - ${pass ? 'Passed' : 'Failed'}`, 'test') });
             } else {
               const isPass = d.pass === 'Pass';
               const newTest = { id: Date.now().toString(), name: d.name, type: 'qualitative', pass: isPass, expectedText: 'Qualitative check' };
               updateWb({ tests: [...wb.tests, newTest], entries: autoLog(`Logged test: ${d.name} - ${isPass ? 'Passed' : 'Failed'}`, 'test') });
             }
           }} />
           <TestsPanel tests={wb.tests} onDelete={(id) => confirmDelete(() => updateWb({ tests: wb.tests.filter((t: any) => t.id !== id) }))} />
        </Window>
      )}

      {tab === 'demo' && (
        <div className="wb-grid">
           <div className="wb-span-full"><Window title="Checklist"><DemoChecklist checks={wb.checks} onToggle={(id) => updateWb({ checks: wb.checks.map((c: any) => c.id === id ? { ...c, checked: !c.checked } : c) })} onAdd={(label) => updateWb({ checks: [...wb.checks, { id: Date.now().toString(), label, checked: false }] })} onDelete={(id) => confirmDelete(() => updateWb({ checks: wb.checks.filter((c: any) => c.id !== id) }))} /></Window></div>
           <div className="wb-span-full"><Window title="Pitch Editor"><PitchEditor value={wb.pitch} onChange={(f, v) => updateWb({ pitch: { ...wb.pitch, [f]: v } })} /></Window></div>
           
           <div className="wb-span-full">
             <Window title="Submit to Showcase" tone="gray">
               <p style={{ fontFamily: 'var(--font)', marginBottom: 'var(--sp-4)' }}>Ready to go public? Once you submit, We'll review your project and add it to the public Projects page.</p>
               <Button variant="primary" onClick={handleSubmitProject}>Submit Project for Review →</Button>
             </Window>
           </div>

           <div className="wb-span-full">
             <Window title="Export Backup">
               <p style={{ fontFamily: 'var(--font)', fontSize: 'var(--fs-sm)', color: 'var(--muted)', marginBottom: 'var(--sp-3)' }}>Download a markdown copy of your pitch and timeline in case you need it offline.</p>
               <ExportPanel exportData={buildReport(exportData)} onCopy={() => navigator.clipboard.writeText(buildReport(exportData))} />
             </Window>
           </div>
        </div>
      )}

      <ConfirmDialog open={modal.open} title="Confirm Action" body="Are you sure you want to delete this?" confirmLabel="Delete" type="confirm" onCancel={() => setModal({ open: false })} onConfirm={() => { modal.action?.(); setModal({ open: false }); }} />
      
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </Wrap>
  );
}