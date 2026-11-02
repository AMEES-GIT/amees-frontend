export interface ProjectStats {
  entries: { ts: number; type: string; resolved?: boolean }[];
  tasks: { col: string }[];
  parts: { status: string }[];
  tests: { pass: boolean }[];
}

export function calculateHealth(p: ProjectStats, now: number) {
  const day = 86400000;
  
  // 1. Updates (40 pts max): 1 per day for the last 7 days
  const recentUpdates = p.entries.filter(e => e.ts >= now - 7 * day).length;
  const scoreUpdates = Math.min(recentUpdates, 4) / 4 * 40;

  // 2. Tasks (25 pts max)
  const totalTasks = p.tasks.length;
  const doneTasks = p.tasks.filter(t => t.col === 'done').length;
  const scoreTasks = totalTasks > 0 ? (doneTasks / totalTasks) * 25 : 0;

  // 3. Milestones (15 pts max): 4 is a perfect score
  const milestones = p.entries.filter(e => e.type === 'milestone').length;
  const scoreMilestones = Math.min(milestones, 4) / 4 * 15;

  // 4. Parts (10 pts max)
  const totalParts = p.parts.length;
  const ownedParts = p.parts.filter(x => x.status === 'Owned').length;
  const scoreParts = totalParts > 0 ? (ownedParts / totalParts) * 10 : 0;

  // 5. Tests (10 pts max)
  const totalTests = p.tests.length;
  const passedTests = p.tests.filter(t => t.pass).length;
  const scoreTests = totalTests > 0 ? (passedTests / totalTests) * Math.min(totalTests, 3) / 3 * 10 : 0;

  // Penalty: -5 per blocker open for >3 days, capped at -15
  const oldBlockers = p.entries.filter(e => 
    e.type === 'blocker' && !e.resolved && (now - e.ts) > 3 * day
  ).length;
  const penalty = Math.min(oldBlockers * 5, 15);

  const totalScore = Math.max(0, Math.round(scoreUpdates + scoreTasks + scoreMilestones + scoreParts + scoreTests - penalty));

  return {
    total: totalScore,
    tier: totalScore >= 70 ? 'On track' : totalScore >= 35 ? 'Steady' : 'Stalled',
    breakdown: [
      { label: 'Updates in last 7 days', score: scoreUpdates, max: 40 },
      { label: 'Tasks done', score: scoreTasks, max: 25 },
      { label: 'Milestones', score: scoreMilestones, max: 15 },
      { label: 'Parts in hand', score: scoreParts, max: 10 },
      { label: 'Tests passed', score: scoreTests, max: 10 },
    ],
    penalty
  };
}