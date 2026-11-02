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

  const { workbenchData } = project;

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
                <p className="profile-pitch-text">{workbenchData.pitch.problem}</p>
                
                <h3 className="profile-pitch-title">The Solution</h3>
                <p className="profile-pitch-text">{workbenchData.pitch.solution}</p>
                
                <h3 className="profile-pitch-title">What We Need</h3>
                <p className="profile-pitch-text" style={{ marginBottom: 0 }}>{workbenchData.pitch.ask}</p>
              </div>
            </Window>

            <Window title="Build Timeline" meta="Milestones">
              <DotList 
                items={workbenchData.milestones.map(m => (
                  <span><b>{m.date}:</b> {m.title}</span>
                ))} 
              />
            </Window>
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
                {workbenchData.goal}
              </p>
            </Window>

            <Window title="Tests" meta={`${workbenchData.tests.filter(t => t.pass).length} / ${workbenchData.tests.length} passed`}>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 'var(--sp-2)' }}>
                {workbenchData.tests.map(t => (
                  <li key={t.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontFamily: 'var(--font)', fontSize: 'var(--fs-sm)' }}>
                    <span>{t.name}</span>
                    <Badge kind="stat" tone={t.pass ? 'ok' : 'bad'}>{t.pass ? 'Pass' : 'Fail'}</Badge>
                  </li>
                ))}
              </ul>
            </Window>

            <Window title="Bill of Materials">
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 'var(--sp-2)' }}>
                {workbenchData.parts.map(p => (
                  <li key={p.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontFamily: 'var(--font)', fontSize: 'var(--fs-sm)' }}>
                    <span>{p.name}</span>
                    <span style={{ color: p.status === 'Owned' ? 'var(--c-ok)' : 'var(--c-warn)', fontWeight: 'bold' }}>{p.status}</span>
                  </li>
                ))}
              </ul>
            </Window>
          </div>

        </div>
      </Block>
    </Wrap>
  );
}