import { Wrap, Block } from '../components/containers/Layout';
import { PageHeader } from '../components/containers/PageHeader';
import { Window } from '../components/containers/Window';
import { Badge } from '../components/primitives/Badge';
import { Button } from '../components/primitives/Button';
import { useContent } from '../content/contentProvider';

import './ProjectsPage.css';

export function ProjectsPage() {
  const content = useContent();
  const { projects } = content;

  // Show only projects that the admin has approved for the showcase
  const showcasedProjects = projects.projects.filter(p => p.showcased);

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
        {showcasedProjects.length === 0 ? (
          <Window title="No projects yet" meta="Check back soon">
            <p style={{ fontFamily: 'var(--font)', color: 'var(--muted)' }}>
              There are currently no projects in the showcase.
            </p>
          </Window>
        ) : (
          <div className="exhibit-grid">
            {showcasedProjects.map(project => (
              <a 
                key={project.id} 
                href={`/project/${project.id}`} // Using standard path routing now
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
        )}
      </Block>

      <Block>
        <Window title="Submit a project" tone="gray">
          <p style={{ fontFamily: 'var(--font)', fontSize: 'var(--fs-body)', marginBottom: 'var(--sp-4)' }}>
            Have something you built that solves a real problem? Log into the Workbench to track and submit your project for review.
          </p>
          <Button as="a" href="/workbench" variant="primary">
            Go to Workbench →
          </Button>
        </Window>
      </Block>
    </Wrap>
  );
}