import type { PageId } from './pages/types';

export interface NavItem {
  key: PageId;
  label: string;
  href: string;
}

export const NAV: NavItem[] = [
  { key: 'home', label: 'Home', href: '/' },
  { key: 'events', label: 'Events', href: '/events' },
  { key: 'calendar', label: 'Calendar', href: '/calendar' },
  { key: 'archive', label: 'Archive', href: '/archive' },
  { key: 'sponsors', label: 'Sponsors', href: '/sponsors' },
  { key: 'about', label: 'About', href: '/about' },
  // These will be in the "More" dropdown
  { key: 'workbench', label: 'Workbench', href: '/workbench' },
  { key: 'toolbox', label: 'Toolbox', href: '/toolbox' },
  { key: 'opportunities', label: 'Opportunities', href: '/opportunities' },
  { key: 'projects', label: 'Projects', href: '/projects' },
];

export const HEADER_NAV: NavItem[] = NAV.filter(n => n.key !== 'home');