export interface ExportProjectData {
  name: string;
  track: string;
  goal: string;
  team: string[];
  pitch: { pitch: string; problem: string; works: string; broken: string; ask: string };
  milestones: { title: string; date: string }[];
  tests: { name: string; type: string; result: string }[];
  parts: { name: string; qty: number; status: string }[];
}

export function buildReport(p: ExportProjectData) {
  const L: string[] = [];
  L.push(`# Project Report: ${p.name}`);
  L.push(`**Track:** ${p.track}`);
  L.push(`**Team:** ${p.team.join(', ') || 'Solo'}`);
  L.push('');
  
  if (p.goal) L.push(`**Goal:** ${p.goal}\n`);
  if (p.pitch.pitch) L.push(`**Pitch:** ${p.pitch.pitch}\n`);
  
  if (p.milestones.length > 0) {
    L.push('## Milestones');
    p.milestones.forEach(m => L.push(`- **${m.date}:** ${m.title}`));
    L.push('');
  }

  if (p.tests.length > 0) {
    L.push('## Tests');
    p.tests.forEach(t => L.push(`- ${t.name}: ${t.result}`));
    L.push('');
  }

  if (p.parts.length > 0) {
    L.push('## Parts');
    p.parts.forEach(x => L.push(`- ${x.qty}x ${x.name} (${x.status})`));
    L.push('');
  }

  if (p.pitch.works || p.pitch.broken) {
    L.push('## Current Status');
    if (p.pitch.works) L.push(`**What works:** ${p.pitch.works}`);
    if (p.pitch.broken) L.push(`**What is broken:** ${p.pitch.broken}`);
    L.push('');
  }

  if (p.pitch.ask) {
    L.push('## The Ask');
    L.push(p.pitch.ask);
  }

  return L.join('\n');
}