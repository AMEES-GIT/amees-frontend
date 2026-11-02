import { useState, useEffect } from 'react';
import { AdminShell } from '../components/admin/AdminShell';
import { SaveStatus, type SaveState } from '../components/admin/SaveStatus';
import { Window } from '../components/containers/Window';
import { ConfirmDialog } from '../components/containers/ConfirmDialog';
import { Field } from '../components/primitives/Field';
import { TextInput } from '../components/primitives/TextInput';
import { Textarea } from '../components/primitives/Textarea';
import { Button } from '../components/primitives/Button';
import { Badge } from '../components/primitives/Badge';
import { useContent, useUpdateContent } from '../content/contentProvider';
import type { CalendarEntry, WeeklyItem, ExecutiveMember } from '../content/types';
import './AdminPage.css';

type AdminTab = 'event' | 'calendar' | 'weekly' | 'executives' | 'projects' | 'general';

export function AdminPage() {
  const content = useContent();
  const updateContent = useUpdateContent();
  
  const [tab, setTab] = useState<AdminTab>('event');
  const [status, setStatus] = useState<SaveState>('saved');

  // Unified Confirm Dialog State
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    title: string;
    body: string;
    action: () => void;
    type: 'confirm' | 'success' | 'info' | 'error';
    confirmLabel: string;
  }>({ open: false, title: '', body: '', action: () => {}, type: 'confirm', confirmLabel: 'Confirm' });

  // --- Form States ---
  const [newCalDate, setNewCalDate] = useState('');
  const [newCalTitle, setNewCalTitle] = useState('');
  
  const [newWeekTitle, setNewWeekTitle] = useState('');
  const [newWeekText, setNewWeekText] = useState('');
  const [newWeekDay, setNewWeekDay] = useState('2'); 
  
  // LinkedIn added, bio removed
  const [newExec, setNewExec] = useState<ExecutiveMember>({ role: '', name: '', linkedin: '', photoUrl: '' });

  useEffect(() => {
    const token = localStorage.getItem('amees_admin_token');
    if (!token) window.location.hash = 'login';
  }, []);

  const handleSave = () => {
    setStatus('saving');
    setTimeout(() => setStatus('saved'), 800);
  };

  const nav = [
    { id: 'event', label: 'Featured Event' },
    { id: 'calendar', label: 'One-off Dates' },
    { id: 'weekly', label: 'Weekly Rhythm' },
    { id: 'executives', label: 'Executives' },
    { id: 'projects', label: 'Projects' },
    { id: 'general', label: 'Site Settings' },
  ];

  // --- Handlers ---
  const updateFeatured = (key: string, val: any) => {
    updateContent({ featured: { ...content.featured, [key]: val } });
    handleSave();
  };

  // Calendar
  const confirmAddCalendar = () => {
    if (!newCalDate || !newCalTitle) return;
    setConfirmDialog({
      open: true,
      title: 'Add Calendar Date',
      body: `Add "${newCalTitle}" on ${newCalDate}?`,
      type: 'success',
      confirmLabel: 'Add Date',
      action: () => {
        const newEntry: CalendarEntry = { id: Date.now().toString(), day: newCalDate, title: newCalTitle, type: 'special' };
        updateContent({ calendarEntries: [...content.calendarEntries, newEntry] });
        setNewCalDate(''); setNewCalTitle('');
        handleSave();
      }
    });
  };
  const confirmDeleteCalendar = (id: string, title: string) => {
    setConfirmDialog({
      open: true,
      title: 'Delete Date',
      body: `Are you sure you want to remove "${title}" from the calendar?`,
      type: 'confirm',
      confirmLabel: 'Delete',
      action: () => {
        updateContent({ calendarEntries: content.calendarEntries.filter(c => c.id !== id) });
        handleSave();
      }
    });
  };

  // Weekly
  const confirmAddWeekly = () => {
    if (!newWeekTitle || !newWeekText) return;
    setConfirmDialog({
      open: true,
      title: 'Add Recurring Item',
      body: `Add "${newWeekTitle}" to the weekly rhythm?`,
      type: 'success',
      confirmLabel: 'Add Item',
      action: () => {
        const item: WeeklyItem = {
          id: Date.now().toString(),
          title: newWeekTitle,
          text: newWeekText,
          weekday: Number(newWeekDay) === -1 ? undefined : Number(newWeekDay),
          label: Number(newWeekDay) === -1 ? 'Wk' : undefined,
        };
        updateContent({ weekly: [...content.weekly, item] });
        setNewWeekTitle(''); setNewWeekText('');
        handleSave();
      }
    });
  };
  const confirmDeleteWeekly = (id: string, title: string) => {
    setConfirmDialog({
      open: true,
      title: 'Delete Recurring Item',
      body: `Are you sure you want to remove "${title}"?`,
      type: 'confirm',
      confirmLabel: 'Delete',
      action: () => {
        updateContent({ weekly: content.weekly.filter(w => w.id !== id) });
        handleSave();
      }
    });
  };

  // Executives
  const confirmAddExecutive = () => {
    if (!newExec.role || !newExec.name) return;
    setConfirmDialog({
      open: true,
      title: 'Add Executive',
      body: `Add ${newExec.name} as ${newExec.role}?`,
      type: 'success',
      confirmLabel: 'Add Executive',
      action: () => {
        updateContent({ about: { ...content.about, executive: [...content.about.executive, newExec] } });
        setNewExec({ role: '', name: '', linkedin: '', photoUrl: '' });
        handleSave();
      }
    });
  };
  const confirmDeleteExecutive = (index: number, name: string) => {
    setConfirmDialog({
      open: true,
      title: 'Remove Executive',
      body: `Are you sure you want to remove ${name} from the executive team?`,
      type: 'confirm',
      confirmLabel: 'Remove',
      action: () => {
        const newList = [...content.about.executive];
        newList.splice(index, 1);
        updateContent({ about: { ...content.about, executive: newList } });
        handleSave();
      }
    });
  };

  // Projects (Showcase)
  const confirmToggleProject = (id: string, title: string, currentStatus: boolean) => {
    setConfirmDialog({
      open: true,
      title: currentStatus ? 'Hide Project' : 'Showcase Project',
      body: `Are you sure you want to ${currentStatus ? 'hide' : 'showcase'} "${title}" on the home page?`,
      type: currentStatus ? 'confirm' : 'success',
      confirmLabel: currentStatus ? 'Hide' : 'Showcase',
      action: () => {
        const updatedProjects = content.projects.projects.map(p => 
          p.id === id ? { ...p, showcased: !p.showcased } : p
        );
        updateContent({ projects: { ...content.projects, projects: updatedProjects } });
        handleSave();
      }
    });
  };

  const DAYS = [
    { label: 'Every Monday', value: 1 }, { label: 'Every Tuesday', value: 2 },
    { label: 'Every Wednesday', value: 3 }, { label: 'Every Thursday', value: 4 },
    { label: 'Every Friday', value: 5 }, { label: 'Every Saturday', value: 6 },
    { label: 'Every Sunday', value: 0 }, { label: 'Not a specific day (e.g. Weekly)', value: -1 }
  ];

  return (
    <div style={{ padding: 'var(--sp-4) 0' }}>
      <AdminShell
        role="Editor"
        user={localStorage.getItem('amees_admin_token') || 'Admin'}
        nav={nav}
        current={tab}
        onNav={(id) => setTab(id as AdminTab)}
        saveStatus={<SaveStatus status={status} at={new Date().toLocaleTimeString()} />}
      >
        <Window title={nav.find(n => n.id === tab)?.label || 'Settings'} meta="Auto-saves on change">
          
          {tab === 'event' && (
            <div className="admin-form-grid">
              <Field label="Event Title"><TextInput value={content.featured.title} onChange={v => updateFeatured('title', v)} /></Field>
              <Field label="Theme"><TextInput value={content.featured.theme} onChange={v => updateFeatured('theme', v)} /></Field>
              <Field label="Subtitle"><TextInput value={content.featured.subtitle} onChange={v => updateFeatured('subtitle', v)} /></Field>
              <Field label="Venue"><TextInput value={content.featured.venue} onChange={v => updateFeatured('venue', v)} /></Field>
            </div>
          )}

          {tab === 'calendar' && (
            <div style={{ display: 'grid', gap: 'var(--sp-6)' }}>
              <div style={{ background: 'var(--panel-2)', padding: 'var(--sp-4)', border: 'var(--bw-sm) solid var(--line)' }}>
                <h3 style={{ margin: '0 0 var(--sp-3) 0', fontFamily: 'var(--font)', textTransform: 'uppercase' }}>Add One-off Event</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(140px, 1fr) minmax(250px, 2fr) auto', gap: 'var(--sp-3)', alignItems: 'end' }}>
                  <Field label="Date"><TextInput type="text" value={newCalDate} onChange={setNewCalDate} placeholder="YYYY-MM-DD" /></Field>
                  <Field label="Event Title"><TextInput type="text" value={newCalTitle} onChange={setNewCalTitle} placeholder="Hackathon Finals" /></Field>
                  <Button variant="primary" onClick={confirmAddCalendar}>Add</Button>
                </div>
              </div>
              <div>
                <h3 style={{ margin: '0 0 var(--sp-3) 0', fontFamily: 'var(--font)', textTransform: 'uppercase' }}>Existing Dates</h3>
                {content.calendarEntries.length === 0 ? <p style={{ color: 'var(--muted)' }}>No one-off events.</p> : 
                  content.calendarEntries.map(entry => (
                    <div key={entry.id} className="admin-list-item">
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)' }}>
                        <Badge tone="info" kind="tag">{entry.day}</Badge>
                        <span style={{ fontWeight: 'bold' }}>{entry.title}</span>
                      </div>
                      <Button size="sm" variant="default" onClick={() => confirmDeleteCalendar(entry.id, entry.title)}>Delete</Button>
                    </div>
                  ))
                }
              </div>
            </div>
          )}

          {tab === 'weekly' && (
            <div style={{ display: 'grid', gap: 'var(--sp-6)' }}>
              <div style={{ background: 'var(--panel-2)', padding: 'var(--sp-4)', border: 'var(--bw-sm) solid var(--line)' }}>
                <h3 style={{ margin: '0 0 var(--sp-3) 0', fontFamily: 'var(--font)', textTransform: 'uppercase' }}>Add Recurring Item</h3>
                <div style={{ display: 'grid', gap: 'var(--sp-3)' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--sp-3)' }}>
                    <Field label="Title"><TextInput type="text" value={newWeekTitle} onChange={setNewWeekTitle} placeholder="Trivia Tuesday" /></Field>
                    <Field label="Schedule">
                      <select className="amees-input" value={newWeekDay} onChange={e => setNewWeekDay(e.target.value)}>
                        {DAYS.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
                      </select>
                    </Field>
                  </div>
                  <Field label="Short Description"><TextInput type="text" value={newWeekText} onChange={setNewWeekText} placeholder="Quick-fire engineering questions" /></Field>
                  <div>
                    <Button variant="primary" onClick={confirmAddWeekly}>Add Recurring Item</Button>
                  </div>
                </div>
              </div>
              <div>
                <h3 style={{ margin: '0 0 var(--sp-3) 0', fontFamily: 'var(--font)', textTransform: 'uppercase' }}>Current Rhythm</h3>
                {content.weekly.map(item => (
                  <div key={item.id} className="admin-list-item">
                    <div>
                      <div style={{ fontWeight: 'bold' }}>{item.title}</div>
                      <div style={{ fontSize: 'var(--fs-sm)', color: 'var(--muted)' }}>
                        {item.weekday !== undefined ? DAYS.find(d => d.value === item.weekday)?.label : item.label} · {item.text}
                      </div>
                    </div>
                    <Button size="sm" variant="default" onClick={() => confirmDeleteWeekly(item.id, item.title)}>Delete</Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === 'executives' && (
            <div style={{ display: 'grid', gap: 'var(--sp-6)' }}>
              <div style={{ background: 'var(--panel-2)', padding: 'var(--sp-4)', border: 'var(--bw-sm) solid var(--line)' }}>
                <h3 style={{ margin: '0 0 var(--sp-3) 0', fontFamily: 'var(--font)', textTransform: 'uppercase' }}>Add Executive</h3>
                <div style={{ display: 'grid', gap: 'var(--sp-3)' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--sp-3)' }}>
                    <Field label="Role"><TextInput type="text" value={newExec.role} onChange={v => setNewExec({...newExec, role: v})} placeholder="President" /></Field>
                    <Field label="Full Name"><TextInput type="text" value={newExec.name} onChange={v => setNewExec({...newExec, name: v})} placeholder="John Doe" /></Field>
                  </div>
                  <Field label="Photo URL (Optional)"><TextInput type="text" value={newExec.photoUrl || ''} onChange={v => setNewExec({...newExec, photoUrl: v})} placeholder="https://..." /></Field>
                  <Field label="LinkedIn URL (Optional)">
                    <TextInput type="text" value={newExec.linkedin || ''} onChange={v => setNewExec({...newExec, linkedin: v})} placeholder="https://linkedin.com/in/..." />
                  </Field>
                  <div>
                    <Button variant="primary" onClick={confirmAddExecutive}>Add Executive</Button>
                  </div>
                </div>
              </div>
              <div>
                <h3 style={{ margin: '0 0 var(--sp-3) 0', fontFamily: 'var(--font)', textTransform: 'uppercase' }}>Current Team</h3>
                {content.about.executive.map((exec, i) => (
                  <div key={i} className="admin-list-item">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)' }}>
                      <Badge tone="neutral" kind="tag">{exec.role}</Badge>
                      <span style={{ fontWeight: 'bold' }}>{exec.name}</span>
                    </div>
                    <Button size="sm" variant="default" onClick={() => confirmDeleteExecutive(i, exec.name)}>Remove</Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === 'projects' && (
            <div>
              <p style={{ marginTop: 0, color: 'var(--muted)', marginBottom: 'var(--sp-4)' }}>
                Select which projects appear in the Showcase Marquee on the home page.
              </p>
              <div style={{ display: 'grid', gap: 'var(--sp-3)' }}>
                {content.projects.projects.map(project => (
                  <div key={project.id} className="admin-list-item">
                    <div>
                      <div style={{ fontWeight: 'bold', fontSize: 'var(--fs-lg)' }}>{project.title}</div>
                      <div style={{ fontSize: 'var(--fs-sm)', color: 'var(--muted)' }}>By {project.builder} · {project.stage}</div>
                    </div>
                    <Button 
                      pressed={project.showcased} 
                      onClick={() => confirmToggleProject(project.id, project.title, project.showcased)}
                      className={project.showcased ? 'btn-success' : ''}
                    >
                      {project.showcased ? 'Showcased' : 'Hidden'}
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === 'general' && (
            <div className="admin-form-grid">
              <Field label="Home Page Marquee Mode">
                <select className="amees-input" value={content.activeMarquee} onChange={(e) => { updateContent({ activeMarquee: e.target.value as 'caution' | 'showcase' }); handleSave(); }}>
                  <option value="caution">Caution Tape (Wired Countdown)</option>
                  <option value="showcase">Showcase Marquee (Student Projects)</option>
                </select>
              </Field>
              <Field label="Footer Tagline">
                <Textarea value={content.footer.tagline} onChange={(v) => { updateContent({ footer: { ...content.footer, tagline: v } }); handleSave(); }} />
              </Field>
            </div>
          )}

        </Window>
      </AdminShell>

      <ConfirmDialog
        open={confirmDialog.open}
        title={confirmDialog.title}
        body={confirmDialog.body}
        confirmLabel={confirmDialog.confirmLabel}
        type={confirmDialog.type}
        onCancel={() => setConfirmDialog(prev => ({ ...prev, open: false }))}
        onConfirm={() => {
          confirmDialog.action();
          setConfirmDialog(prev => ({ ...prev, open: false }));
        }}
      />
    </div>
  );
}