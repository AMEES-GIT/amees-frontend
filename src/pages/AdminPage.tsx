import { useState, useEffect } from 'react';
import { AdminShell } from '../components/admin/AdminShell';
import { SaveStatus, type SaveState } from '../components/admin/SaveStatus';
import { Window } from '../components/containers/Window';
import { ConfirmDialog } from '../components/containers/ConfirmDialog';
import { Toast } from '../components/shell/Toast';
import { Field } from '../components/primitives/Field';
import { TextInput } from '../components/primitives/TextInput';
import { Textarea } from '../components/primitives/Textarea';
import { Button } from '../components/primitives/Button';
import { Badge } from '../components/primitives/Badge';
import { Select } from '../components/primitives/Select';
import { useContent, useRefreshContent } from '../content/contentProvider';
import type { FeaturedEvent, ExecutiveMember, Opportunity } from '../content/types';
import { getValidToken, getAdminEmail, getAdminRole, clearToken } from '../lib/authToken';
import { API_BASE } from '../lib/apiBase';
import './AdminPage.css';

type AdminTab = 'event' | 'events' | 'executives' | 'projects' | 'partners' | 'opportunities' | 'archive' | 'general' | 'students';
const API_URL = `${API_BASE}/api/admin`;

async function adminFetch(path: string, options: RequestInit = {}): Promise<Response> {
  const token = getValidToken();
  if (!token) {
    window.location.hash = 'login';
    throw new Error('No token');
  }
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...(options.headers ?? {}), Authorization: `Bearer ${token}` },
  });
  if (res.status === 401) {
    clearToken();
    window.location.hash = 'login';
    throw new Error('Session expired');
  }
  return res;
}

