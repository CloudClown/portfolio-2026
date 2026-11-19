export type Social = {
  label: string
  href: string
  handle: string
}

export const site = {
  name: 'Tahmid',
  nameLines: ['Tahmid', 'Frontend Dev'],
  role: 'Frontend Developer (React, Next.js, TypeScript)',
  tagline: 'Professional overplanner. Ships anyway.',
  subtagline: '47 tabs open. 5 projects live. 0 runtime excuses.',
  email: 'tahmid.dev@gmail.com',
  github: 'https://github.com/',
  linkedin: 'https://linkedin.com/',
  location: 'Global Remote / Open to Relocation',
  tabsOpen: 47,
  yearsExperience: '3+',
  availability: 'STATUS: READY TO SHIP // HIRING AVAILABLE',
  replyTimeJoke: 'Usually today. Probably. (Genuinely, I reply fast.)',
  /**
   * ONE PERSONAL DETAIL — engraved desk plate.
   * Replace this string with your real detail (a phrase, a first project, where you're from).
   */
  personalDetail: '[ONE PERSONAL DETAIL GOES HERE — e.g. "First program: a QBasic quiz, age 12"]',
  intro:
    '3+ years building high-velocity production web apps. Focused on React, Next.js, and TypeScript architectures that run smooth at 60fps and never break under pressure.',
  bio: [
    'I plan meticulously, optimize relentlessly, and joke about endless refactoring — but when it comes to shipping, the code deploys clean, fast, and accessible.',
    'Currently with 3+ years of professional engineering experience across fast-paced agency and SaaS environments: previously Jr. Frontend Developer at SJ Innovation (2024–2025) and Frontend Developer at Console-IT (2023–2024).',
  ],
  stats: [
    { value: '3+', label: 'Years Experience', sub: 'Production React / Next.js' },
    { value: '05', label: 'Projects Live', sub: 'Deployed & Battle-Tested' },
    { value: '47', label: 'Tabs Open', sub: 'All somehow essential' },
    { value: '99%', label: 'Build Progress', sub: 'Stalled for dramatic effect' },
  ],
  socials: [
    { label: 'GitHub', href: 'https://github.com/', handle: 'github.com/tahmid' },
    { label: 'LinkedIn', href: 'https://linkedin.com/', handle: 'linkedin.com/in/tahmid' },
    { label: 'Email', href: 'mailto:tahmid.dev@gmail.com', handle: 'tahmid.dev@gmail.com' },
  ] as Social[],
  colophon: 'React Three Fiber // Custom Shaders // Physics Playground // Lenis Scroll',
} as const

export const chapters = [
  { id: 'hero', index: '01', code: '01', label: 'Boot Desk', nav: 'Workspace', log: 'crt: phosphor warm... 640K OK' },
  { id: 'about', index: '02', code: '02', label: 'Commit Log', nav: 'Experience', log: 'cat experience.log ... 3+ yrs verified' },
  { id: 'skills', index: '03', code: '03', label: 'Packages', nav: 'Tech Stack', log: 'linking wireframe parts: react, typescript, next' },
  { id: 'projects', index: '04', code: '04', label: 'Disk Library', nav: 'Projects', log: 'mounting 5 disks... status: SHIPPED' },
  { id: 'ai-workflow', index: '05', code: '05', label: 'AI Pipeline', nav: 'AI Tools', log: 'terminal: live... review: 100% manual' },
  { id: 'contact', index: '06', code: '06', label: 'Build Complete', nav: 'Dispatch', log: 'build 99%... 0 errors... BUILD SUCCESSFUL' },
] as const

export type ChapterId = (typeof chapters)[number]['id']
