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
import { useContent, useRefreshContent } from '../content/contentProvider';
import type { FeaturedEvent, ExecutiveMember } from '../content/types';
import { getValidToken, getAdminEmail, getAdminRole, clearToken } from '../lib/authToken';
import { API_BASE } from '../lib/apiBase';
import './AdminPage.css';

type AdminTab =
  | 'event'
  | 'calendar'
  | 'weekly'
  | 'executives'
  | 'projects'
  | 'partners'
  | 'general';

const API_URL = `${API_BASE}/api/admin`;

async function adminFetch(path: string, options: RequestInit = {}): Promise<Response> {
  const token = getValidToken();
  if (!token) {
    window.location.hash = 'login';
    throw new Error('No token');
  }
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers ?? {}),
      Authorization: `Bearer ${token}`,
    },
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

  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    title: string;
    body: string;
    action: () => void;
    type: 'confirm' | 'success' | 'info' | 'error';
    confirmLabel: string;
  }>({
    open: false,
    title: '',
    body: '',
    action: () => {},
    type: 'confirm',
    confirmLabel: 'Confirm',
  });

  const [formData, setFormData] = useState<FeaturedEvent>(content.featured);
  const [newCalDate, setNewCalDate] = useState('');
  const [newCalTitle, setNewCalTitle] = useState('');
  const [newWeekTitle, setNewWeekTitle] = useState('');
  const [newWeekText, setNewWeekText] = useState('');
  const [newWeekDay, setNewWeekDay] = useState('2');
  const [newExec, setNewExec] = useState<Omit<ExecutiveMember, 'id'>>({
    role: '',
    name: '',
    linkedin: '',
    photoUrl: '',
  });
  const [newPartner, setNewPartner] = useState({
    name: '',
    type: 'Sponsor' as 'Sponsor' | 'Partner',
    tier: '',
    logoUrl: '',
    websiteUrl: '',
  });

  const [marqueeMode, setMarqueeMode] = useState(content.activeMarquee || 'caution');
  const [footerTagline, setFooterTagline] = useState(content.footer.tagline);
  const [membershipFormUrl, setMembershipFormUrl] = useState(content.membershipFormUrl || '');
  const [projectSubmissionUrl, setProjectSubmissionUrl] = useState(content.projectSubmissionUrl || '');

  useEffect(() => {
    setFormData(content.featured);
    setMarqueeMode(content.activeMarquee || 'caution');
    setFooterTagline(content.footer.tagline);
    setMembershipFormUrl(content.membershipFormUrl || '');
    setProjectSubmissionUrl(content.projectSubmissionUrl || '');
  }, [content]);

  // Belt-and-braces: RequireAuth already gates this route, but AdminPage
  // must not render without a valid token even if mounted standalone.
  useEffect(() => {
    if (!getValidToken()) {
      window.location.hash = 'login';
    }
  }, []);

  const nav = [
    { id: 'event', label: 'Featured Event' },
    { id: 'calendar', label: 'One-off Dates' },
    { id: 'weekly', label: 'Weekly Rhythm' },
    { id: 'executives', label: 'Executives' },
    { id: 'projects', label: 'Projects' },
    { id: 'partners', label: 'Sponsors' },
    { id: 'general', label: 'Site Settings' },
  ];

  // --- API Handlers ---
  const saveEvent = async () => {
    setStatus('saving');
    try {
      const res = await adminFetch('/event', {
        method: 'PUT',
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        setStatus('saved');
        refresh();
      } else {
        setStatus('error');
        alert('Failed');
      }
    } catch {
      setStatus('error');
    }
  };

  const saveSettings = async () => {
    setStatus('saving');
    try {
      const res = await adminFetch('/settings', {
        method: 'PUT',
        body: JSON.stringify({
          activeMarquee: marqueeMode,
          footer: { ...content.footer, tagline: footerTagline },
          membershipFormUrl,
          projectSubmissionUrl,
        }),
      });
      if (res.ok) {
        setStatus('saved');
        refresh();
      } else {
        setStatus('error');
        alert('Failed');
      }
    } catch {
      setStatus('error');
    }
  };

  const addCalendarEntry = async (data: any) => {
    try {
      const res = await adminFetch('/calendar', { method: 'POST', body: JSON.stringify(data) });
      if (res.ok) refresh();
      else alert('Failed');
    } catch {
      /* handled */
    }
  };

  const deleteCalendarEntry = async (id: string) => {
    try {
      const res = await adminFetch(`/calendar/${id}`, { method: 'DELETE' });
      if (res.ok) refresh();
      else alert('Failed');
    } catch {
      /* handled */
    }
  };

  const addWeeklyItem = async (data: any) => {
    try {
      const res = await adminFetch('/weekly', { method: 'POST', body: JSON.stringify(data) });
      if (res.ok) refresh();
      else alert('Failed');
    } catch {
      /* handled */
    }
  };

  const deleteWeeklyItem = async (id: string) => {
    try {
      const res = await adminFetch(`/weekly/${id}`, { method: 'DELETE' });
      if (res.ok) refresh();
      else alert('Failed');
    } catch {
      /* handled */
    }
  };

  const addExecutive = async (data: Omit<ExecutiveMember, 'id'>) => {
    try {
      const res = await adminFetch('/executives', {
        method: 'POST',
        body: JSON.stringify({ ...data, order: content.about.executive.length }),
      });
      if (res.ok) refresh();
      else alert('Failed');
    } catch {
      /* handled */
    }
  };

  const deleteExecutive = async (id: string) => {
    try {
      const res = await adminFetch(`/executives/${id}`, { method: 'DELETE' });
      if (res.ok) refresh();
      else alert('Failed');
    } catch {
      /* handled */
    }
  };

  const toggleProject = async (id: string) => {
    try {
      const res = await adminFetch(`/projects/${id}/toggle`, { method: 'PUT' });
      if (res.ok) refresh();
      else alert('Failed');
    } catch {
      /* handled */
    }
  };

  const addPartner = async () => {
    try {
      const res = await adminFetch('/partners', {
        method: 'POST',
        body: JSON.stringify({
          name: newPartner.name,
          type: newPartner.type,
          tier: newPartner.tier || null,
          logoUrl: newPartner.logoUrl,
          websiteUrl: newPartner.websiteUrl,
          order: content.partners.length,
        }),
      });
      if (res.ok) {
        refresh();
        setNewPartner({ name: '', type: 'Sponsor', tier: '', logoUrl: '', websiteUrl: '' });
      } else {
        alert('Failed');
      }
    } catch {
      /* handled */
    }
  };

  const deletePartner = async (id: string) => {
    try {
      const res = await adminFetch(`/partners/${id}`, { method: 'DELETE' });
      if (res.ok) refresh();
      else alert('Failed');
    } catch {
      /* handled */
    }
  };

  // --- Confirm Wrappers ---
  const confirmSaveEvent = () =>
    setConfirmDialog({
      open: true,
      title: 'Save Event',
      body: 'Update the featured event?',
      type: 'success',
      confirmLabel: 'Save',
      action: saveEvent,
    });
  const confirmSaveSettings = () =>
    setConfirmDialog({
      open: true,
      title: 'Save Settings',
      body: 'Update global site settings?',
      type: 'success',
      confirmLabel: 'Save',
      action: saveSettings,
    });
  const confirmAddCalendar = () => {
    if (!newCalDate || !newCalTitle) return;
    setConfirmDialog({
      open: true,
      title: 'Add Date',
      body: `Add "${newCalTitle}"?`,
      type: 'success',
      confirmLabel: 'Add',
      action: () => addCalendarEntry({ day: newCalDate, title: newCalTitle, type: 'special' }),
    });
  };
  const confirmDeleteCalendar = (id: string, title: string) =>
    setConfirmDialog({
      open: true,
      title: 'Delete Date',
      body: `Remove "${title}"?`,
      type: 'confirm',
      confirmLabel: 'Delete',
      action: () => deleteCalendarEntry(id),
    });
  const confirmAddWeekly = () => {
    if (!newWeekTitle || !newWeekText) return;
    setConfirmDialog({
      open: true,
      title: 'Add Item',
      body: `Add "${newWeekTitle}"?`,
      type: 'success',
      confirmLabel: 'Add',
      action: () =>
        addWeeklyItem({
          title: newWeekTitle,
          text: newWeekText,
          weekday: Number(newWeekDay) === -1 ? null : Number(newWeekDay),
        }),
    });
  };
  const confirmDeleteWeekly = (id: string, title: string) =>
    setConfirmDialog({
      open: true,
      title: 'Delete Item',
      body: `Remove "${title}"?`,
      type: 'confirm',
      confirmLabel: 'Delete',
      action: () => deleteWeeklyItem(id),
    });
  const confirmAddExec = () => {
    if (!newExec.role || !newExec.name) return;
    setConfirmDialog({
      open: true,
      title: 'Add Executive',
      body: `Add ${newExec.name}?`,
      type: 'success',
      confirmLabel: 'Add',
      action: () => addExecutive(newExec),
    });
  };
  const confirmDeleteExec = (id: string, name: string) =>
    setConfirmDialog({
      open: true,
      title: 'Remove Executive',
      body: `Remove ${name}?`,
      type: 'confirm',
      confirmLabel: 'Remove',
      action: () => deleteExecutive(id),
    });
  const confirmToggleProject = (id: string, title: string, current: boolean) =>
    setConfirmDialog({
      open: true,
      title: current ? 'Hide Project' : 'Showcase Project',
      body: `Are you sure you want to ${current ? 'hide' : 'showcase'} "${title}"?`,
      type: current ? 'confirm' : 'success',
      confirmLabel: current ? 'Hide' : 'Showcase',
      action: () => toggleProject(id),
    });
  const confirmAddPartner = () => {
    if (!newPartner.name.trim()) return;
    setConfirmDialog({
      open: true,
      title: 'Add Sponsor',
      body: `Add "${newPartner.name}"?`,
      type: 'success',
      confirmLabel: 'Add',
      action: addPartner,
    });
  };
  const confirmDeletePartner = (id: string, name: string) =>
    setConfirmDialog({
      open: true,
      title: 'Remove Sponsor',
      body: `Remove "${name}"?`,
      type: 'confirm',
      confirmLabel: 'Remove',
      action: () => deletePartner(id),
    });

  const DAYS = [
    { label: 'Every Monday', value: 1 },
    { label: 'Every Tuesday', value: 2 },
    { label: 'Every Wednesday', value: 3 },
    { label: 'Every Thursday', value: 4 },
    { label: 'Every Friday', value: 5 },
    { label: 'Every Saturday', value: 6 },
    { label: 'Every Sunday', value: 0 },
    { label: 'Not a specific day', value: -1 },
  ];

  return (
    <div style={{ padding: 'var(--sp-4) 0' }}>
      <AdminShell
        role={getAdminRole() ?? 'Editor'}
        user={getAdminEmail() ?? 'Admin'}
        nav={nav}
        current={tab}
        onNav={(id) => setTab(id as AdminTab)}
        saveStatus={<SaveStatus status={status} at={new Date().toLocaleTimeString()} />}
      >
        <Window title={nav.find((n) => n.id === tab)?.label || 'Settings'} meta="Database-connected">
          {tab === 'event' && (
            <div className="admin-form-grid">
              <Field label="Event Title">
                <TextInput value={formData.title} onChange={(v) => setFormData({ ...formData, title: v })} />
              </Field>
              <Field label="Theme">
                <TextInput value={formData.theme} onChange={(v) => setFormData({ ...formData, theme: v })} />
              </Field>
              <Field label="Subtitle">
                <TextInput value={formData.subtitle} onChange={(v) => setFormData({ ...formData, subtitle: v })} />
              </Field>
              <Field label="Venue">
                <TextInput value={formData.venue} onChange={(v) => setFormData({ ...formData, venue: v })} />
              </Field>
              <div>
                <Button variant="primary" onClick={confirmSaveEvent}>
                  Save Event
                </Button>
              </div>
            </div>
          )}

          {tab === 'calendar' && (
            <div style={{ display: 'grid', gap: 'var(--sp-6)' }}>
              <div style={{ background: 'var(--panel-2)', padding: 'var(--sp-4)', border: 'var(--bw-sm) solid var(--line)' }}>
                <h3 style={{ margin: '0 0 var(--sp-3) 0', fontFamily: 'var(--font)', textTransform: 'uppercase' }}>
                  Add One-off Event
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(140px, 1fr) minmax(250px, 2fr) auto', gap: 'var(--sp-3)', alignItems: 'end' }}>
                  <Field label="Date">
                    <TextInput type="text" value={newCalDate} onChange={setNewCalDate} placeholder="YYYY-MM-DD" />
                  </Field>
                  <Field label="Event Title">
                    <TextInput type="text" value={newCalTitle} onChange={setNewCalTitle} placeholder="Hackathon Finals" />
                  </Field>
                  <Button variant="primary" onClick={confirmAddCalendar}>
                    Add
                  </Button>
                </div>
              </div>
              <div>
                <h3 style={{ margin: '0 0 var(--sp-3) 0', fontFamily: 'var(--font)', textTransform: 'uppercase' }}>
                  Existing Dates
                </h3>
                {content.calendarEntries.length === 0 ? (
                  <p style={{ color: 'var(--muted)' }}>No one-off events.</p>
                ) : (
                  content.calendarEntries.map((entry) => (
                    <div key={entry.id} className="admin-list-item">
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)' }}>
                        <Badge tone="info" kind="tag">
                          {entry.day}
                        </Badge>
                        <span style={{ fontWeight: 'bold' }}>{entry.title}</span>
                      </div>
                      <Button size="sm" variant="default" onClick={() => confirmDeleteCalendar(entry.id, entry.title)}>
                        Delete
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {tab === 'weekly' && (
            <div style={{ display: 'grid', gap: 'var(--sp-6)' }}>
              <div style={{ background: 'var(--panel-2)', padding: 'var(--sp-4)', border: 'var(--bw-sm) solid var(--line)' }}>
                <h3 style={{ margin: '0 0 var(--sp-3) 0', fontFamily: 'var(--font)', textTransform: 'uppercase' }}>
                  Add Recurring Item
                </h3>
                <div style={{ display: 'grid', gap: 'var(--sp-3)' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--sp-3)' }}>
                    <Field label="Title">
                      <TextInput type="text" value={newWeekTitle} onChange={setNewWeekTitle} placeholder="Trivia Tuesday" />
                    </Field>
                    <Field label="Schedule">
                      <select className="amees-input" value={newWeekDay} onChange={(e) => setNewWeekDay(e.target.value)}>
                        {DAYS.map((d) => (
                          <option key={d.value} value={d.value}>
                            {d.label}
                          </option>
                        ))}
                      </select>
                    </Field>
                  </div>
                  <Field label="Short Description">
                    <TextInput type="text" value={newWeekText} onChange={setNewWeekText} placeholder="Quick-fire engineering questions" />
                  </Field>
                  <div>
                    <Button variant="primary" onClick={confirmAddWeekly}>
                      Add Recurring Item
                    </Button>
                  </div>
                </div>
              </div>
              <div>
                <h3 style={{ margin: '0 0 var(--sp-3) 0', fontFamily: 'var(--font)', textTransform: 'uppercase' }}>
                  Current Rhythm
                </h3>
                {content.weekly.map((item) => (
                  <div key={item.id} className="admin-list-item">
                    <div>
                      <div style={{ fontWeight: 'bold' }}>{item.title}</div>
                      <div style={{ fontSize: 'var(--fs-sm)', color: 'var(--muted)' }}>
                        {item.weekday !== undefined ? DAYS.find((d) => d.value === item.weekday)?.label : item.label} · {item.text}
                      </div>
                    </div>
                    <Button size="sm" variant="default" onClick={() => confirmDeleteWeekly(item.id, item.title)}>
                      Delete
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === 'executives' && (
            <div style={{ display: 'grid', gap: 'var(--sp-6)' }}>
              <div style={{ background: 'var(--panel-2)', padding: 'var(--sp-4)', border: 'var(--bw-sm) solid var(--line)' }}>
                <h3 style={{ margin: '0 0 var(--sp-3) 0', fontFamily: 'var(--font)', textTransform: 'uppercase' }}>
                  Add Executive
                </h3>
                <div style={{ display: 'grid', gap: 'var(--sp-3)' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--sp-3)' }}>
                    <Field label="Role">
                      <TextInput type="text" value={newExec.role} onChange={(v) => setNewExec({ ...newExec, role: v })} placeholder="President" />
                    </Field>
                    <Field label="Full Name">
                      <TextInput type="text" value={newExec.name} onChange={(v) => setNewExec({ ...newExec, name: v })} placeholder="John Doe" />
                    </Field>
                  </div>
                  <Field label="Photo URL (Optional)">
                    <TextInput type="text" value={newExec.photoUrl || ''} onChange={(v) => setNewExec({ ...newExec, photoUrl: v })} placeholder="https://..." />
                  </Field>
                  <Field label="LinkedIn URL (Optional)">
                    <TextInput type="text" value={newExec.linkedin || ''} onChange={(v) => setNewExec({ ...newExec, linkedin: v })} placeholder="https://linkedin.com/in/..." />
                  </Field>
                  <div>
                    <Button variant="primary" onClick={confirmAddExec}>
                      Add Executive
                    </Button>
                  </div>
                </div>
              </div>
              <div>
                <h3 style={{ margin: '0 0 var(--sp-3) 0', fontFamily: 'var(--font)', textTransform: 'uppercase' }}>
                  Current Team
                </h3>
                {content.about.executive.map((exec) => (
                  <div key={exec.id} className="admin-list-item">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)' }}>
                      <Badge tone="neutral" kind="tag">
                        {exec.role}
                      </Badge>
                      <span style={{ fontWeight: 'bold' }}>{exec.name}</span>
                    </div>
                    <Button size="sm" variant="default" onClick={() => confirmDeleteExec(exec.id, exec.name)}>
                      Remove
                    </Button>
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
                {content.projects.projects.map((project) => (
                  <div key={project.id} className="admin-list-item">
                    <div>
                      <div style={{ fontWeight: 'bold', fontSize: 'var(--fs-lg)' }}>{project.title}</div>
                      <div style={{ fontSize: 'var(--fs-sm)', color: 'var(--muted)' }}>
                        By {project.builder} · {project.stage}
                      </div>
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

          {tab === 'partners' && (
            <div style={{ display: 'grid', gap: 'var(--sp-6)' }}>
              <div style={{ background: 'var(--panel-2)', padding: 'var(--sp-4)', border: 'var(--bw-sm) solid var(--line)' }}>
                <h3 style={{ margin: '0 0 var(--sp-3) 0', fontFamily: 'var(--font)', textTransform: 'uppercase' }}>
                  Add Sponsor / Partner
                </h3>
                <div style={{ display: 'grid', gap: 'var(--sp-3)' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 'var(--sp-3)' }}>
                    <Field label="Name">
                      <TextInput type="text" value={newPartner.name} onChange={(v) => setNewPartner({ ...newPartner, name: v })} placeholder="Acme Ltd" />
                    </Field>
                    <Field label="Type">
                      <select
                        className="amees-input"
                        value={newPartner.type}
                        onChange={(e) => setNewPartner({ ...newPartner, type: e.target.value as 'Sponsor' | 'Partner' })}
                      >
                        <option value="Sponsor">Sponsor</option>
                        <option value="Partner">Partner</option>
                      </select>
                    </Field>
                    <Field label="Tier">
                      <select
                        className="amees-input"
                        value={newPartner.tier}
                        onChange={(e) => setNewPartner({ ...newPartner, tier: e.target.value })}
                        disabled={newPartner.type !== 'Sponsor'}
                      >
                        <option value="">(no tier)</option>
                        {content.sponsorTiers.map((t) => (
                          <option key={t.id} value={t.name}>
                            {t.name}
                          </option>
                        ))}
                      </select>
                    </Field>
                  </div>
                  <Field label="Logo URL (Optional)">
                    <TextInput
                      type="text"
                      value={newPartner.logoUrl}
                      onChange={(v) => setNewPartner({ ...newPartner, logoUrl: v })}
                      placeholder="https://.../logo.png"
                    />
                  </Field>
                  {newPartner.logoUrl && (
                    <div
                      style={{
                        background: 'var(--bg)',
                        padding: 'var(--sp-3)',
                        border: 'var(--bw-sm) solid var(--line)',
                        display: 'flex',
                        justifyContent: 'center',
                      }}
                    >
                      <img
                        src={newPartner.logoUrl}
                        alt="Preview"
                        style={{ maxHeight: 60, maxWidth: 220, objectFit: 'contain' }}
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                  <Field label="Website URL (Optional)">
                    <TextInput
                      type="text"
                      value={newPartner.websiteUrl}
                      onChange={(v) => setNewPartner({ ...newPartner, websiteUrl: v })}
                      placeholder="https://..."
                    />
                  </Field>
                  <div>
                    <Button variant="primary" onClick={confirmAddPartner}>
                      Add Sponsor
                    </Button>
                  </div>
                </div>
              </div>

              <div>
                <h3 style={{ margin: '0 0 var(--sp-3) 0', fontFamily: 'var(--font)', textTransform: 'uppercase' }}>
                  Current Sponsors
                </h3>
                {content.partners.length === 0 ? (
                  <p style={{ color: 'var(--muted)' }}>No sponsors yet.</p>
                ) : (
                  content.partners.map((partner) => (
                    <div key={partner.id} className="admin-list-item">
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)', flexWrap: 'wrap' }}>
                        {partner.logoUrl ? (
                          <img
                            src={partner.logoUrl}
                            alt=""
                            style={{ maxHeight: 28, maxWidth: 64, objectFit: 'contain' }}
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        ) : null}
                        <span style={{ fontWeight: 'bold' }}>{partner.name}</span>
                        <Badge tone="info" kind="tag">
                          {partner.type}
                        </Badge>
                        {partner.tier && <Badge tone="neutral" kind="tag">{partner.tier}</Badge>}
                        {partner.active === false && <Badge tone="warn" kind="tag">Hidden</Badge>}
                      </div>
                      <Button size="sm" variant="default" onClick={() => confirmDeletePartner(partner.id, partner.name)}>
                        Remove
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {tab === 'general' && (
            <div className="admin-form-grid">
              <Field label="Home Page Marquee Mode">
                <select className="amees-input" value={marqueeMode} onChange={(e) => setMarqueeMode(e.target.value as 'caution' | 'showcase')}>
                  <option value="caution">Caution Tape (Event Countdown)</option>
                  <option value="showcase">Showcase Marquee (Student Projects)</option>
                </select>
              </Field>
              <Field label="Footer Tagline">
                <Textarea value={footerTagline} onChange={setFooterTagline} />
              </Field>
              <Field label="Membership Form URL">
                <TextInput type="url" value={membershipFormUrl} onChange={setMembershipFormUrl} placeholder="https://forms.gle/..." />
              </Field>
              <Field label="Project Submission URL">
                <TextInput type="url" value={projectSubmissionUrl} onChange={setProjectSubmissionUrl} placeholder="mailto:..." />
              </Field>
              <div>
                <Button variant="primary" onClick={confirmSaveSettings}>
                  Save Settings
                </Button>
              </div>
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
        onCancel={() => setConfirmDialog((prev) => ({ ...prev, open: false }))}
        onConfirm={() => {
          confirmDialog.action();
          setConfirmDialog((prev) => ({ ...prev, open: false }));
        }}
      />
    </div>
  );
}