export function AdminPage() {
  const content = useContent();
  const refresh = useRefreshContent();

  const [tab, setTab] = useState<AdminTab>('event');
  const [status, setStatus] = useState<SaveState>('saved');
  
  // Toast State
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const showToast = (message: string, type: 'success' | 'error' = 'success') => setToast({ message, type });

  const [confirmDialog, setConfirmDialog] = useState<{ open: boolean; title: string; body: string; action: () => void; type: 'confirm' | 'success' | 'info' | 'error'; confirmLabel: string; }>({
    open: false, title: '', body: '', action: () => {}, type: 'confirm', confirmLabel: 'Confirm',
  });

  const [formData, setFormData] = useState<FeaturedEvent>(content.featured);
  
  // States for Events/Calendar
  const [newCalDate, setNewCalDate] = useState('');
  const [newCalTitle, setNewCalTitle] = useState('');
  const [newCalDesc, setNewCalDesc] = useState('');
  const [editingCalId, setEditingCalId] = useState<string | null>(null);

  // States for Weekly Rhythm
  const [newWeekTitle, setNewWeekTitle] = useState('');
  const [newWeekText, setNewWeekText] = useState('');
  const [newWeekDay, setNewWeekDay] = useState('2');
  const [editingWeekId, setEditingWeekId] = useState<string | null>(null);

  // States for Executives
  const [newExec, setNewExec] = useState<Omit<ExecutiveMember, 'id'>>({ role: '', name: '', linkedin: '', photoUrl: '' });
  const [editingExecId, setEditingExecId] = useState<string | null>(null);

  // States for Partners
  const [newPartner, setNewPartner] = useState({ name: '', type: 'Sponsor' as 'Sponsor' | 'Partner', tier: '', logoUrl: '', websiteUrl: '' });
  const [editingPartnerId, setEditingPartnerId] = useState<string | null>(null);

  // States for Archive
  const [newArchive, setNewArchive] = useState({ title: '', course: '', level: '100', year: String(new Date().getFullYear()), kind: 'PDF', fileUrl: '' });
  const [editingArchiveId, setEditingArchiveId] = useState<string | null>(null);
  
  // States for Opportunities
  const [newOpp, setNewOpp] = useState({ name: '', type: 'IT', description: '', externalLink: '', startDate: '', endDate: '', tags: '' });
  const [editingOppId, setEditingOppId] = useState<string | null>(null);

  // States for Students
  const [newStudent, setNewStudent] = useState({ name: '', matric: '', email: '', level: '100' });
  const [csvText, setCsvText] = useState('');
  const [studentSearch, setStudentSearch] = useState('');
  const [studentList, setStudentList] = useState<any[]>([]);

  const [marqueeMode, setMarqueeMode] = useState(content.activeMarquee || 'caution');
  const [footerTagline, setFooterTagline] = useState(content.footer.tagline);
  const [membershipFormUrl, setMembershipFormUrl] = useState(content.membershipFormUrl || '');
  const [projectSubmissionUrl, setProjectSubmissionUrl] = useState(content.projectSubmissionUrl || '');
  const [eventRegistrationFormUrl, setEventRegistrationFormUrl] = useState(content.eventRegistrationFormUrl || '');
  const [eventRegistrationEventFieldId, setEventRegistrationEventFieldId] = useState(content.eventRegistrationEventFieldId || '');

  useEffect(() => {
    setFormData(content.featured);
    setMarqueeMode(content.activeMarquee || 'caution');
    setFooterTagline(content.footer.tagline);
    setMembershipFormUrl(content.membershipFormUrl || '');
    setProjectSubmissionUrl(content.projectSubmissionUrl || '');
    setEventRegistrationFormUrl(content.eventRegistrationFormUrl || '');
    setEventRegistrationEventFieldId(content.eventRegistrationEventFieldId || '');
  }, [content]);

  useEffect(() => {
    if (!getValidToken()) window.location.hash = 'login';
  }, []);

  // Fetch students on tab change
  useEffect(() => {
    if (tab === 'students') searchStudents('');
  }, [tab]);

  const searchStudents = async (q: string) => {
    setStudentSearch(q);
    try {
      const res = await adminFetch(`/students?q=${encodeURIComponent(q)}`);
      if (res.ok) {
        const data = await res.json();
        setStudentList(data);
      }
    } catch {}
  };

  const nav = [
    { id: 'event', label: 'Featured Event' }, 
    { id: 'events', label: 'Events & Calendar' }, 
    { id: 'executives', label: 'Executives' },
    { id: 'projects', label: 'Projects' }, 
    { id: 'partners', label: 'Sponsors' },
    { id: 'opportunities', label: 'Opportunities' }, 
    { id: 'students', label: 'Students' }, 
    { id: 'archive', label: 'Archive links' },
    { id: 'general', label: 'Site Settings' },
  ];

  const saveEvent = async () => { setStatus('saving'); try { const res = await adminFetch('/event', { method: 'PUT', body: JSON.stringify(formData) }); if (res.ok) { setStatus('saved'); refresh(); showToast('Event saved'); } else setStatus('error'); } catch { setStatus('error'); } };
  const saveSettings = async () => { setStatus('saving'); try { const res = await adminFetch('/settings', { method: 'PUT', body: JSON.stringify({ activeMarquee: marqueeMode, footer: { ...content.footer, tagline: footerTagline }, membershipFormUrl, projectSubmissionUrl, eventRegistrationFormUrl, eventRegistrationEventFieldId }) }); if (res.ok) { setStatus('saved'); refresh(); showToast('Settings saved'); } else setStatus('error'); } catch { setStatus('error'); } };
  
  // --- EVENTS & CALENDAR ---
  const saveCalendarEntry = async () => {
    const payload = { title: newCalTitle, description: newCalDesc, type: 'special' };
    try {
      const url = editingCalId ? `/calendar/${editingCalId}` : '/calendar';
      const method = editingCalId ? 'PUT' : 'POST';
      const body = editingCalId ? payload : { ...payload, day: newCalDate };
      
      const res = await adminFetch(url, { method, body: JSON.stringify(body) });
      if (res.ok) {
        refresh();
        setNewCalDate(''); setNewCalTitle(''); setNewCalDesc(''); setEditingCalId(null);
        showToast('Calendar event saved');
      }
    } catch {}
  };
  const startEditCal = (e: any) => { setEditingCalId(e.id); setNewCalTitle(e.title); setNewCalDesc(e.description || ''); setNewCalDate(e.day); window.scrollTo(0,0); };
  const deleteCalendarEntry = async (id: string) => { try { const res = await adminFetch(`/calendar/${id}`, { method: 'DELETE' }); if (res.ok) { refresh(); showToast('Event deleted'); } } catch {} };

  const saveWeeklyItem = async () => {
    const payload = { title: newWeekTitle, text: newWeekText, weekday: Number(newWeekDay) === -1 ? null : Number(newWeekDay) };
    try {
      const url = editingWeekId ? `/weekly/${editingWeekId}` : '/weekly';
      const method = editingWeekId ? 'PUT' : 'POST';
      const res = await adminFetch(url, { method, body: JSON.stringify(payload) });
      if (res.ok) {
        refresh();
        setNewWeekTitle(''); setNewWeekText(''); setNewWeekDay('2'); setEditingWeekId(null);
        showToast('Recurring item saved');
      }
    } catch {}
  };
  const startEditWeek = (w: any) => { setEditingWeekId(w.id); setNewWeekTitle(w.title); setNewWeekText(w.text); setNewWeekDay(String(w.weekday ?? -1)); window.scrollTo(0,0); };
  const deleteWeeklyItem = async (id: string) => { try { const res = await adminFetch(`/weekly/${id}`, { method: 'DELETE' }); if (res.ok) { refresh(); showToast('Item deleted'); } } catch {} };

  // --- EXECUTIVES ---
  const saveExecutive = async () => {
    try {
      const url = editingExecId ? `/executives/${editingExecId}` : '/executives';
      const method = editingExecId ? 'PUT' : 'POST';
      const body = editingExecId ? newExec : { ...newExec, order: content.about.executive.length };
      const res = await adminFetch(url, { method, body: JSON.stringify(body) });
      if (res.ok) {
        refresh();
        setNewExec({ role: '', name: '', linkedin: '', photoUrl: '' }); setEditingExecId(null);
        showToast('Executive saved');
      }
    } catch {}
  };
  const startEditExec = (e: any) => { setEditingExecId(e.id); setNewExec({ role: e.role, name: e.name, linkedin: e.linkedin || '', photoUrl: e.photoUrl || '' }); window.scrollTo(0,0); };
  const deleteExecutive = async (id: string) => { try { const res = await adminFetch(`/executives/${id}`, { method: 'DELETE' }); if (res.ok) { refresh(); showToast('Executive removed'); } } catch {} };

  // --- PARTNERS ---
  const savePartner = async () => {
    try {
      const url = editingPartnerId ? `/partners/${editingPartnerId}` : '/partners';
      const method = editingPartnerId ? 'PUT' : 'POST';
      const body = editingPartnerId ? newPartner : { ...newPartner, order: content.partners.length };
      const res = await adminFetch(url, { method, body: JSON.stringify(body) });
      if (res.ok) {
        refresh();
        setNewPartner({ name: '', type: 'Sponsor', tier: '', logoUrl: '', websiteUrl: '' }); setEditingPartnerId(null);
        showToast('Sponsor saved');
      }
    } catch {}
  };
  const startEditPartner = (p: any) => { setEditingPartnerId(p.id); setNewPartner({ name: p.name, type: p.type, tier: p.tier || '', logoUrl: p.logoUrl || '', websiteUrl: p.websiteUrl || '' }); window.scrollTo(0,0); };
  const deletePartner = async (id: string) => { try { const res = await adminFetch(`/partners/${id}`, { method: 'DELETE' }); if (res.ok) { refresh(); showToast('Sponsor removed'); } } catch {} };

  // --- ARCHIVE ---
  const saveArchiveFile = async () => {
    try {
      const url = editingArchiveId ? `/archive-files/${editingArchiveId}` : '/archive-files';
      const method = editingArchiveId ? 'PUT' : 'POST';
      const res = await adminFetch(url, { method, body: JSON.stringify(newArchive) });
      if (res.ok) {
        refresh();
        setNewArchive({ title: '', course: '', level: '100', year: String(new Date().getFullYear()), kind: 'PDF', fileUrl: '' }); setEditingArchiveId(null);
        showToast('Archive link saved');
      }
    } catch {}
  };
  const startEditArchive = (f: any) => { setEditingArchiveId(f.id); setNewArchive({ title: f.title, course: f.course, level: String(f.level), year: String(f.year), kind: f.kind, fileUrl: f.fileUrl || '' }); window.scrollTo(0,0); };
  const deleteArchiveFile = async (id: string) => { try { const res = await adminFetch(`/archive-files/${id}`, { method: 'DELETE' }); if (res.ok) { refresh(); showToast('Archive link removed'); } } catch {} };

  // --- PROJECTS ---
  const toggleProject = async (id: string) => { try { const res = await adminFetch(`/projects/${id}/toggle`, { method: 'PUT' }); if (res.ok) { refresh(); showToast('Project visibility updated'); } } catch {} };

  // --- OPPORTUNITIES ---
  const saveOpportunity = async () => {
    if (!newOpp.name || !newOpp.startDate || !newOpp.endDate) return;
    const payload = { ...newOpp, startDate: new Date(newOpp.startDate).toISOString(), endDate: new Date(newOpp.endDate).toISOString(), tags: newOpp.tags.split(',').map(t => t.trim()).filter(Boolean) };
    try {
      const url = editingOppId ? `/opportunities/${editingOppId}` : '/opportunities';
      const method = editingOppId ? 'PUT' : 'POST';
      const res = await adminFetch(url, { method, body: JSON.stringify(payload) });
      if (res.ok) {
        refresh();
        setNewOpp({ name: '', type: 'IT', description: '', externalLink: '', startDate: '', endDate: '', tags: '' }); setEditingOppId(null);
        showToast('Opportunity saved');
      }
    } catch {}
  };
  const startEditOpp = (opp: Opportunity) => { setEditingOppId(opp.id); setNewOpp({ name: opp.name, type: opp.type, description: opp.description, externalLink: opp.externalLink || '', startDate: new Date(opp.startDate).toISOString().slice(0, 16), endDate: new Date(opp.endDate).toISOString().slice(0, 16), tags: opp.tags?.join(', ') || '' }); window.scrollTo(0,0); };
  const deleteOpportunity = async (id: string) => { try { const res = await adminFetch(`/opportunities/${id}`, { method: 'DELETE' }); if (res.ok) { refresh(); showToast('Opportunity removed'); } } catch {} };

  // --- STUDENTS ---
  const addStudent = async () => {
    try {
      const res = await adminFetch('/students', { method: 'POST', body: JSON.stringify(newStudent) });
      if (res.ok) { 
        showToast('Student added successfully!'); 
        setNewStudent({ name: '', matric: '', email: '', level: '100' }); 
        searchStudents(studentSearch); // Refresh list
      } 
      else { const data = await res.json(); showToast(data.error, 'error'); }
    } catch {}
  };
  const uploadCSV = async () => {
    if (!csvText.trim()) return;
    try {
      const res = await adminFetch('/students/bulk', { method: 'POST', body: JSON.stringify({ csv: csvText }) });
      const data = await res.json();
      if (res.ok) { 
        showToast(data.message); 
        setCsvText(''); 
        searchStudents(studentSearch);
      } else { 
        showToast(data.error, 'error'); 
      }
    } catch {}
  };

  const confirmAction = (title: string, body: string, action: () => void, type: 'success'|'confirm' = 'success', confirmLabel = 'Confirm') => setConfirmDialog({ open: true, title, body, action, type, confirmLabel });

  const DAYS = [{ label: 'Every Monday', value: '1' }, { label: 'Every Tuesday', value: '2' }, { label: 'Every Wednesday', value: '3' }, { label: 'Every Thursday', value: '4' }, { label: 'Every Friday', value: '5' }, { label: 'Every Saturday', value: '6' }, { label: 'Every Sunday', value: '0' }, { label: 'Not a specific day', value: '-1' }];

  return (
    <div style={{ padding: 'var(--sp-4) 0' }}>
      <AdminShell role={getAdminRole() ?? 'Editor'} user={getAdminEmail() ?? 'Admin'} nav={nav} current={tab} onNav={(id) => setTab(id as AdminTab)} saveStatus={<SaveStatus status={status} at={new Date().toLocaleTimeString()} />}>
        <Window title={nav.find((n) => n.id === tab)?.label || 'Settings'} meta="Database-connected">
          
          {/* FEATURED EVENT TAB */}
          {tab === 'event' && (
            <div className="admin-form-grid">
              <Field label="Event Title"><TextInput value={formData.title} onChange={(v) => setFormData({ ...formData, title: v })} /></Field>
              <Field label="Theme"><TextInput value={formData.theme} onChange={(v) => setFormData({ ...formData, theme: v })} /></Field>
              <Field label="Subtitle"><TextInput value={formData.subtitle} onChange={(v) => setFormData({ ...formData, subtitle: v })} /></Field>
              <Field label="Venue"><TextInput value={formData.venue} onChange={(v) => setFormData({ ...formData, venue: v })} /></Field>
              <div><Button variant="primary" onClick={() => confirmAction('Save Event', 'Update the featured event?', saveEvent)}>Save Event</Button></div>
            </div>
          )}

          {/* EVENTS & CALENDAR TAB */}
          {tab === 'events' && (
            <div style={{ display: 'grid', gap: 'var(--sp-6)' }}>
              
              <div style={{ background: 'var(--panel-2)', padding: 'var(--sp-4)', border: 'var(--bw-sm) solid var(--line)' }}>
                <h3 style={{ margin: '0 0 var(--sp-3) 0', fontFamily: 'var(--font)', textTransform: 'uppercase' }}>
                  {editingCalId ? 'Edit One-off Event' : 'Add One-off Event'}
                </h3>
                <div style={{ display: 'grid', gap: 'var(--sp-3)' }}>
                  <div className="admin-grid-3">
                    <Field label="Date">
                      <TextInput type="text" value={newCalDate} onChange={setNewCalDate} placeholder="YYYY-MM-DD" disabled={!!editingCalId} />
                    </Field>
                    <Field label="Event Title"><TextInput type="text" value={newCalTitle} onChange={setNewCalTitle} placeholder="Hackathon Finals" /></Field>
                    <Field label="Description (Optional)"><TextInput type="text" value={newCalDesc} onChange={setNewCalDesc} placeholder="Brief details..." /></Field>
                  </div>
                  <div style={{ display: 'flex', gap: 'var(--sp-2)' }}>
                    <Button variant="primary" onClick={() => confirmAction(editingCalId ? 'Save Changes' : 'Add Date', `Are you sure?`, saveCalendarEntry)}>
                      {editingCalId ? 'Save Changes' : 'Add One-off Event'}
                    </Button>
                    {editingCalId && (
                      <Button variant="default" onClick={() => { setEditingCalId(null); setNewCalDate(''); setNewCalTitle(''); setNewCalDesc(''); }}>Cancel</Button>
                    )}
                  </div>
                </div>
              </div>

              <div style={{ background: 'var(--panel-2)', padding: 'var(--sp-4)', border: 'var(--bw-sm) solid var(--line)' }}>
                <h3 style={{ margin: '0 0 var(--sp-3) 0', fontFamily: 'var(--font)', textTransform: 'uppercase' }}>
                  {editingWeekId ? 'Edit Recurring Item' : 'Add Recurring Item'}
                </h3>
                <div style={{ display: 'grid', gap: 'var(--sp-3)' }}>
                  <div className="admin-grid-2">
                    <Field label="Title"><TextInput type="text" value={newWeekTitle} onChange={setNewWeekTitle} placeholder="Trivia Tuesday" /></Field>
                    <Field label="Schedule">
                      <Select options={DAYS} value={newWeekDay} onChange={setNewWeekDay} />
                    </Field>
                  </div>
                  <Field label="Short Description"><TextInput type="text" value={newWeekText} onChange={setNewWeekText} placeholder="Quick-fire engineering questions" /></Field>
                  <div style={{ display: 'flex', gap: 'var(--sp-2)' }}>
                    <Button variant="primary" onClick={() => confirmAction(editingWeekId ? 'Save Changes' : 'Add Item', `Are you sure?`, saveWeeklyItem)}>
                      {editingWeekId ? 'Save Changes' : 'Add Recurring Item'}
                    </Button>
                    {editingWeekId && (
                      <Button variant="default" onClick={() => { setEditingWeekId(null); setNewWeekTitle(''); setNewWeekText(''); setNewWeekDay('2'); }}>Cancel</Button>
                    )}
                  </div>
                </div>
              </div>

              <div className="admin-grid-2">
                <div>
                  <h3 style={{ margin: '0 0 var(--sp-3) 0', fontFamily: 'var(--font)', textTransform: 'uppercase' }}>One-off Events</h3>
                  {content.calendarEntries.map((entry) => (
                    <div key={entry.id} className="admin-list-item">
                      <div>
                        <div style={{ fontWeight: 'bold' }}>{entry.title}</div>
                        <div style={{ fontSize: 'var(--fs-sm)', color: 'var(--muted)' }}>{entry.day} {entry.description && `· ${entry.description}`}</div>
                      </div>
                      <div style={{ display: 'flex', gap: 'var(--sp-2)' }}>
                        <Button size="sm" variant="default" onClick={() => startEditCal(entry)}>Edit</Button>
                        <Button size="sm" variant="default" className="btn-danger" onClick={() => confirmAction('Delete Date', `Remove "${entry.title}"?`, () => deleteCalendarEntry(entry.id), 'confirm', 'Delete')}>Delete</Button>
                      </div>
                    </div>
                  ))}
                </div>

                <div>
                  <h3 style={{ margin: '0 0 var(--sp-3) 0', fontFamily: 'var(--font)', textTransform: 'uppercase' }}>Recurring Events</h3>
                  {content.weekly.map((item) => (
                    <div key={item.id} className="admin-list-item">
                      <div>
                        <div style={{ fontWeight: 'bold' }}>{item.title}</div>
                        <div style={{ fontSize: 'var(--fs-sm)', color: 'var(--muted)' }}>
                          {item.weekday !== undefined ? DAYS.find((d) => Number(d.value) === item.weekday)?.label : item.label} · {item.text}
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: 'var(--sp-2)' }}>
                        <Button size="sm" variant="default" onClick={() => startEditWeek(item)}>Edit</Button>
                        <Button size="sm" variant="default" className="btn-danger" onClick={() => confirmAction('Delete Item', `Remove "${item.title}"?`, () => deleteWeeklyItem(item.id), 'confirm', 'Delete')}>Delete</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* EXECUTIVES TAB */}
          {tab === 'executives' && (
            <div style={{ display: 'grid', gap: 'var(--sp-6)' }}>
              <div style={{ background: 'var(--panel-2)', padding: 'var(--sp-4)', border: 'var(--bw-sm) solid var(--line)' }}>
                <h3 style={{ margin: '0 0 var(--sp-3) 0', fontFamily: 'var(--font)', textTransform: 'uppercase' }}>
                  {editingExecId ? 'Edit Executive' : 'Add Executive'}
                </h3>
                <div style={{ display: 'grid', gap: 'var(--sp-3)' }}>
                  <div className="admin-grid-2">
                    <Field label="Role"><TextInput type="text" value={newExec.role} onChange={(v) => setNewExec({ ...newExec, role: v })} placeholder="President" /></Field>
                    <Field label="Full Name"><TextInput type="text" value={newExec.name} onChange={(v) => setNewExec({ ...newExec, name: v })} placeholder="John Doe" /></Field>
                  </div>
                  <Field label="Photo URL (Optional)"><TextInput type="text" value={newExec.photoUrl || ''} onChange={(v) => setNewExec({ ...newExec, photoUrl: v })} placeholder="https://..." /></Field>
                  <Field label="LinkedIn URL (Optional)"><TextInput type="text" value={newExec.linkedin || ''} onChange={(v) => setNewExec({ ...newExec, linkedin: v })} placeholder="https://linkedin.com/in/..." /></Field>
                  <div style={{ display: 'flex', gap: 'var(--sp-2)' }}>
                    <Button variant="primary" onClick={() => confirmAction(editingExecId ? 'Save Changes' : 'Add Executive', `Are you sure?`, saveExecutive)}>
                      {editingExecId ? 'Save Changes' : 'Add Executive'}
                    </Button>
                    {editingExecId && (
                      <Button variant="default" onClick={() => { setEditingExecId(null); setNewExec({ role: '', name: '', linkedin: '', photoUrl: '' }); }}>Cancel</Button>
                    )}
                  </div>
                </div>
              </div>
              <div>
                <h3 style={{ margin: '0 0 var(--sp-3) 0', fontFamily: 'var(--font)', textTransform: 'uppercase' }}>Current Team</h3>
                {content.about.executive.map((exec) => (
                  <div key={exec.id} className="admin-list-item">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)' }}>
                      <Badge tone="neutral" kind="tag">{exec.role}</Badge>
                      <span style={{ fontWeight: 'bold' }}>{exec.name}</span>
                    </div>
                    <div style={{ display: 'flex', gap: 'var(--sp-2)' }}>
                      <Button size="sm" variant="default" onClick={() => startEditExec(exec)}>Edit</Button>
                      <Button size="sm" variant="default" className="btn-danger" onClick={() => confirmAction('Remove Executive', `Remove ${exec.name}?`, () => deleteExecutive(exec.id), 'confirm', 'Remove')}>Remove</Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* PROJECTS TAB */}
          {tab === 'projects' && (
            <div>
              <p style={{ marginTop: 0, color: 'var(--muted)', marginBottom: 'var(--sp-4)' }}>Select which projects appear in the Showcase Marquee on the home page.</p>
              <div style={{ display: 'grid', gap: 'var(--sp-3)' }}>
                {content.projects.projects.map((project) => (
                  <div key={project.id} className="admin-list-item">
                    <div>
                      <div style={{ fontWeight: 'bold', fontSize: 'var(--fs-lg)' }}>{project.title}</div>
                      <div style={{ fontSize: 'var(--fs-sm)', color: 'var(--muted)' }}>By {project.builder} · {project.stage}</div>
                    </div>
                    <Button pressed={project.showcased} onClick={() => confirmAction(project.showcased ? 'Hide Project' : 'Showcase Project', `Are you sure you want to ${project.showcased ? 'hide' : 'showcase'} "${project.title}"?`, () => toggleProject(project.id), project.showcased ? 'confirm' : 'success', project.showcased ? 'Hide' : 'Showcase')} className={project.showcased ? 'btn-success' : ''}>
                      {project.showcased ? 'Showcased' : 'Hidden'}
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* PARTNERS TAB */}
          {tab === 'partners' && (
            <div style={{ display: 'grid', gap: 'var(--sp-6)' }}>
              <div style={{ background: 'var(--panel-2)', padding: 'var(--sp-4)', border: 'var(--bw-sm) solid var(--line)' }}>
                <h3 style={{ margin: '0 0 var(--sp-3) 0', fontFamily: 'var(--font)', textTransform: 'uppercase' }}>
                  {editingPartnerId ? 'Edit Sponsor / Partner' : 'Add Sponsor / Partner'}
                </h3>
                <div style={{ display: 'grid', gap: 'var(--sp-3)' }}>
                  <div className="admin-grid-3">
                    <Field label="Name"><TextInput type="text" value={newPartner.name} onChange={(v) => setNewPartner({ ...newPartner, name: v })} placeholder="Acme Ltd" /></Field>
                    <Field label="Type">
                      <Select 
                        options={[{ value: 'Sponsor', label: 'Sponsor' }, { value: 'Partner', label: 'Partner' }]} 
                        value={newPartner.type} 
                        onChange={(v) => setNewPartner({ ...newPartner, type: v as 'Sponsor' | 'Partner' })} 
                      />
                    </Field>
                    <Field label="Tier">
                      <Select 
                        options={[{ value: '', label: '(no tier)' }, ...content.sponsorTiers.map(t => ({ value: t.name, label: t.name }))]} 
                        value={newPartner.tier} 
                        onChange={(v) => setNewPartner({ ...newPartner, tier: v })} 
                        disabled={newPartner.type !== 'Sponsor'} 
                      />
                    </Field>
                  </div>
                  <Field label="Logo URL (Optional)"><TextInput type="text" value={newPartner.logoUrl} onChange={(v) => setNewPartner({ ...newPartner, logoUrl: v })} placeholder="https://.../logo.png" /></Field>
                  {newPartner.logoUrl && (
                    <div style={{ background: 'var(--bg)', padding: 'var(--sp-3)', border: 'var(--bw-sm) solid var(--line)', display: 'flex', justifyContent: 'center' }}>
                      <img src={newPartner.logoUrl} alt="Preview" style={{ maxHeight: 60, maxWidth: 220, objectFit: 'contain' }} onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                    </div>
                  )}
                  <Field label="Website URL (Optional)"><TextInput type="text" value={newPartner.websiteUrl} onChange={(v) => setNewPartner({ ...newPartner, websiteUrl: v })} placeholder="https://..." /></Field>
                  <div style={{ display: 'flex', gap: 'var(--sp-2)' }}>
                    <Button variant="primary" onClick={() => confirmAction(editingPartnerId ? 'Save Changes' : 'Add Sponsor', `Are you sure?`, savePartner)}>
                      {editingPartnerId ? 'Save Changes' : 'Add Sponsor'}
                    </Button>
                    {editingPartnerId && (
                      <Button variant="default" onClick={() => { setEditingPartnerId(null); setNewPartner({ name: '', type: 'Sponsor', tier: '', logoUrl: '', websiteUrl: '' }); }}>Cancel</Button>
                    )}
                  </div>
                </div>
              </div>
              <div>
                <h3 style={{ margin: '0 0 var(--sp-3) 0', fontFamily: 'var(--font)', textTransform: 'uppercase' }}>Current Sponsors</h3>
                {content.partners.length === 0 ? <p style={{ color: 'var(--muted)' }}>No sponsors yet.</p> : 
                  content.partners.map((partner) => (
                    <div key={partner.id} className="admin-list-item">
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)', flexWrap: 'wrap' }}>
                        {partner.logoUrl ? <img src={partner.logoUrl} alt="" style={{ maxHeight: 28, maxWidth: 64, objectFit: 'contain' }} onError={(e) => { e.currentTarget.style.display = 'none'; }} /> : null}
                        <span style={{ fontWeight: 'bold' }}>{partner.name}</span>
                        <Badge tone="info" kind="tag">{partner.type}</Badge>
                        {partner.tier && <Badge tone="neutral" kind="tag">{partner.tier}</Badge>}
                      </div>
                      <div style={{ display: 'flex', gap: 'var(--sp-2)' }}>
                        <Button size="sm" variant="default" onClick={() => startEditPartner(partner)}>Edit</Button>
                        <Button size="sm" variant="default" className="btn-danger" onClick={() => confirmAction('Remove Sponsor', `Remove "${partner.name}"?`, () => deletePartner(partner.id), 'confirm', 'Remove')}>Remove</Button>
                      </div>
                    </div>
                  ))
                }
              </div>
            </div>
          )}

          {/* OPPORTUNITIES TAB */}
          {tab === 'opportunities' && (
            <div style={{ display: 'grid', gap: 'var(--sp-6)' }}>
              <div style={{ background: 'var(--panel-2)', padding: 'var(--sp-4)', border: 'var(--bw-sm) solid var(--line)' }}>
                <h3 style={{ margin: '0 0 var(--sp-3) 0', fontFamily: 'var(--font)', textTransform: 'uppercase' }}>
                  {editingOppId ? 'Edit Opportunity' : 'Add Opportunity'}
                </h3>
                <div style={{ display: 'grid', gap: 'var(--sp-3)' }}>
                  <div className="admin-grid-2">
                    <Field label="Name"><TextInput value={newOpp.name} onChange={(v) => setNewOpp({ ...newOpp, name: v })} placeholder="Google Summer of Code" /></Field>
                    <Field label="Type">
                      <Select 
                        options={['IT', 'Scholarship', 'Competition', 'Excursion'].map(t => ({ value: t, label: t }))} 
                        value={newOpp.type} 
                        onChange={(v) => setNewOpp({ ...newOpp, type: v })} 
                      />
                    </Field>
                  </div>
                  <Field label="Description"><Textarea value={newOpp.description} onChange={(v) => setNewOpp({ ...newOpp, description: v })} /></Field>
                  <Field label="Tags (Comma separated, e.g. EEE, Level 300, Group)"><TextInput value={newOpp.tags} onChange={(v) => setNewOpp({ ...newOpp, tags: v })} /></Field>
                  <Field label="External Link (Optional)"><TextInput value={newOpp.externalLink} onChange={(v) => setNewOpp({ ...newOpp, externalLink: v })} placeholder="https://..." /></Field>
                  
                  <div className="admin-grid-2">
                    <Field label="Opens On (Date & Time)">
                      <input type="datetime-local" className="amees-input" value={newOpp.startDate} onChange={(e) => setNewOpp({ ...newOpp, startDate: e.target.value })} style={{ padding: 'var(--sp-2)', fontFamily: 'var(--font)', border: 'var(--bw-sm) solid var(--line)', background: 'var(--bg)', color: 'var(--fg)', width: '100%' }} />
                    </Field>
                    <Field label="Closes On (Date & Time)">
                      <input type="datetime-local" className="amees-input" value={newOpp.endDate} onChange={(e) => setNewOpp({ ...newOpp, endDate: e.target.value })} style={{ padding: 'var(--sp-2)', fontFamily: 'var(--font)', border: 'var(--bw-sm) solid var(--line)', background: 'var(--bg)', color: 'var(--fg)', width: '100%' }} />
                    </Field>
                  </div>

                  <div style={{ display: 'flex', gap: 'var(--sp-2)' }}>
                    <Button variant="primary" onClick={() => confirmAction(editingOppId ? 'Save Changes' : 'Add Opportunity', `Are you sure?`, saveOpportunity)}>
                      {editingOppId ? 'Save Changes' : 'Add Opportunity'}
                    </Button>
                    {editingOppId && (
                      <Button variant="default" onClick={() => { setEditingOppId(null); setNewOpp({ name: '', type: 'IT', description: '', externalLink: '', startDate: '', endDate: '', tags: '' }); }}>Cancel</Button>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <h3 style={{ margin: '0 0 var(--sp-3) 0', fontFamily: 'var(--font)', textTransform: 'uppercase' }}>Current Opportunities</h3>
                {(!content.opportunities || content.opportunities.length === 0) ? <p style={{ color: 'var(--muted)' }}>No opportunities yet.</p> : 
                  content.opportunities.map((opp: Opportunity) => (
                    <div key={opp.id} className="admin-list-item">
                      <div>
                        <div style={{ fontWeight: 'bold' }}>{opp.name}</div>
                        <div style={{ fontSize: 'var(--fs-sm)', color: 'var(--muted)' }}>
                          {opp.type} · Ends {new Date(opp.endDate).toLocaleString()}
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: 'var(--sp-2)' }}>
                        <Button size="sm" variant="default" onClick={() => startEditOpp(opp)}>Edit</Button>
                        <Button size="sm" variant="default" className="btn-danger" onClick={() => confirmAction('Remove Opportunity', `Remove "${opp.name}"?`, () => deleteOpportunity(opp.id), 'confirm', 'Remove')}>Remove</Button>
                      </div>
                    </div>
                  ))
                }
              </div>
            </div>
          )}

          {/* STUDENTS TAB */}
          {tab === 'students' && (
            <div style={{ display: 'grid', gap: 'var(--sp-6)' }}>
              <div className="admin-students-grid">
                <div style={{ background: 'var(--panel-2)', padding: 'var(--sp-4)', border: 'var(--bw-sm) solid var(--line)' }}>
                  <h3 style={{ margin: '0 0 var(--sp-3) 0', fontFamily: 'var(--font)', textTransform: 'uppercase' }}>Add Single Student</h3>
                  <div style={{ display: 'grid', gap: 'var(--sp-3)' }}>
                    <Field label="Full Name"><TextInput value={newStudent.name} onChange={(v) => setNewStudent({ ...newStudent, name: v })} /></Field>
                    <Field label="Matric Number"><TextInput value={newStudent.matric} onChange={(v) => setNewStudent({ ...newStudent, matric: v })} /></Field>
                    <Field label="Email"><TextInput type="email" value={newStudent.email} onChange={(v) => setNewStudent({ ...newStudent, email: v })} /></Field>
                    <Field label="Level">
                      <Select 
                        options={['100', '200', '300', '400', '500'].map(l => ({ value: l, label: l }))} 
                        value={newStudent.level} 
                        onChange={(v) => setNewStudent({ ...newStudent, level: v })} 
                      />
                    </Field>
                    <Button variant="primary" onClick={addStudent}>Add Student</Button>
                  </div>
                </div>

                <div style={{ background: 'var(--panel-2)', padding: 'var(--sp-4)', border: 'var(--bw-sm) solid var(--line)' }}>
                  <h3 style={{ margin: '0 0 var(--sp-3) 0', fontFamily: 'var(--font)', textTransform: 'uppercase' }}>Bulk CSV Upload</h3>
                  <p style={{ fontSize: 'var(--fs-sm)', color: 'var(--muted)', marginBottom: 'var(--sp-3)' }}>
                    Format: <code>Name, Matric, Email, Level</code> (one per line, no header row).
                  </p>
                  <textarea
                    value={csvText}
                    onChange={(e) => setCsvText(e.target.value)}
                    placeholder="Ada Lovelace, 12345, ada@lcu.edu.ng, 300&#10;Tunde, 67890, tunde@lcu.edu.ng, 200"
                    style={{ width: '100%', height: '150px', padding: 'var(--sp-2)', fontFamily: 'monospace', marginBottom: 'var(--sp-3)', border: 'var(--bw-sm) solid var(--line)', background: 'var(--bg)', color: 'var(--fg)' }}
                  />
                  <Button variant="primary" onClick={uploadCSV}>Upload CSV</Button>
                </div>
              </div>

              {/* Student List / Search */}
              <div style={{ marginTop: 'var(--sp-4)' }}>
                <h3 style={{ margin: '0 0 var(--sp-3) 0', fontFamily: 'var(--font)', textTransform: 'uppercase' }}>Registered Students</h3>
                <div style={{ marginBottom: 'var(--sp-3)' }}>
                  <TextInput value={studentSearch} onChange={searchStudents} placeholder="Search by name, matric, or email..." />
                </div>
                <div style={{ overflowX: 'auto', border: 'var(--bw-sm) solid var(--line)' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 'var(--fs-sm)' }}>
                    <thead style={{ background: 'var(--panel-2)' }}>
                      <tr style={{ borderBottom: '2px solid var(--line)' }}>
                        <th style={{ padding: 'var(--sp-3)' }}>Name</th>
                        <th style={{ padding: 'var(--sp-3)' }}>Matric</th>
                        <th style={{ padding: 'var(--sp-3)' }}>Email</th>
                        <th style={{ padding: 'var(--sp-3)' }}>Level</th>
                      </tr>
                    </thead>
                    <tbody>
                      {studentList.map(s => (
                        <tr key={s.id} style={{ borderBottom: '1px solid var(--line)' }}>
                          <td style={{ padding: 'var(--sp-3)' }}>{s.name}</td>
                          <td style={{ padding: 'var(--sp-3)' }}>{s.matric}</td>
                          <td style={{ padding: 'var(--sp-3)' }}>{s.email}</td>
                          <td style={{ padding: 'var(--sp-3)' }}>{s.level}L</td>
                        </tr>
                      ))}
                      {studentList.length === 0 && (
                        <tr>
                          <td colSpan={4} style={{ padding: 'var(--sp-4)', textAlign: 'center', color: 'var(--muted)' }}>
                            No students found matching "{studentSearch}".
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ARCHIVE TAB */}
          {tab === 'archive' && (
            <div style={{ display: 'grid', gap: 'var(--sp-6)' }}>
              <div style={{ background: 'var(--panel-2)', padding: 'var(--sp-4)', border: 'var(--bw-sm) solid var(--line)' }}>
                <h3 style={{ margin: '0 0 var(--sp-3) 0', fontFamily: 'var(--font)', textTransform: 'uppercase' }}>
                  {editingArchiveId ? 'Edit Study File' : 'Add a study file link'}
                </h3>
                <div style={{ display: 'grid', gap: 'var(--sp-3)' }}>
                  <div className="admin-grid-2">
                    <Field label="Title"><TextInput type="text" value={newArchive.title} onChange={(v) => setNewArchive({ ...newArchive, title: v })} placeholder="Control Systems I — lecture slides" /></Field>
                    <Field label="Course code"><TextInput type="text" value={newArchive.course} onChange={(v) => setNewArchive({ ...newArchive, course: v })} placeholder="MCE 301" /></Field>
                  </div>
                  <div className="admin-grid-3">
                    <Field label="Level">
                      <Select 
                        options={['100', '200', '300', '400', '500'].map(l => ({ value: l, label: l }))} 
                        value={newArchive.level} 
                        onChange={(v) => setNewArchive({ ...newArchive, level: v })} 
                      />
                    </Field>
                    <Field label="Year"><TextInput type="text" value={newArchive.year} onChange={(v) => setNewArchive({ ...newArchive, year: v })} /></Field>
                    <Field label="Kind">
                      <Select 
                        options={['PDF', 'DOCX', 'PPTX', 'XLSX'].map(k => ({ value: k, label: k }))} 
                        value={newArchive.kind} 
                        onChange={(v) => setNewArchive({ ...newArchive, kind: v })} 
                      />
                    </Field>
                  </div>
                  <Field label="Google Drive share link">
                    <TextInput type="url" value={newArchive.fileUrl} onChange={(v) => setNewArchive({ ...newArchive, fileUrl: v })} placeholder="https://drive.google.com/file/d/…/view" disabled={!!editingArchiveId} />
                  </Field>
                  <div style={{ display: 'flex', gap: 'var(--sp-2)' }}>
                    <Button variant="primary" onClick={() => confirmAction(editingArchiveId ? 'Save Changes' : 'Add archive link', `Are you sure?`, saveArchiveFile)}>
                      {editingArchiveId ? 'Save Changes' : 'Add link'}
                    </Button>
                    {editingArchiveId && (
                      <Button variant="default" onClick={() => { setEditingArchiveId(null); setNewArchive({ title: '', course: '', level: '100', year: String(new Date().getFullYear()), kind: 'PDF', fileUrl: '' }); }}>Cancel</Button>
                    )}
                  </div>
                </div>
              </div>
              <div>
                <h3 style={{ margin: '0 0 var(--sp-3) 0', fontFamily: 'var(--font)', textTransform: 'uppercase' }}>Current links ({content.archiveFiles?.length ?? 0})</h3>
                {(!content.archiveFiles || content.archiveFiles.length === 0) ? <p style={{ color: 'var(--muted)' }}>No archive links yet.</p> : 
                  content.archiveFiles.map((f) => (
                    <div key={f.id} className="admin-list-item">
                      <div>
                        <div style={{ fontWeight: 'bold' }}>{f.title}</div>
                        <div style={{ fontSize: 'var(--fs-sm)', color: 'var(--muted)' }}>{f.course} · {f.level}L · {f.year} · {f.kind}</div>
                      </div>
                      <div style={{ display: 'flex', gap: 'var(--sp-2)' }}>
                        {f.fileUrl && <Button as="a" href={f.fileUrl} target="_blank" rel="noopener noreferrer" size="sm" variant="default">Open</Button>}
                        <Button size="sm" variant="default" onClick={() => startEditArchive(f)}>Edit</Button>
                        <Button size="sm" variant="default" className="btn-danger" onClick={() => confirmAction('Remove link', `Remove "${f.title}"?`, () => deleteArchiveFile(f.id), 'confirm', 'Remove')}>Remove</Button>
                      </div>
                    </div>
                  ))
                }
              </div>
            </div>
          )}

          {/* GENERAL SETTINGS TAB */}
          {tab === 'general' && (
            <div className="admin-form-grid">
              <Field label="Home Page Marquee Mode">
                <Select 
                  options={[
                    { value: 'caution', label: 'Caution Tape (Event Countdown)' }, 
                    { value: 'showcase', label: 'Showcase Marquee (Student Projects)' }
                  ]} 
                  value={marqueeMode} 
                  onChange={(v) => setMarqueeMode(v as 'caution' | 'showcase')} 
                />
              </Field>
              <Field label="Footer Tagline"><Textarea value={footerTagline} onChange={setFooterTagline} /></Field>
              <h3 style={{ margin: 'var(--sp-4) 0 0', fontFamily: 'var(--font)', fontSize: 'var(--fs-md)', textTransform: 'uppercase', color: 'var(--muted)' }}>External form links</h3>
              <Field label="Event Registration Form URL"><TextInput type="url" value={eventRegistrationFormUrl} onChange={setEventRegistrationFormUrl} placeholder="https://docs.google.com/forms/d/e/…/viewform" /></Field>
              <Field label="Event Field Entry ID (Optional)"><TextInput type="text" value={eventRegistrationEventFieldId} onChange={setEventRegistrationEventFieldId} placeholder="123456789" /></Field>
              <Field label="Membership Form URL"><TextInput type="url" value={membershipFormUrl} onChange={setMembershipFormUrl} placeholder="https://forms.gle/..." /></Field>
              <Field label="Project Submission URL"><TextInput type="url" value={projectSubmissionUrl} onChange={setProjectSubmissionUrl} placeholder="mailto:..." /></Field>
              <div><Button variant="primary" onClick={() => confirmAction('Save Settings', 'Update global site settings?', saveSettings)}>Save Settings</Button></div>
            </div>
          )}
        </Window>
      </AdminShell>

      <ConfirmDialog open={confirmDialog.open} title={confirmDialog.title} body={confirmDialog.body} confirmLabel={confirmDialog.confirmLabel} type={confirmDialog.type} onCancel={() => setConfirmDialog((prev) => ({ ...prev, open: false }))} onConfirm={() => { confirmDialog.action(); setConfirmDialog((prev) => ({ ...prev, open: false })); }} />
      
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}