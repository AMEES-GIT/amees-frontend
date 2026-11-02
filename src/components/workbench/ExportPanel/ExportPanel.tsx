import { Button } from '../../primitives/Button';
import { DotList } from '../../containers/DotList';
import './ExportPanel.css';

export interface ExportPanelProps {
  /** The generated report string (Markdown or JSON). */
  exportData: string;
  /** List of missing items or warnings preventing a perfect export. */
  gaps?: readonly string[];
  onCopy: () => void;
  className?: string;
}

export function ExportPanel({ exportData, gaps = [], onCopy, className }: ExportPanelProps) {
  return (
    <div className={['amees-export-panel', className].filter(Boolean).join(' ')}>
      {gaps.length > 0 && (
        <div className="amees-export-panel__gaps">
          <p className="amees-export-panel__gaps-title">Completeness Check</p>
          <DotList items={gaps} />
        </div>
      )}

      <div className="amees-export-panel__preview">
        <textarea
          className="amees-export-panel__textarea"
          readOnly
          value={exportData}
          rows={12}
          aria-label="Project report text"
        />
      </div>

      <div className="amees-export-panel__actions">
        <Button variant="primary" onClick={onCopy}>
          Copy report
        </Button>
      </div>
    </div>
  );
}