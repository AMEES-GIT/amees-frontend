import { Wrap, Block } from '../components/containers/Layout';
import { PageHeader } from '../components/containers/PageHeader';
import { Window } from '../components/containers/Window';
import { Badge } from '../components/primitives/Badge';
import { Button } from '../components/primitives/Button';
import { useContent } from '../content/contentProvider';
import type { PageId } from './types';

import './ProjectsPage.css';

interface ProjectsPageProps {
  onNavigate: (page: PageId) => void;
}

export function ProjectsPage({ onNavigate }: ProjectsPageProps) {
  const content = useContent();
  const { projects } = content;

  return (
    <Wrap>
      <Block>
        <PageHeader 
          className="exhibit-header"
          kicker={content.pages.projects.kicker} 
          title={content.pages.projects.title} 
          lede={content.pages.projects.lede} 
        />
      </Block>

      <Block>
        <Window title={projects.title} meta={projects.subtitle}>
          <p style={{ fontFamily: 'var(--font)', fontSize: 'var(--fs-body)', margin: 0 }}>
            {projects.submitText}
          </p>
        </Window>
      </Block>

      <Block>
        <div className="exhibit-grid">
          {projects.projects.map(project => (
            // Wrap the whole card in an <a> tag for native keyboard accessibility
            <a 
              key={project.id} 
              href={`#project/${project.id}`}
              style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}
            >
              <Window title={project.title} meta={`By ${project.builder}`}>
                <div className="exhibit-card-content">
                  <p className="exhibit-card-desc">
                    {project.description}
                  </p>
                  
                  <div className="exhibit-card-tags">
                    {project.tags.map(tag => (
                      <Badge key={tag} tone="neutral" kind="tag">
                        {tag}
                      </Badge>
                    ))}
                    <Badge tone={project.stage === 'Final' ? 'ok' : 'warn'} filled>
                      {project.stage}
                    </Badge>
                  </div>
                  
                  {/* The button is now just a visual indicator, the <a> tag handles the click */}
                  <div style={{ marginTop: 'var(--sp-2)' }}>
                    <span className="amees-btn amees-btn--primary amees-btn--sm" style={{ display: 'inline-flex' }}>
                      View Build Profile →
                    </span>
                  </div>
                </div>
              </Window>
            </a>
          ))}
        </div>
      </Block>

      <Block>
        <Window title="Submit a project" tone="gray">
          <p style={{ fontFamily: 'var(--font)', fontSize: 'var(--fs-body)', marginBottom: 'var(--sp-4)' }}>
            Have something you built that solves a real problem? We want to see it.
          </p>
          <Button variant="primary" onClick={() => onNavigate('about')}>
            Contact us now! →
          </Button>
        </Window>
      </Block>
    </Wrap>
  );
}