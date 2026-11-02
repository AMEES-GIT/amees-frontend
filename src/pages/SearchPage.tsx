// src/pages/SearchPage.tsx
import { useEffect, useState } from 'react';
import { Wrap, Block } from '../components/containers/Layout';
import { PageHeader } from '../components/containers/PageHeader';
import { Window } from '../components/containers/Window';
import { Badge } from '../components/primitives/Badge';
import { Button } from '../components/primitives/Button';
import { SearchBox } from '../components/shell/SearchBox';
import { API_BASE } from '../lib/apiBase';
import './SearchPage.css';

interface SearchResult {
  type: 'project' | 'archive' | 'event' | 'sponsor-tier';
  id: string;
  title: string;
  subtitle: string;
  description: string;
  href: string | null;
  meta?: string;
}

export function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    const runFromUrl = () => {
      const params = new URLSearchParams(window.location.search);
      const q = (params.get('q') ?? '').trim();
      setQuery(q);
      if (q) runSearch(q);
      else {
        setResults([]);
        setSearched(false);
      }
    };
    runFromUrl();
    window.addEventListener('popstate', runFromUrl);
    return () => window.removeEventListener('popstate', runFromUrl);
  }, []);

  const runSearch = async (term: string) => {
    setLoading(true);
    setSearched(true);
    try {
      const res = await fetch(`${API_BASE}/api/search?q=${encodeURIComponent(term)}`);
      const data = await res.json();
      setResults(data.results ?? []);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const submit = (q: string) => {
    const trimmed = q.trim();
    if (!trimmed) return;
    window.history.pushState({}, '', `/search?q=${encodeURIComponent(trimmed)}`);
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  // ---- Empty state: no query yet ----
  if (!searched) {
    return (
      <Wrap>
        <Block>
          <PageHeader
            kicker="Search"
            title="Search AMEES"
            lede="Projects, study files, events, and sponsor tiers — all in one place."
          />
        </Block>
        <Block>
          <SearchBox
            variant="large"
            value={query}
            onChange={setQuery}
            onSubmit={submit}
            placeholder="Try “wired”, “MCE 301”, or a builder’s name"
          />
        </Block>
      </Wrap>
    );
  }

  // ---- Results state ----
  return (
    <Wrap>
      <Block>
        <PageHeader
          kicker="Search"
          title={`Results for "${query}"`}
          lede={`${results.length} result${results.length === 1 ? '' : 's'}.`}
        />
      </Block>

      <Block>
        <SearchBox
          variant="large"
          value={query}
          onChange={setQuery}
          onSubmit={submit}
          placeholder="Refine your search…"
        />
      </Block>

      <Block>
        {loading && <p className="search-muted">Searching…</p>}

        {!loading && results.length === 0 && (
          <Window title="No results" meta="empty">
            <p className="search-muted">
              Nothing matched <strong>“{query}”</strong>. Try a broader term — a
              course code, a project name, or a builder.
            </p>
          </Window>
        )}

        {!loading && results.length > 0 && (
          <div className="search-results">
            {results.map((r) => (
              <Window key={`${r.type}-${r.id}`} title={r.title} meta={r.type}>
                <div className="search-result">
                  <div>
                    <p className="search-result__subtitle">{r.subtitle}</p>
                    <p className="search-result__desc">{r.description}</p>
                  </div>
                  <div className="search-result__actions">
                    {r.meta && <Badge tone="neutral" kind="tag">{r.meta}</Badge>}
                    {r.href && (
                      <Button
                        as="a"
                        href={r.href}
                        {...(r.href.startsWith('http')
                          ? { target: '_blank', rel: 'noopener noreferrer' }
                          : {})}
                        size="sm"
                        variant="primary"
                      >
                        {r.type === 'archive' ? 'Download' : 'Open'}
                      </Button>
                    )}
                  </div>
                </div>
              </Window>
            ))}
          </div>
        )}
      </Block>
    </Wrap>
  );
}