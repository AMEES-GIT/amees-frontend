import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { ContentProvider } from './content/contentProvider';
import { httpSource } from './content/source';
import { API_BASE } from './lib/apiBase';

import '@fontsource/space-grotesk/400.css';
import '@fontsource/space-grotesk/700.css';
import './styles/tokens.css';
import './styles/base.css';

// One-time redirect: /#events → /events so old bookmarks keep working.
if (window.location.hash) {
  const legacy = window.location.hash.slice(1).replace(/^\/?/, '');
  const target = legacy && legacy !== 'home' ? `/${legacy}` : '/';
  window.history.replaceState({}, '', target);
}

const API_SOURCE = httpSource(`${API_BASE}/api/content`);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ContentProvider source={API_SOURCE}>
      <App />
    </ContentProvider>
  </StrictMode>,
);