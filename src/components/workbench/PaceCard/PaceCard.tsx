import { Window } from '../../containers/Window';
import { StatGrid, StatTile } from '../../primitives/StatTile';
import './PaceCard.css';

export interface PaceCardProps {
  daysLeft: number;
  tasksLeft: number;
  pace: number;
  streakWeeks: number;
  openBlockers: number;
  className?: string;
}

export function PaceCard({
  daysLeft,
  tasksLeft,
  pace,
  streakWeeks,
  openBlockers,
  className,
}: PaceCardProps) {
  return (
    <Window title="Pace to demo day" meta="3 Dec, 5pm" className={className}>
      <StatGrid>
        <StatTile label="Days left" value={String(daysLeft)} highlight />
        <StatTile label="Tasks left" value={String(tasksLeft)} />
        <StatTile label="Needed pace" value={`${pace.toFixed(1)} /day`} />
        <StatTile label="Update streak" value={`${streakWeeks} wk`} />
        <StatTile label="Open blockers" value={String(openBlockers)} />
      </StatGrid>
    </Window>
  );
}