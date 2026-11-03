import { useState, useMemo } from 'react';
import { Wrap, Block } from '../components/containers/Layout';
import { PageHeader } from '../components/containers/PageHeader';
import { Window } from '../components/containers/Window';
import { ChipGroup } from '../components/primitives/ChipGroup';
import { TextInput } from '../components/primitives/TextInput';
import { Button } from '../components/primitives/Button';
import { OpportunityCard } from '../components/opportunities/OpportunityCard';
import { useNow } from '../lib/useNow';
import { useContent } from '../content/contentProvider';
import type { Opportunity } from '../content/types';
import './OpportunitiesPage.css';

export function OpportunitiesPage() {
  const content = useContent();
  const now = useNow(60000);

  const [type, setType] = useState('All');
  const [query, setQuery] = useState('');
  const [savedOnly, setSavedOnly] = useState(false);
  const [savedIds, setSavedIds] = useState<string[]>([]);

  const opps = content.opportunities || [];

  const types: { value: string; label: string }[] = useMemo(() => {
    const unique = Array.from(new Set(opps.map((o: Opportunity) => o.type)));
    return [
      { value: 'All', label: 'All types' },
      ...unique.map(t => ({ value: t, label: t }))
    ];
  }, [opps]);

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    return opps.filter((o: Opportunity) => {
      if (type !== 'All' && o.type !== type) return false;
      if (savedOnly && !savedIds.includes(o.id)) return false;
      if (q && !(`${o.name} ${o.description}`.toLowerCase().includes(q))) return false;
      return true;
    }).sort((a: Opportunity, b: Opportunity) => {
      // Sort by Open first, then by closest deadline
      const aClosed = new Date(a.endDate).getTime() < now.getTime();
      const bClosed = new Date(b.endDate).getTime() < now.getTime();
      if (aClosed !== bClosed) return aClosed ? 1 : -1;
      return new Date(a.endDate).getTime() - new Date(b.endDate).getTime();
    });
  }, [opps, type, query, savedOnly, savedIds, now]);

  const toggleSave = (id: string) => {
    setSavedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  return (
    <Wrap>
      <Block>
        <PageHeader 
          className="opp-header"
          kicker={content.pages.opportunities.kicker} 
          title={content.pages.opportunities.title} 
          lede={content.pages.opportunities.lede} 
        />
      </Block>

      <Block>
        <Window title="Filter" meta={`${filtered.length} opportunities`}>
          <div className="opp-filters">
            <ChipGroup label="Type" items={types} value={type} onChange={setType} />
            <div className="opp-search-row">
              <div className="opp-search-input">
                <TextInput value={query} onChange={setQuery} placeholder="Search by name or description" />
              </div>
              <Button pressed={savedOnly} onClick={() => setSavedOnly(!savedOnly)}>
                Saved only
              </Button>
            </div>
          </div>
        </Window>
      </Block>

      <Block>
        {filtered.length > 0 ? (
          <div className="opp-grid" style={{ display: 'grid', gap: 'var(--sp-4)', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
            {filtered.map((opp: Opportunity) => (
              <OpportunityCard
                key={opp.id}
                opp={opp}
                now={now}
                saved={savedIds.includes(opp.id)}
                onToggleSave={toggleSave}
              />
            ))}
          </div>
        ) : (
          <div className="opp-empty" style={{ textAlign: 'center', padding: 'var(--sp-6)', color: 'var(--muted)' }}>
            No opportunities match these filters.
          </div>
        )}
      </Block>
    </Wrap>
  );
}