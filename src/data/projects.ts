export type Metric = { value: string; label: string }

export type ProjectStatus = 'SHIPPED' | 'STILL COOKING'

/**
 * Floppy disks on the desk.
 * The grey, hand-labelled disks are unfinished ideas. ONE disk glows yellow —
 * the real shipped work. Each project is a disk: click to insert it into the
 * drive and its case study boots on the CRT.
 */
export const unfinishedDisks = [
  'plans_v1',
  'plans_v2_FINAL',
  'plans_FINAL_final',
  'todo_someday',
] as const

/** Handwritten case labels for the five shipped project disks. */
export const projectDiskLabels: Record<string, string> = {
  sortedrack: 'SORTEDRACK — SHIPPED',
  'library-management': 'library.sys',
  opec: 'opec_terminal',
  'pool-heaven': 'pool_heaven',
  'event-management': 'events_BETA',
}

export type Project = {
  id: string
  index: string
  code: string
  title: string
  status: ProjectStatus
  year: string
  role: string
  blurb: string
  problem: string
  solution: string
  description: string
  metrics: Metric[]
  stack: string[]
  liveUrl?: string
  githubUrl?: string
  links: { label: string; href: string }[]
}

export const projects: Project[] = [
  {
    id: 'sortedrack',
    index: '01',
    code: 'DEPLOY-01',
    title: 'Sortedrack',
    status: 'SHIPPED',
    year: '2024–2025',
    role: 'Lead Frontend Architecture',
    blurb: 'Warehouse inventory and high-density sorting logistics platform.',
    problem:
      'Warehouse operators faced slow render cycles and 4+ second lag when browsing 10,000+ real-time inventory SKUs across distributed fulfillment racks.',
    solution:
      'Engineered a virtualized table architecture with TanStack Virtual and optimistic React Query caching, cutting render latency by 85% and maintaining 60fps scrolling.',
    description:
      'A mission-critical inventory management suite built for industrial sorting facilities. Implements barcode scanner input streams, sub-millisecond stock delta syncing, and dynamic heat-map visualizations for physical storage racks.',
    metrics: [
      { value: '85ms', label: 'Query Latency' },
      { value: '10k+', label: 'Virtualized SKUs' },
      { value: '99.9%', label: 'Uptime' },
    ],
    stack: ['Next.js 14', 'TypeScript', 'TanStack Query', 'Tailwind CSS', 'WebSockets'],
    liveUrl: 'https://sortedrack.example.com',
    githubUrl: 'https://github.com/tahmid/sortedrack',
    links: [
      { label: 'Live Application', href: 'https://sortedrack.example.com' },
      { label: 'GitHub Repository', href: 'https://github.com/tahmid/sortedrack' },
    ],
  },
  {
    id: 'library-management',
    index: '02',
    code: 'DEPLOY-02',
    title: 'Library Management',
    status: 'SHIPPED',
    year: '2024',
    role: 'Full-Stack Frontend Developer',
    blurb: 'Real-time book circulation, cataloging, and patron lending dashboard.',
    problem:
      'Institutional libraries struggled with manual borrowing records, overdue fine discrepancies, and fractured catalog search.',
    solution:
      'Created a comprehensive, type-safe library orchestration system with full-text fuzzy search, automated due-date notifications, and self-checkout kiosk flows.',
    description:
      'Modern digital library platform managing over 25,000 cataloged titles. Features multi-tier role permissions (Admin, Librarian, Student), barcode generation, and instant checkout receipt generation.',
    metrics: [
      { value: '25k+', label: 'Cataloged Books' },
      { value: '1.2s', label: 'Search Speed' },
      { value: '0', label: 'Overdue Drift' },
    ],
    stack: ['React 18', 'TypeScript', 'Node.js', 'PostgreSQL', 'Tailwind CSS'],
    liveUrl: 'https://library.example.com',
    githubUrl: 'https://github.com/tahmid/library-management',
    links: [
      { label: 'Live Application', href: 'https://library.example.com' },
      { label: 'GitHub Repository', href: 'https://github.com/tahmid/library-management' },
    ],
  },
  {
    id: 'opec',
    index: '03',
    code: 'DEPLOY-03',
    title: 'Opec',
    status: 'SHIPPED',
    year: '2024',
    role: 'Frontend Engineer',
    blurb: 'Energy commodity market analytics and live price streaming terminal.',
    problem:
      'Traders and supply analysts needed instantaneous energy index charting without tab crashes during high-volatility OPEC output announcements.',
    solution:
      'Built a low-latency WebGL canvas candlestick engine backed by delta-compressed WebSocket feeds, preserving fluid interaction during heavy market surges.',
    description:
      'High-throughput oil & petroleum market intelligence platform. Integrates live pricing feeds, macroeconomic indicator overlays, and automated custom export pipelines for risk management teams.',
    metrics: [
      { value: '60fps', label: 'Chart Render' },
      { value: '<50ms', label: 'WebSocket Push' },
      { value: '100%', label: 'Type Safety' },
    ],
    stack: ['React', 'TypeScript', 'Lightweight Charts', 'WebSockets', 'Tailwind CSS'],
    liveUrl: 'https://opec-analytics.example.com',
    githubUrl: 'https://github.com/tahmid/opec-terminal',
    links: [
      { label: 'Live Application', href: 'https://opec-analytics.example.com' },
      { label: 'GitHub Repository', href: 'https://github.com/tahmid/opec-terminal' },
    ],
  },
  {
    id: 'pool-heaven',
    index: '04',
    code: 'DEPLOY-04',
    title: 'Pool Heaven',
    status: 'SHIPPED',
    year: '2023–2024',
    role: 'Frontend Developer',
    blurb: 'Commercial aquatic facility booking, maintenance dispatch, and service portal.',
    problem:
      'Residential and commercial pool owners endured fragmented phone bookings, untracked chemical treatment logs, and clunky invoice payments.',
    solution:
      'Constructed a streamlined mobile-first client booking portal and field technician routing calendar with integrated Stripe checkout.',
    description:
      'End-to-end service marketplace for aquatic maintenance. Features geolocation dispatching for field technicians, before/after water chemistry photo logs, and automated recurring billing.',
    metrics: [
      { value: '+140%', label: 'Online Bookings' },
      { value: '0.8s', label: 'Mobile LCP' },
      { value: '4.9★', label: 'Customer Rating' },
    ],
    stack: ['Next.js', 'React', 'Tailwind CSS', 'Stripe API', 'Server Actions'],
    liveUrl: 'https://poolheaven.example.com',
    githubUrl: 'https://github.com/tahmid/pool-heaven',
    links: [
      { label: 'Live Application', href: 'https://poolheaven.example.com' },
      { label: 'GitHub Repository', href: 'https://github.com/tahmid/pool-heaven' },
    ],
  },
  {
    id: 'event-management',
    index: '05',
    code: 'DEPLOY-05',
    title: 'Event Management',
    status: 'STILL COOKING',
    year: '2025–Present',
    role: 'Creator & Architect',
    blurb: 'Multi-stage developer conference ticketing, live schedules, and badge generation.',
    problem:
      'Conference organizers often juggle 4 different tools for ticketing, agenda schedules, speaker bios, and check-in QR codes.',
    solution:
      'Currently finishing an all-in-one event orchestration suite with offline-capable QR check-in and interactive multi-track session agendas.',
    description:
      'In active development! A modern conference platform with real-time speaker stage transitions, custom badge print styling, and seamless attendee networking features.',
    metrics: [
      { value: '99%', label: 'Compiled' },
      { value: '0', label: 'External Bloat' },
      { value: 'Prerelease', label: 'Status' },
    ],
    stack: ['Next.js 15', 'TypeScript', 'Supabase', 'Tailwind CSS', 'Zustand'],
    liveUrl: 'https://event-suite.example.com',
    githubUrl: 'https://github.com/tahmid/event-management',
    links: [
      { label: 'Preview Build', href: 'https://event-suite.example.com' },
      { label: 'GitHub Repository', href: 'https://github.com/tahmid/event-management' },
    ],
  },
]
