import type { SiteContent } from './types';

/**
 * Seed content. This is what a fresh database would hold, not page code.
 * Anything marked "sample" or a quick link needs replacing with confirmed text.
 */
export const seedContent: SiteContent = {
  featured: {
    id: 'wired-1',
    pre: 'The Association of Mechatronics and Electrical and Electronics Engineering Students presents',
    title: 'Wired',
    version: '1.0',
    theme: 'Connecting minds through innovation',
    subtitle: 'A hardware tech bootcamp',
    venue: 'Faculty of Engineering Building, Lead City University, Ibadan',
    start: '2026-11-09T15:00:00+01:00',
    end: '2026-12-03T17:00:00+01:00',
    sessionHours: '3 to 5 pm WAT',
    demoNote: 'Present what you built',
    registrationOpen: true,
    tracks: [
      {
        id: 'embedded',
        title: 'Embedded Systems and Sensing',
        text: 'Microcontrollers, sensors, and reading the physical world into code.',
      },
      {
        id: 'control',
        title: 'Control and Intelligent Systems',
        text: 'Feedback loops, PID tuning, and adding learning to control.',
      },
      {
        id: 'power',
        title: 'Electromechanics and Power Systems',
        text: 'Motors, drives, power electronics, and how energy moves.',
      },
      {
        id: 'design',
        title: 'Design and Modelling',
        text: 'CAD, simulation, and designing a part before you cut it.',
      },
    ],
    steps: [
      { lead: 'Register', text: 'online before the first session.' },
      { lead: 'Show up', text: 'at the Faculty of Engineering Building, 3 to 5pm.' },
      { lead: 'Pick a project', text: 'that matches a track.' },
      { lead: 'Join a team', text: 'and share the build.' },
      { lead: 'Learn. Build. Demo.', text: 'Present what you made.' },
    ],
  },

  weekly: [
    { id: 'trivia', title: 'Trivia Tuesdays', text: 'Quick-fire engineering questions', weekday: 2 },
    { id: 'spotlight', title: 'Member Spotlight', text: 'One member and what they built', label: 'Wk' },
    {
      id: 'potw',
      title: 'Problem of the Week',
      text: 'Bonus marks where the HOD or lecturer approves',
      label: 'Wk',
    },
    {
      id: 'dialogue',
      title: 'Dialogue Evenings',
      text: 'Open conversation on engineering and careers',
      weekday: 0,
    },
  ],

  calendarEntries: [],

  upcoming: [
    {
      id: 'tech-week',
      title: 'AMEES Tech Week',
      tag: 'Second semester',
      text: 'Held with Student Week. Includes the joint cross-faculty event.',
    },
    {
      id: 'soft-skills',
      title: 'Soft skills workshop',
      tag: 'Second semester',
      text: 'Communication, teamwork, and presenting your work.',
    },
    {
      id: 'challenge',
      title: 'Inter-departmental challenge',
      tag: 'Second semester',
      text: 'Teams from other departments compete on a build brief.',
    },
    {
      id: 'legacy',
      title: 'AMEES Legacy Project',
      tag: 'Second semester',
      text: 'A lasting build for the department, made mostly over the holiday.',
    },
  ],

  quickLinks: [
    { id: 'archive', title: 'Study archive', meta: 'year-round', text: 'Past questions and notes.', cta: 'Study archive' },
    { id: 'toolbox', title: 'Toolbox', meta: 'year-round', text: 'Calculators for common circuits.', cta: 'Toolbox' },
    { id: 'workbench', title: 'Workbench', meta: 'year-round', text: 'Track a project to demo day.', cta: 'Workbench' },
    { id: 'calendar', title: 'Calendar', meta: 'year-round', text: 'Sessions and meetings.', cta: 'Calendar' },
    { id: 'opportunities', title: 'Opportunities', meta: 'year-round', text: 'Internships and openings.', cta: 'Opportunities' },
    { id: 'projects', title: 'Projects', meta: 'year-round', text: 'What members have built.', cta: 'Projects' },
  ],

  archive: [
    { id: 'f1', title: 'Control Systems I lecture slides', course: 'MCE 301', level: 300, kind: 'Slides', year: 2026, ext: 'PPT', sample: true },
    { id: 'f2', title: 'Microprocessors and Interfacing notes', course: 'MCE 303', level: 300, kind: 'Notes', year: 2026, ext: 'PDF', sample: true },
    { id: 'f3', title: 'Circuit Theory I past questions', course: 'EEE 201', level: 200, kind: 'Past questions', year: 2025, ext: 'PDF', sample: true },
    { id: 'f4', title: 'Digital Electronics lab manual', course: 'EEE 204', level: 200, kind: 'Lab manuals', year: 2024, ext: 'PDF', sample: true },
    { id: 'f5', title: 'Robotics and Kinematics slides', course: 'MCE 401', level: 400, kind: 'Slides', year: 2026, ext: 'PPT', sample: true },
  ],

  opportunities: [
    {
      id: 'o1', type: 'SIWES', title: 'Electrical maintenance placement', org: 'Regional power distribution company',
      levels: [300, 400], deadline: '2026-11-20', location: 'Ibadan',
      description: 'Six months shadowing technicians on substations and metering, with logbook supervision.'
    },
    {
      id: 'o2', type: 'Internship', title: 'Embedded systems trainee', org: 'Local electronics start-up',
      levels: [300, 400], deadline: '2026-11-12', location: 'Ibadan',
      description: 'Help build and test ESP32 products. Bring one project you have built.'
    },
    {
      id: 'o3', type: 'Competition', title: 'Student robotics challenge', org: 'National engineering society',
      levels: [100, 200, 300, 400, 500], deadline: '2026-12-05', location: 'Abuja',
      description: 'Teams of up to four build a line-following robot. Travel support for finalists.'
    }
  ],

  sponsorPitch: {
    title: 'Partner with AMEES',
    text: 'Support AMEES and reach Mechatronics and Electrical and Electronics engineering students at Lead City University.',
    cta: 'See sponsor tiers',
  },

  about: {
    founded: '2025',
    motto: 'Connecting minds through innovation',
    description: 'The Association of Mechatronics and Electrical and Electronics Engineering Students (AMEES) is a student body dedicated to bridging the gap between theoretical engineering and practical, hands-on hardware development. From robotics to power systems, we build the future.',
    pillars: [
      { title: 'Learn', text: 'Workshops on CAD, programming, and hardware design.' },
      { title: 'Build', text: 'Real projects that solve problems, from concept to physical prototype.' },
      { title: 'Showcase', text: 'An annual exhibition where members present their builds to the public and industry.' }
    ],
    executive: [
      { 
        role: 'President', 
        name: 'John Doe', 
        photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop',
        linkedin: 'https://linkedin.com/in/johndoe' 
      },
      { 
        role: 'Vice President', 
        name: 'Jane Smith',
        linkedin: 'https://linkedin.com/in/janesmith' 
      },
      { role: 'General Secretary', name: 'TBD' },
      { role: 'Technical Lead', name: 'TBD' },
      { role: 'Public Relations', name: 'TBD' },
      { role: 'Welfare', name: 'TBD' }
    ]
  },

  footer: {
    tagline:
      'Association of Mechatronics and Electrical and Electronics Engineering Students, Lead City University, Ibadan.',
    groups: [
      {
        title: 'Explore',
        links: [
          { label: 'Events', page: 'events' },
          { label: 'Calendar', page: 'calendar' },
          { label: 'Archive', page: 'archive' },
          { label: 'Toolbox', page: 'toolbox' },
          { label: 'Workbench', page: 'workbench' },
        ],
      },
      {
        title: 'About AMEES',
        links: [
          { label: 'About', page: 'about' },
          { label: 'Opportunities', page: 'opportunities' },
          { label: 'Projects', page: 'projects' },
          { label: 'Sponsors', page: 'sponsors' },
        ],
      },
    ],
    external: [],
  },

    projects: {
    title: 'Wired 1.0 Showcase',
    subtitle: 'Built by students',
    submitText: 'Applications for the next showcase open soon. Every exhibited project must have a physical build, even when the core is software.',
    projects: [
      {
        id: 'p1',
        title: 'Digital Notice Board',
        builder: 'Ore',
        description: 'A networked display that replaces paper notices around the department.',
        tags: ['Display', 'Networking'],
        stage: 'Beta',
        showcased: true,
        workbenchData: {
          goal: 'Replace the paper notice board outside the HOD office with a screen that updates automatically.',
          pitch: {
            problem: 'Paper notices get torn, wet, or ignored. The department wastes money printing them every week.',
            solution: 'A Raspberry Pi connected to a display. An admin dashboard allows the HOD to push updates instantly.',
            ask: 'A weatherproof enclosure for the screen so it can be mounted outside.'
          },
          milestones: [
            { date: 'Oct 12', title: 'Raspberry Pi configured' },
            { date: 'Oct 20', title: 'Admin dashboard MVP built' }
          ],
          tests: [
            { name: 'Wi-Fi disconnection recovery', result: 'Pass', pass: true },
            { name: 'Display brightness in sunlight', result: 'Fail', pass: false }
          ],
          parts: [
            { name: 'Raspberry Pi 4', status: 'Owned' },
            { name: '32-inch Monitor', status: 'Owned' },
            { name: 'Outdoor Enclosure', status: 'Needed' }
          ]
        }
      },
      {
        id: 'p2',
        title: 'Lab Access Lock',
        builder: 'Confidence',
        description: 'A computer-vision lock that opens the lab for people on the access list.',
        tags: ['Computer vision', 'Access control'],
        stage: 'Prototype',
        showcased: true,
        workbenchData: {
          goal: 'Stop students from losing the physical keys to the electronics lab.',
          pitch: {
            problem: 'Keys get lost or duplicated. Tracking who has the key is impossible.',
            solution: 'A camera running OpenCV that recognizes student faces and triggers a solenoid lock.',
            ask: 'Better lighting for the lab door.'
          },
          milestones: [{ date: 'Nov 1', title: 'Face recognition working locally' }],
          tests: [{ name: 'Recognition speed', result: 'Pass (0.8s)', pass: true }],
          parts: [{ name: 'Raspberry Pi', status: 'Owned' }, { name: 'Solenoid Lock', status: 'Owned' }]
        }
      }
    ]
  },

    partners: [
    { id: 'p1', name: 'Atlis', type: 'Partner' },
    { id: 'p2', name: 'LCU Engineering', type: 'Partner' },
    { id: 'p3', name: 'TechHub Ibadan', type: 'Partner' },
    { id: 'p4', name: 'Jide Motors', type: 'Sponsor' },
    { id: 'p5', name: 'Robotics NG', type: 'Sponsor' },
  ],

  sponsorTiers: [
    {
      id: 't1', name: 'Bronze', price: '',
      features: ['Logo on the AMEES site', 'Named in the post-event report']
    },
    {
      id: 't2', name: 'Silver', price: '', hot: true,
      features: ['Everything in Bronze', 'Booth space at the exhibition', 'A sponsored award']
    },
    {
      id: 't3', name: 'Gold', price: '',
      features: ['Everything in Silver', 'Naming rights on one project', 'A guest slot at Tech Week (subject to approval)']
    }
  ],

  calendarMilestones: [
    { title: 'Orientation', text: 'AMEES orientation with departmental orientation, 7 to 10 September.' },
    { title: 'Technical workshops', text: 'AutoCAD, programming, and hardware sessions throughout the semester.' },
    { title: 'Project proposals', text: 'Call for project proposals, followed by project selection.' },
    { title: 'Pitch deck day', text: 'Teams present their ideas to the panel.' },
    { title: 'Wired 1.0', text: 'The main hardware bootcamp, 9 November to 3 December.' },
    { title: 'Tech Week', text: 'Second semester event, held during Student Week.' },
    { title: 'Legacy Project', text: 'A lasting build for the department, worked on over the holiday.' }
  ],

  activeMarquee: 'caution',
  
  calendarNote: "Executive meetings fall on the first and last Monday or Friday of each month. Activities pause one to two weeks before exams.",

  // The pages object sits at the root level alongside footer and featured
  pages: {
    events: {
      kicker: "Events",
      title: "What is on at AMEES",
      lede: "A weekly rhythm all year, plus the featured event below."
    },
    calendar: {
      kicker: "Calendar",
      title: "Session calendar",
      lede: "Bootcamp days, weekly sessions, and executive meetings in one view."
    },
    archive: {
      kicker: "Study archive",
      title: "Past questions and notes",
      lede: "Every course your seniors kept. Filter by level, pick a file type, or search by course code."
    },
    workbench: {
      kicker: "Workbench",
      title: "Your project tracker",
      lede: "Track your hardware build from first idea to demo day."
    },
    toolbox: {
      kicker: "Toolbox",
      title: "Engineering toolbox",
      lede: "Calculators and cheat sheets for the bench. Save any result to a project on your Workbench."
    },
    opportunities: {
      kicker: "Opportunities",
      title: "Placements and prizes",
      lede: "SIWES, internships, scholarships, and competitions the executive has checked."
    },
    about: {
      kicker: "About AMEES",
      title: "Who we are",
      lede: "The Association of Mechatronics and Electrical and Electronics Engineering Students at Lead City University, Ibadan."
    },
    projects: {
      kicker: "Projects",
      title: "Built by students",
      lede: "A showcase of real hardware projects built by AMEES members, from concept to physical prototype."
    },
    sponsors: {
      kicker: "Sponsors & Partners",
      title: "Back the next engineers",
      lede: "AMEES gives sponsors a defined audience, early access to talent, and a name on hardware people can touch."
    }
  }
};