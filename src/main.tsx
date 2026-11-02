import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource/space-grotesk/latin-400.css';
import '@fontsource/space-grotesk/latin-700.css';
import './styles/tokens.css';
import './styles/base.css';
import { ContentProvider } from './content/contentProvider';
import { seedSource } from './content/source';
import App from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ContentProvider source={seedSource}>
      <App />
    </ContentProvider>
  </StrictMode>,
);