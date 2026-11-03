import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { io } from 'socket.io-client';
import { API_BASE } from '../lib/apiBase';
import type { ContentSource } from './source';
import type { SiteContent } from './types';
import { LoadingOverlay } from '../components/shell/LoadingOverlay';
import { ErrorPage } from '../pages/ErrorPage';

type State =
  | { status: 'loading' }
  | { status: 'error' }
  | { status: 'ready'; content: SiteContent };

interface ContentContextType {
  content: SiteContent;
  refresh: () => void;
}

const ContentContext = createContext<ContentContextType | null>(null);

export function ContentProvider({ source, children }: { source: ContentSource; children: ReactNode }) {
  const [state, setState] = useState<State>({ status: 'loading' });
  const [attempt, setAttempt] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);
  const [showOverlay, setShowOverlay] = useState(true);

  const refresh = () => setRefreshKey((k) => k + 1);

  // Initial fetch
  useEffect(() => {
    let cancelled = false;
    source.load().then(
      (content) => {
        if (!cancelled) {
          setState({ status: 'ready', content });
          setShowOverlay(false);
        }
      },
      () => !cancelled && setState({ status: 'error' }),
    );
    return () => { cancelled = true; };
  }, [source, attempt, refreshKey]);

  // WebSocket Connection for Real-Time Updates
  useEffect(() => {
    const socket = io(API_BASE, { withCredentials: false });
    
    socket.on('content-updated', () => {
      console.log('🔄 Real-time update received, refreshing content...');
      refresh();
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  if (state.status === 'error') {
    return (
      <ErrorPage 
        onRetry={() => { 
          setState({ status: 'loading' }); 
          setShowOverlay(true); 
          setAttempt((n) => n + 1); 
        }} 
      />
    );
  }

  return (
    <>
      {showOverlay && (
        <LoadingOverlay
          open={showOverlay}
          minMs={1500}
          ready={state.status === 'ready'}
          onDone={() => setShowOverlay(false)}
        />
      )}
      
      {state.status === 'ready' && (
        <ContentContext.Provider value={{ content: state.content, refresh }}>
          {children}
        </ContentContext.Provider>
      )}
    </>
  );
}

export function useContent(): SiteContent {
  const c = useContext(ContentContext);
  if (!c) throw new Error('useContent must be used inside ContentProvider');
  return c.content;
}

export function useRefreshContent(): () => void {
  const c = useContext(ContentContext);
  if (!c) throw new Error('useRefreshContent must be used inside ContentProvider');
  return c.refresh;
}

export interface ParsedFeatured extends Omit<SiteContent['featured'], 'start' | 'end'> {
  start: Date;
  end: Date;
}

export function useFeatured(): ParsedFeatured | null {
  const { featured } = useContent();
  
  return useMemo(() => {
    if (!featured || !featured.title || !featured.start || !featured.end) return null;
    const start = new Date(featured.start);
    const end = new Date(featured.end);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) return null;
    return { ...featured, start, end };
  }, [featured]);
}