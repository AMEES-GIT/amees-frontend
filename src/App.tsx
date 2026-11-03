import { useCallback, useEffect, useMemo, useState, lazy, Suspense } from 'react';
import { Header } from './components/shell/Header';
import { Footer } from './components/shell/Footer';
import { SearchBox } from './components/shell/SearchBox';
import { RequireAuth } from './components/admin/RequireAuth';

import { HomePage } from './pages/HomePage';
import { EventsPage } from './pages/EventsPage';
import { CalendarPage } from './pages/CalendarPage';
import { CalendarEventPage } from './pages/CalendarEventPage';
import { ArchivePage } from './pages/ArchivePage';
import { WorkbenchPage } from './pages/WorkbenchPage';
import { ToolboxPage } from './pages/ToolboxPage';
import { OpportunitiesPage } from './pages/OpportunitiesPage';
import { ProjectsPage } from './pages/ProjectsPage';
import { SponsorsPage } from './pages/SponsorsPage';
import { AboutPage } from './pages/AboutPage';
import { ProjectProfilePage } from './pages/ProjectProfilePage';
import { LoginPage } from './pages/LoginPage';
import { AdminPage } from './pages/AdminPage';
import { NotFoundPage } from './pages/NotFoundPage';

import { NAV, HEADER_NAV } from './nav';
import { THEME_KEY } from './styles/tokens';
import { useContent } from './content/contentProvider';
import { footerProps } from './content/selectors';
import type { PageId } from './pages/types';

const FooterRunner = lazy(() =>
  import('./components/shell/Footer/FooterRunner').then((m) => ({
    default: m.FooterRunner,
  })),
);

type Theme = 'light' | 'dark';

const KNOWN_EXTRA = ['project', 'event', 'search', 'login', 'admin'] as const;

function pageFromPath(): PageId {
  const path = window.location.pathname.replace(/^\/|\/$/g, '');
  if (!path) return 'home';
  const [id] = path.split('/');
  if (NAV.some((n) => n.key === id)) return id as PageId;
  if ((KNOWN_EXTRA as readonly string[]).includes(id)) return id as PageId;
  return 'not-found' as PageId;
}

function projectIdFromPath(): string | null {
  const parts = window.location.pathname.replace(/^\/|\/$/g, '').split('/');
  return parts[0] === 'project' && parts[1] ? parts[1] : null;
}

function eventIdFromPath(): string | null {
  const parts = window.location.pathname.replace(/^\/|\/$/g, '').split('/');
  return parts[0] === 'event' && parts[1] ? parts[1] : null;
}

function readTheme(): Theme {
  return document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';
}

export default function App() {
  const content = useContent();
  const [page, setPage] = useState<PageId>(pageFromPath);
  const [projectId, setProjectId] = useState<string | null>(projectIdFromPath);
  const [eventId, setEventId] = useState<string | null>(eventIdFromPath);

  const [theme, setTheme] = useState<Theme>(readTheme);
  const [query, setQuery] = useState('');

  const headerNav = useMemo(
    () =>
      HEADER_NAV.some((n) => n.key === 'home')
        ? HEADER_NAV
        : [{ key: 'home', label: 'Home', href: '/' }, ...HEADER_NAV],
    [],
  );

  // React to back/forward and to any popstate we dispatch ourselves
  useEffect(() => {
    const onPop = () => {
      setPage(pageFromPath());
      setProjectId(projectIdFromPath());
      setEventId(eventIdFromPath());
      window.scrollTo(0, 0);
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  // Intercept internal clicks so <a href="/events"> navigates without a full reload
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      if (e.button !== 0) return;

      const anchor = (e.target as HTMLElement | null)?.closest('a');
      if (!anchor || anchor.target === '_blank' || anchor.hasAttribute('download')) return;

      const href = anchor.getAttribute('href');
      if (!href) return;

      // Legacy #hash links from CMS content
      if (href.startsWith('#')) {
        e.preventDefault();
        const raw = href.slice(1).replace(/^\/?/, '');
        if (!raw || raw === 'home') {
          window.history.pushState({}, '', '/');
        } else {
          const target = raw.startsWith('project/') || raw.startsWith('event/') ? `/${raw}` : `/${raw.split('/')[0]}`;
          window.history.pushState({}, '', target);
        }
        window.dispatchEvent(new PopStateEvent('popstate'));
        return;
      }

      // Internal path links
      if (!href.startsWith('/') || href.startsWith('//')) return;
      e.preventDefault();
      window.history.pushState({}, '', href);
      window.dispatchEvent(new PopStateEvent('popstate'));
    };

    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);

  useEffect(() => {
    const label = NAV.find((n) => n.key === page)?.label ?? 'AMEES';
    document.title = `${label} · AMEES`;
  }, [page]);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  const onNavigate = useCallback((id: PageId) => {
    window.history.pushState({}, '', id === 'home' ? '/' : `/${id}`);
    window.dispatchEvent(new PopStateEvent('popstate'));
  }, []);

  const onThemeToggle = useCallback(() => {
    const next: Theme = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    try {
      localStorage.setItem(THEME_KEY, next);
    } catch {}
  }, [theme]);

  const onSearchSubmit = useCallback((q: string) => {
    setQuery(q);
    if (NAV.some((n) => String(n.key) === 'search')) {
      window.history.pushState({}, '', '/search');
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
  }, []);

  return (
    <>
      <Header
        nav={headerNav}
        current={page}
        theme={theme}
        onThemeToggle={onThemeToggle}
        search={
          <SearchBox
            value={query}
            onChange={setQuery}
            onSubmit={onSearchSubmit}
            placeholder="Search events, past questions, projects"
          />
        }
      />
      <main id="main">
        {page === 'home' ? (
          <HomePage onNavigate={onNavigate} />
        ) : page === 'events' ? (
          <EventsPage onNavigate={onNavigate} />
        ) : page === 'calendar' ? (
          <CalendarPage />
        ) : page === 'event' && eventId ? (
          <CalendarEventPage eventId={eventId} onNavigate={onNavigate} />
        ) : page === 'archive' ? (
          <ArchivePage />
        ) : page === 'workbench' ? (
          <WorkbenchPage />
        ) : page === 'toolbox' ? (
          <ToolboxPage />
        ) : page === 'opportunities' ? (
          <OpportunitiesPage />
        ) : page === 'projects' ? (
          <ProjectsPage />
        ) : page === 'sponsors' ? (
          <SponsorsPage />
        ) : page === 'about' ? (
          <AboutPage />
        ) : page === 'project' && projectId ? (
          <ProjectProfilePage projectId={projectId} onNavigate={onNavigate} />
        ) : page === 'login' ? (
          <LoginPage />
        ) : page === 'admin' ? (
          <RequireAuth>
            <AdminPage />
          </RequireAuth>
        ) : (
          <NotFoundPage onNavigate={onNavigate} />
        )}
      </main>
      <Footer
        {...footerProps(content)}
        runner={
          <Suspense fallback={null}>
            <FooterRunner />
          </Suspense>
        }
      />
    </>
  );
}