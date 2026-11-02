import './ActivityHeatmap.css';

export interface ActivityHeatmapProps {
  /** An array of 56 numbers representing activity counts (oldest to newest). */
  counts: readonly number[];
  className?: string;
}

export function ActivityHeatmap({ counts, className }: ActivityHeatmapProps) {
  // Ensure we always render exactly 56 cells (8 weeks * 7 days)
  const safeCounts = Array.from({ length: 56 }, (_, i) => counts[i] || 0);
  const total = safeCounts.reduce((a, b) => a + b, 0);

  return (
    <div className={['amees-heatmap', className].filter(Boolean).join(' ')}>
      <div className="amees-heatmap__header">
        <span className="amees-heatmap__title">Activity (last 8 weeks)</span>
        <span className="amees-heatmap__summary">{total} updates logged</span>
      </div>
      
      <div className="amees-heatmap__grid" aria-label={`Activity heatmap showing ${total} updates over the last 8 weeks`}>
        {safeCounts.map((count, i) => {
          let level = 0;
          if (count > 0 && count <= 2) level = 1;
          else if (count > 2 && count <= 5) level = 2;
          else if (count > 5) level = 3;

          return (
            <div
              key={i}
              className={`amees-heatmap__cell amees-heatmap__cell--l${level}`}
              title={`${count} update${count === 1 ? '' : 's'}`}
            />
          );
        })}
      </div>
    </div>
  );
}