import { Wrap, Block } from '../components/containers/Layout';
import { PageHeader } from '../components/containers/PageHeader';
import { Window } from '../components/containers/Window';
import { Badge } from '../components/primitives/Badge';
import { Button } from '../components/primitives/Button';
import { DotList } from '../components/containers/DotList';
import { useContent } from '../content/contentProvider';
import type { PageId } from './types';

import './ProjectProfilePage.css';

interface ProjectProfilePageProps {
  projectId: string;
  onNavigate: (page: PageId) => void;
}

export function ProjectProfilePage({ projectId, onNavigate }: ProjectProfilePageProps) {
  const content = useContent();
  const project = content.projects.projects.find(p => p.id === projectId);

  if (!project) {
    return (
      <Wrap>
        <Block>
          <PageHeader kicker="Error" title="Project not found" lede="This build does not exist or has been removed." />
          <Button onClick={() => onNavigate('projects')}>← Back to Projects</Button>
        </Block>
      </Wrap>
    );
  }

  // SAFE EXTRACTION: Fallback to empty objects/arrays if the student hasn't filled them out yet
  const wb = project.workbenchData || {};
  const pitch = wb.pitch || { problem: '', solution: '', ask: '' };
  const milestones = wb.milestones || [];
  const tests = wb.tests || [];
  const parts = wb.parts || [];

  return (
    <Wrap>
      <Block>
        <div className="profile-back-btn">
          <Button onClick={() => onNavigate('projects')}>← Back to Projects</Button>
        </div>
        
        <PageHeader 
          className="profile-header"
          kicker={`Built by ${project.builder}`} 
          title={project.title} 
          lede={project.description} 
        />
      </Block>

      <Block>
        <div className="profile-grid">
          
          {/* Main Content Column */}
          <div style={{ display: 'grid', gap: 'var(--sp-4)' }}>
            <Window title="The Pitch" meta="From the Workbench">
              <div className="profile-pitch-box">
                <h3 className="profile-pitch-title">The Problem</h3>
                <p className="profile-pitch-text">
                  {pitch.problem || <span style={{ color: 'var(--muted)', fontStyle: 'italic' }}>Not provided yet.</span>}
                </p>
                
                <h3 className="profile-pitch-title">The Solution</h3>
                <p className="profile-pitch-text">
                  {pitch.solution || <span style={{ color: 'var(--muted)', fontStyle: 'italic' }}>Not provided yet.</span>}
                </p>
                
                <h3 className="profile-pitch-title">What We Need</h3>
                <p className="profile-pitch-text" style={{ marginBottom: 0 }}>
                  {pitch.ask || <span style={{ color: 'var(--muted)', fontStyle: 'italic' }}>Not provided yet.</span>}
                </p>
              </div>
            </Window>

            {milestones.length > 0 && (
              <Window title="Build Timeline" meta="Milestones">
                <DotList 
                  items={milestones.map((m, i) => (
                    <span key={i}><b>{m.date}:</b> {m.title}</span>
                  ))} 
                />
              </Window>
            )}
          </div>

          {/* Sidebar Column */}
          <div style={{ display: 'grid', gap: 'var(--sp-4)' }}>
            <Window title="Project Status">
              <p style={{ fontFamily: 'var(--font)', fontSize: 'var(--fs-md)', marginBottom: 'var(--sp-2)' }}>
                Current Stage:
              </p>
              <Badge tone={project.stage === 'Final' ? 'ok' : 'warn'} filled>
                {project.stage}
              </Badge>
              <p style={{ fontFamily: 'var(--font)', fontSize: 'var(--fs-md)', color: 'var(--muted)', marginTop: 'var(--sp-4)' }}>
                {wb.goal || project.description}
              </p>
            </Window>

            {tests.length > 0 && (
              <Window title="Tests" meta={`${tests.filter(t => t.pass).length} / ${tests.length} passed`}>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 'var(--sp-2)' }}>
                  {tests.map((t, i) => (
                    <li key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontFamily: 'var(--font)', fontSize: 'var(--fs-sm)' }}>
                      <span>{t.name}</span>
                      <Badge kind="stat" tone={t.pass ? 'ok' : 'bad'}>{t.pass ? 'Pass' : 'Fail'}</Badge>
                    </li>
                  ))}
                </ul>
              </Window>
            )}

            {parts.length > 0 && (
              <Window title="Bill of Materials">
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 'var(--sp-2)' }}>
                  {parts.map((p, i) => (
                    <li key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontFamily: 'var(--font)', fontSize: 'var(--fs-sm)' }}>
                      <span>{p.name}</span>
                      <span style={{ color: p.status === 'Owned' ? 'var(--c-ok)' : 'var(--c-warn)', fontWeight: 'bold' }}>{p.status}</span>
                    </li>
                  ))}
                </ul>
              </Window>
            )}
          </div>

        </div>
      </Block>
    </Wrap>
  );
}