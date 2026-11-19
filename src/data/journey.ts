export type ExperienceItem = {
  company: string
  role: string
  period: string
  type: 'Work' | 'Milestone'
  summary: string
  deliverables: string[]
  crossedOutJoke?: string
}

export const experiences: ExperienceItem[] = [
  {
    company: 'SJ Innovation',
    role: 'Jr. Frontend Developer',
    period: '2024 – 2025',
    type: 'Work',
    summary:
      'Engineered responsive web client features for international SaaS platforms using Next.js and TypeScript, driving 30% reduction in UI bug backlogs.',
    deliverables: [
      'Built reusable, accessible UI component primitives deployed across multiple team codebases.',
      'Refactored legacy state models into React Query cache stores, cutting unnecessary re-renders.',
      'Collaborated closely with design and QA teams under strict sprint deliverables.',
    ],
    crossedOutJoke: '~~Rewrite the entire codebase in Haskell over the weekend~~',
  },
  {
    company: 'Console-IT',
    role: 'Frontend Developer',
    period: '2023 – 2024',
    type: 'Work',
    summary:
      'Constructed enterprise dashboards, client portals, and responsive web systems in React, JavaScript, and Tailwind CSS.',
    deliverables: [
      'Delivered interactive data tables, complex validation forms, and real-time client status hubs.',
      'Achieved consistent 90+ Google Lighthouse performance scores across all client deliverables.',
      'Integrated backend REST APIs and payment gateways with comprehensive error boundaries.',
    ],
    crossedOutJoke: '~~Achieve 0 unread Slack messages and 100% inner peace~~',
  },
  {
    company: 'Independent & Client Engineering',
    role: 'Frontend Web Developer',
    period: '2022 – 2023',
    type: 'Work',
    summary:
      'Designed and shipped bespoke web applications, e-commerce storefronts, and high-conversion landing pages for global clients.',
    deliverables: [
      'Spearheaded custom interactive UI designs with modern CSS animations and responsive grids.',
      'Managed full lifecycle: specification, prototyping, coding, deployment, and client onboarding.',
    ],
    crossedOutJoke: '~~Start side project #15 before shipping side project #14~~',
  },
]

export const stickyNotes = [
  { text: '3+ Years Professional Experience', crossed: false, tag: 'FACT' },
  { text: 'SJ Innovation // Jr. Frontend (2024-2025)', crossed: false, tag: 'VERIFIED' },
  { text: 'Console-IT // Frontend Dev (2023-2024)', crossed: false, tag: 'VERIFIED' },
  { text: '5 Production Applications Live', crossed: false, tag: 'SHIPPED' },
  { text: '~~Rebuild entire portfolio in Rust WASM~~', crossed: true, tag: 'TODO' },
  { text: '~~Close all 47 browser tabs before bed~~', crossed: true, tag: 'TODO' },
  { text: '~~Drink less coffee, sleep 8 continuous hours~~', crossed: true, tag: 'TODO' },
  { text: 'Professional Overplanner. Ships anyway.', crossed: false, tag: 'TRUTH' },
]
