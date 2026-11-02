import { useCallback, useEffect, useMemo, useState } from 'react';
import { Header } from './components/shell/Header';
import { Footer } from './components/shell/Footer';
import { SearchBox } from './components/shell/SearchBox';
import { RequireAuth } from './components/admin/requireAuth';

// Pages
import { HomePage } from './pages/HomePage';
import { EventsPage } from './pages/EventsPage';
import { CalendarPage } from './pages/CalendarPage';
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

type Theme = 'light' | 'dark';

function pageFromHash(): PageId {
  const hash = window.location.hash.replace('#', '');
  const [id] = hash.split('/');
  return NAV.some((n) => n.key === id) || id === 'project' || id === 'search' || id === 'login' || id === 'admin'
    ? (id as PageId)
    : 'home';
}

function readTheme(): Theme {
  return document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';
}

export default function App() {
  const content = useContent();
  const [page, setPage] = useState<PageId>(pageFromHash);

  const [projectId, setProjectId] = useState<string | null>(() => {
    const hash = window.location.hash.replace('#', '');
    const parts = hash.split('/');
    return parts[0] === 'project' && parts[1] ? parts[1] : null;
  });

  const [theme, setTheme] = useState<Theme>(readTheme);
  const [query, setQuery] = useState('');

  const headerNav = useMemo(
    () =>
      HEADER_NAV.some((n) => n.key === 'home')
        ? HEADER_NAV
        : [{ key: 'home', label: 'Home', href: '#home' }, ...HEADER_NAV],
    [],
  );

  useEffect(() => {
    const onHash = () => {
      const hash = window.location.hash.replace('#', '');
      const parts = hash.split('/');

      if (parts[0] === 'project' && parts[1]) {
        setProjectId(parts[1]);
      } else {
        setProjectId(null);
      }

      setPage(pageFromHash());
      window.scrollTo(0, 0);
    };

    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  useEffect(() => {
    const label = NAV.find((n) => n.key === page)?.label ?? 'Home';
    document.title = `${label} · AMEES`;
  }, [page]);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  const onNavigate = useCallback((id: PageId) => {
    window.location.hash = id;
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
    if (NAV.some((n) => String(n.key) === 'search')) window.location.hash = 'search';
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
      <Footer {...footerProps(content)} />
    </>
  );
}