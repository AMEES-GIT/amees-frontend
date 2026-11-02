import type { PageId } from '../pages/types';

/** ISO 8601 with offset, always WAT: "2026-11-09T15:00:00+01:00". */
export type IsoDateTime = string;
/** Calendar day in WAT: "2026-11-09". */
export type IsoDay = string;

export type CalendarType = 'default' | 'special' | 'holiday';

export interface Track {
  id: string;
  title: string;
  text: string;
}

export interface Step {
  lead: string;
  text: string;
}

/** The one event the site features. The next event replaces it by editing this. */
export interface FeaturedEvent {
  id: string;
  pre: string;
  title: string;
  version: string;
  theme: string;
  subtitle: string;
  venue: string;
  start: IsoDateTime;
  end: IsoDateTime;
  sessionHours: string;
  demoNote: string;
  registrationOpen: boolean;
  tracks: Track[];
  steps: Step[];
}

/** A recurring or standing item in the weekly rhythm. */
export interface WeeklyItem {
  id: string;
  title: string;
  text: string;
  /** 0 = Sunday ... 6 = Saturday. Set it and the item appears on the calendar every week. */
  weekday?: number;
  /** Label for items without a weekday, for example "Wk". */
  label?: string;
    /** Calendar chip colour, used only when weekday is set. */
  type?: CalendarType;
}

/** A one-off calendar entry. */
export interface CalendarEntry {
  id: string;
  day: IsoDay;
  title: string;
  type: CalendarType;
}

export interface UpcomingEvent {
  id: string;
  title: string;
  tag: string;
  text: string;
}

export interface QuickLink {
  id: PageId;
  title: string;
  meta: string;
  text: string;
  cta: string;
}

export interface ArchiveFile {
  id: string;
  title: string;
  course: string;
  level: number;
  kind: string;
  year: number;
  ext: string;
  size?: string;
  /** Shown as "sample listing" until real files replace it. */
  sample?: boolean;
}

export interface PageIntro {
  kicker: string;
  title: string;
  lede: string;
}

export interface FooterLinkContent {
  label: string;
  page: PageId;
}

export interface FooterGroupContent {
  title: string;
  links: FooterLinkContent[];
}

export interface ExternalLink {
  label: string;
  href: string;
}

export interface Opportunity {
  id: string;
  type: string;
  title: string;
  org: string;
  levels: number[];
  deadline: IsoDay;
  location: string;
  description: string;
}

export interface ExecutiveMember {
  role: string;
  name: string;
  photoUrl?: string;
  linkedin?: string;
}

export interface Partner {
  id: string;
  name: string;
  type: 'Sponsor' | 'Partner';
  url?: string;
}

export interface SponsorTier {
  id: string;
  name: string;
  price: string;
  features: string[];
  hot?: boolean;
}

export type BuildStage = 'Concept' | 'Prototype' | 'Alpha' | 'Beta' | 'Final';

export interface ExhibitionProject {
  id: string;
  title: string;
  builder: string;
  description: string;
  tags: string[];
  stage: BuildStage;
  showcased: boolean;
  /** Detailed data mimicking what the student exported from the Workbench */
  workbenchData: {
    goal: string;
    pitch: { problem: string; solution: string; ask: string };
    milestones: { date: string; title: string }[];
    tests: { name: string; result: string; pass: boolean }[];
    parts: { name: string; status: string }[];
  };
}


export interface SiteContent {
  featured: FeaturedEvent;
  weekly: WeeklyItem[];
  calendarEntries: CalendarEntry[];
  upcoming: UpcomingEvent[];
  quickLinks: QuickLink[];
  archive: ArchiveFile[];
  opportunities: Opportunity[];
  activeMarquee?: 'caution' | 'showcase';

  sponsorPitch: { title: string; text: string; cta: string };
  
  // The about object MUST be here at the root
  about: {
    founded: string;
    motto: string;
    description: string;
    pillars: { title: string; text: string }[];
    executive: ExecutiveMember[];
  };

  projects: {
    title: string;
    subtitle: string;
    submitText: string;
    projects: ExhibitionProject[];
  };

  footer: {
    tagline: string;
    groups: FooterGroupContent[];
    external: ExternalLink[];
  };

  partners: Partner[];
  sponsorTiers: SponsorTier[];

  pages: {
    events: PageIntro;
    calendar: PageIntro;
    archive: PageIntro;
    workbench: PageIntro;
    toolbox: PageIntro;
    opportunities: PageIntro;
    about: PageIntro;
    projects: PageIntro;
    sponsors: PageIntro;
  };

  calendarMilestones: { title: string; text: string }[];
  calendarNote: string;
}