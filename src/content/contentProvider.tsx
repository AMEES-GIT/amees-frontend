import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { Wrap, Block } from '../components/containers/Layout';
import { Button } from '../components/primitives/Button';
import type { ContentSource } from './source';
import type { SiteContent } from './types';
import { parseFeatured, type ParsedFeatured } from './selectors';

type State =
  | { status: 'loading' }
  | { status: 'error' }
  | { status: 'ready'; content: SiteContent };

// Added an update function to the context
interface ContentContextType {
  content: SiteContent;
  updateContent: (newContent: Partial<SiteContent>) => void;
}

const ContentContext = createContext<ContentContextType | null>(null);

export function ContentProvider({ source, children }: { source: ContentSource; children: ReactNode }) {
  const [state, setState] = useState<State>({ status: 'loading' });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    source.load().then(
      (content) => !cancelled && setState({ status: 'ready', content }),
      () => !cancelled && setState({ status: 'error' }),
    );
    return () => {
      cancelled = true;
    };
  }, [source, attempt]);

  const updateContent = (newContent: Partial<SiteContent>) => {
    setState(prev => {
      if (prev.status !== 'ready') return prev;
      // Save to localStorage so it persists across reloads (mock backend)
      const merged = { ...prev.content, ...newContent };
      try {
        localStorage.setItem('amees_content_override', JSON.stringify(merged));
      } catch {}
      return { ...prev, content: merged };
    });
  };

  if (state.status === 'loading') {
    return (
      <Wrap>
        <Block>
          <p role="status">Loading</p>
        </Block>
      </Wrap>
    );
  }

  if (state.status === 'error') {
    return (
      <Wrap>
        <Block>
          <p role="alert">Could not load the site content. Check your connection and try again.</p>
          <Button onClick={() => { setState({ status: 'loading' }); setAttempt((n) => n + 1); }}>
            Try again
          </Button>
        </Block>
      </Wrap>
    );
  }

  return (
    <ContentContext.Provider value={{ content: state.content, updateContent }}>
      {children}
    </ContentContext.Provider>
  );
}

export function useContent() {
  const ctx = useContext(ContentContext);
  if (!ctx) throw new Error('useContent must be used inside ContentProvider');
  return ctx.content;
}

export function useUpdateContent() {
  const ctx = useContext(ContentContext);
  if (!ctx) throw new Error('useUpdateContent must be used inside ContentProvider');
  return ctx.updateContent;
}

export function useFeatured(): ParsedFeatured {
  const { featured } = useContent();
  return useMemo(() => parseFeatured(featured), [featured]);
}