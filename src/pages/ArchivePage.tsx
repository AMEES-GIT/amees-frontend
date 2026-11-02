import { useState, useMemo } from 'react';
import { Wrap, Block } from '../components/containers/Layout';
import { PageHeader } from '../components/containers/PageHeader';
import { Window } from '../components/containers/Window';
import { DataTable, type DataTableColumn } from '../components/containers/DataTable';
import { ChipGroup } from '../components/primitives/ChipGroup';
import { TextInput } from '../components/primitives/TextInput';
import { Select } from '../components/primitives/Select';
import { Button } from '../components/primitives/Button';
import { FileTile } from '../components/foundations/FileTile';
import { EmptyState } from '../components/containers/EmptyState';
import { useContent } from '../content/contentProvider';
import type { ArchiveFile } from '../content/types';
import './ArchivePage.css';

export function ArchivePage() {
  const content = useContent();
  const [level, setLevel] = useState('all');
  const [query, setQuery] = useState('');
  const [kind, setKind] = useState('all');

  // Extract unique kinds from the content for the dropdown
  const kinds = useMemo(() => {
    return Array.from(new Set(content.archive.map(f => f.kind)));
  }, [content.archive]);

  const levels = [
    { value: 'all', label: 'All levels' },
    { value: '100', label: '100' },
    { value: '200', label: '200' },
    { value: '300', label: '300' },
    { value: '400', label: '400' },
    { value: '500', label: '500' },
  ];

  const kindOptions = [
    { value: 'all', label: 'All types' },
    ...kinds.map(k => ({ value: k, label: k }))
  ];

  // Filter logic
  const filteredFiles = useMemo(() => {
    const q = query.toLowerCase().trim();
    return content.archive.filter(f => {
      if (level !== 'all' && String(f.level) !== level) return false;
      if (kind !== 'all' && f.kind !== kind) return false;
      if (q && !(`${f.title} ${f.course}`.toLowerCase().includes(q))) return false;
      return true;
    });
  }, [content.archive, level, kind, query]);

  const hasSamples = filteredFiles.some(f => f.sample);

  const clearFilters = () => {
    setLevel('all');
    setKind('all');
    setQuery('');
  };

  // Define Table Columns
  const columns: DataTableColumn<ArchiveFile>[] = [
    { 
      key: 'ext', 
      label: '', 
      width: 56, 
      render: (r) => <FileTile type={r.ext} /> 
    },
    { 
      key: 'title', 
      label: 'Title', 
      render: (r) => (
        <div>
          <b>{r.title}</b>
          <div style={{ fontSize: 'var(--fs-sm)', color: 'var(--muted)', marginTop: 2 }}>
            {r.kind}
          </div>
        </div>
      ) 
    },
    { key: 'course', label: 'Course' },
    { key: 'level', label: 'Level', align: 'right' },
    { key: 'year', label: 'Year', align: 'right' },
    { key: 'size', label: 'Size', align: 'right' },
    {
      key: 'action',
      label: '',
      align: 'right',
      render: () => <Button size="sm">Open</Button>,
    }
  ];

  return (
    <Wrap>
      <Block>
        <PageHeader 
          className="archive-header"
          kicker={content.pages.archive.kicker} 
          title={content.pages.archive.title} 
          lede={content.pages.archive.lede} 
        />
      </Block>

      <Block>
        <Window title="C:\AMEES\archive" meta={`${filteredFiles.length} of ${content.archive.length} files`}>
          
          <div className="archive-filters">
            <div style={{ display: 'flex', gap: 'var(--sp-3)', flexWrap: 'wrap', alignItems: 'flex-end' }}>
              <div style={{ flex: '1 1 240px' }}>
                <TextInput 
                  value={query} 
                  onChange={setQuery} 
                  placeholder="Search by course code or title" 
                />
              </div>
              <div style={{ flex: '0 1 200px' }}>
                <Select 
                  options={kindOptions} 
                  value={kind} 
                  onChange={setKind} 
                />
              </div>
            </div>
            
            <ChipGroup 
              label="Level"
              showLabel={false}
              items={levels}
              value={level}
              onChange={setLevel}
            />
          </div>

          <DataTable 
            columns={columns}
            rows={filteredFiles}
            rowKey={(r) => r.id}
            empty={
              <EmptyState 
                title="No files match" 
                text="Clear a filter or search a different course code." 
                action={<Button onClick={clearFilters}>Clear filters</Button>}
              />
            }
          />

          {hasSamples && (
            <p className="archive-note">
              Sample listing. Course names and files show here once the archive is connected.
            </p>
          )}
        </Window>
      </Block>
    </Wrap>
  );
}