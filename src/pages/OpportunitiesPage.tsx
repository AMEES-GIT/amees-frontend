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
  const [level, setLevel] = useState('All');
  const [query, setQuery] = useState('');
  const [savedOnly, setSavedOnly] = useState(false);
  const [savedIds, setSavedIds] = useState<string[]>([]);

  const opps = content.opportunities || [];

  // Explicitly typed to satisfy ChipGroup
  const types: { value: string; label: string }[] = useMemo(() => {
    const unique = Array.from(new Set(opps.map((o: Opportunity) => o.type)));
    return [
      { value: 'All', label: 'All types' },
      ...unique.map(t => ({ value: t, label: t }))
    ];
  }, [opps]);

  const levels = [
    { value: 'All', label: 'All levels' },
    { value: '100', label: '100' },
    { value: '200', label: '200' },
    { value: '300', label: '300' },
    { value: '400', label: '400' },
    { value: '500', label: '500' },
  ];

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    return opps.filter((o: Opportunity) => {
      if (type !== 'All' && o.type !== type) return false;
      if (level !== 'All' && !o.levels.includes(Number(level))) return false;
      if (savedOnly && !savedIds.includes(o.id)) return false;
      if (q && !(`${o.title} ${o.org}`.toLowerCase().includes(q))) return false;
      return true;
    }).sort((a: Opportunity, b: Opportunity) => {
      const aClosed = new Date(`${a.deadline}T23:59:59+01:00`).getTime() < now.getTime();
      const bClosed = new Date(`${b.deadline}T23:59:59+01:00`).getTime() < now.getTime();
      if (aClosed !== bClosed) return aClosed ? 1 : -1;
      return a.deadline.localeCompare(b.deadline);
    });
  }, [opps, type, level, query, savedOnly, savedIds, now]);

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
        <Window title="Filter" meta={`${filtered.length} of ${opps.length}`}>
          <div className="opp-filters">
            <ChipGroup
              label="Type"
              items={types}
              value={type}
              onChange={setType}
            />
            <ChipGroup
              label="Level"
              items={levels}
              value={level}
              onChange={setLevel}
            />
            
            <div className="opp-search-row">
              <div className="opp-search-input">
                <TextInput value={query} onChange={setQuery} placeholder="Search title or organisation" />
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
          <div className="opp-grid">
            {filtered.map((opp: Opportunity) => (
              <OpportunityCard
                key={opp.id}
                opp={{
                  id: opp.id,
                  ty: opp.type,
                  t: opp.title,
                  org: opp.org,
                  lv: opp.levels,
                  dl: opp.deadline,
                  loc: opp.location,
                  d: opp.description
                }}
                now={now}
                saved={savedIds.includes(opp.id)}
                onToggleSave={toggleSave}
              />
            ))}
          </div>
        ) : (
          <div className="opp-empty">
            No opportunities match these filters.
          </div>
        )}
      </Block>
    </Wrap>
  );
}