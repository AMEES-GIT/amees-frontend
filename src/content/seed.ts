import type { SiteContent } from './types';

export const seedContent: SiteContent = {
  activeMarquee: 'caution',

  featured: {
    id: '',
    pre: '',
    title: '',
    version: '',
    theme: '',
    subtitle: '',
    venue: '',
    start: new Date().toISOString(),
    end: new Date().toISOString(),
    sessionHours: '',
    demoNote: '',
    registrationOpen: false,
    tracks: [],
    steps: [],
  },

  weekly: [],
  calendarEntries: [],
  upcoming: [],
  quickLinks: [],
  archive: [],
  opportunities: [],

  projects: {
    title: '',
    subtitle: '',
    submitText: '',
    projects: [],
  },

  sponsorPitch: { title: '', text: '', cta: '' },
  sponsorTiers: [],
  partners: [],

  about: {
    founded: '',
    motto: '',
    description: '',
    pillars: [],
    executive: [],
  },

  footer: {
    tagline: '',
    groups: [],
    external: [],
  },

  calendarMilestones: [],
  calendarNote: '',

  // ── new fields, added by these fixes ──
  membershipFormUrl: '',
  projectSubmissionUrl: '',

  pages: {
    events: { kicker: 'Events', title: 'What is on at AMEES', lede: '' },
    calendar: { kicker: 'Calendar', title: 'Session calendar', lede: '' },
    archive: { kicker: 'Study archive', title: 'Past questions and notes', lede: '' },
    workbench: { kicker: 'Workbench', title: 'Your project tracker', lede: '' },
    toolbox: { kicker: 'Toolbox', title: 'Engineering toolbox', lede: '' },
    opportunities: { kicker: 'Opportunities', title: 'Placements and prizes', lede: '' },
    about: { kicker: 'About AMEES', title: 'Who we are', lede: '' },
    sponsors: { kicker: 'Sponsors & Partners', title: 'Back our future engineers', lede: '' },
    projects: { kicker: 'Projects', title: 'Built by students', lede: '' },
  },
};