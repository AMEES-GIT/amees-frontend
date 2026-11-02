export interface SeoRoute {
  path: string;
  title: string;
  description: string;
}

export const SITE_URL = 'https://amees.com.ng';

export const NOINDEX_PATHS = ['/admin', '/login'];

export const SEO: SeoRoute[] = [
  {
    path: '/',
    title: 'AMEES · Lead City University',
    description:
      'The Association of Mechatronics and Electrical and Electronics Engineering Students at Lead City University, Ibadan.',
  },
  {
    path: '/events',
    title: 'Events · AMEES',
    description:
      'Workshops, bootcamps and the annual AMEES events at Lead City University.',
  },
  {
    path: '/calendar',
    title: 'Calendar · AMEES',
    description:
      'Session dates, weekly schedule and events for AMEES members.',
  },
  {
    path: '/archive',
    title: 'Study archive · AMEES',
    description:
      'Past questions, lecture notes and study material for Mechatronics and EEE students.',
  },
  {
    path: '/workbench',
    title: 'Workbench · AMEES',
    description:
      'Track your hardware project from first idea to demo day.',
  },
  {
    path: '/toolbox',
    title: 'Toolbox · AMEES',
    description:
      'Calculators and cheat sheets for benchwork — resistors, capacitors, power budgets.',
  },
  {
    path: '/opportunities',
    title: 'Opportunities · AMEES',
    description:
      'SIWES placements, internships, scholarships and competitions for engineering students.',
  },
  {
    path: '/projects',
    title: 'Projects · AMEES',
    description:
      'Real hardware built by AMEES members — from concept to working prototype.',
  },
  {
    path: '/sponsors',
    title: 'Sponsors & Partners · AMEES',
    description:
      'Back the next generation of Nigerian engineers. Sponsor, host an intern or fund a project.',
  },
  {
    path: '/about',
    title: 'About · AMEES',
    description:
      'Who we are, what we do, and the minds behind the Association of Mechatronics and EEE Students.',
  },
];