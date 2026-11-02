import { Badge } from '../../primitives/Badge';
import './SearchResults.css';

export interface SearchResultItem {
  type: string;
  title: string;
  body: string;
  href: string;
}

export interface SearchResultsProps {
  query: string;
  results: readonly SearchResultItem[];
  /** List of all types to show as filters (e.g. ['All', 'Event', 'Archive']). */
  types?: readonly string[];
  activeType?: string;
  onTypeChange?: (type: string) => void;
  className?: string;
}

// Highlights the query terms in the text using <mark>
function Highlight({ text, query }: { text: string; query: string }) {
  if (!query.trim()) return <>{text}</>;
  // Split on query (case-insensitive), keeping the matches
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  const parts = text.split(regex);
  return (
    <>
      {parts.map((part, i) =>
        regex.test(part) ? <mark key={i}>{part}</mark> : <span key={i}>{part}</span>
      )}
    </>
  );
}

export function SearchResults({
  query,
  results,
  types = ['All'],
  activeType = 'All',
  onTypeChange,
  className,
}: SearchResultsProps) {
  return (
    <div className={['amees-search-results', className].filter(Boolean).join(' ')}>
      <div className="amees-search-results__header">
        <h2 className="amees-search-results__title">
          {results.length} {results.length === 1 ? 'result' : 'results'} for "{query}"
        </h2>
        
        {types.length > 1 && onTypeChange && (
          <div className="amees-search-results__filters" role="group" aria-label="Result types">
            {types.map((t) => (
              <button
                key={t}
                type="button"
                className="amees-search-results__filter-btn"
                aria-pressed={activeType === t}
                onClick={() => onTypeChange(t)}
              >
                {t}
              </button>
            ))}
          </div>
        )}
      </div>

      {results.length === 0 ? (
        <div className="amees-search-results__empty">
          <p>Nothing found. Try a different term or check your spelling.</p>
        </div>
      ) : (
        <div className="amees-search-results__list">
          {results.map((r, i) => (
            <a key={i} href={r.href} className="amees-search-results__item">
              <div className="amees-search-results__type">
                <Badge tone="neutral" kind="type">{r.type}</Badge>
              </div>
              <div className="amees-search-results__content">
                <h3 className="amees-search-results__item-title">
                  <Highlight text={r.title} query={query} />
                </h3>
                <p className="amees-search-results__item-body">
                  <Highlight text={r.body} query={query} />
                </p>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}