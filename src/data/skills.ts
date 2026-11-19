export type WorkshopPartType = 'keycap' | 'chip' | 'cable' | 'screw' | 'pcb'

export type Skill = {
  id: string
  name: string
  category: 'Core Frontend' | 'Full-Stack & Data' | 'Tooling & UI'
  partType: WorkshopPartType
  label: string
  level: string
  detail: string
  stampedMark: string
}

export const skills: Skill[] = [
  {
    id: 'react',
    name: 'React',
    category: 'Core Frontend',
    partType: 'chip',
    label: 'REACT 18/19',
    level: 'Advanced',
    detail: 'Server Components, concurrent rendering, custom hooks, atomic state management, and optimized render cycles.',
    stampedMark: '⚛',
  },
  {
    id: 'typescript',
    name: 'TypeScript',
    category: 'Core Frontend',
    partType: 'keycap',
    label: 'TYPESCRIPT',
    level: 'Strict Mode Only',
    detail: 'Generics, conditional typing, utility types, schema validation with Zod, and 100% strict type inference.',
    stampedMark: 'TS',
  },
  {
    id: 'nextjs',
    name: 'Next.js',
    category: 'Core Frontend',
    partType: 'chip',
    label: 'NEXT.JS',
    level: 'Production Scale',
    detail: 'App Router, Server Actions, edge middleware, dynamic routing, caching semantics, and streaming SSR.',
    stampedMark: '▲',
  },
  {
    id: 'javascript',
    name: 'JavaScript',
    category: 'Core Frontend',
    partType: 'pcb',
    label: 'JAVASCRIPT ES2024',
    level: 'Core Mastery',
    detail: 'Event loop mastery, closures, async iterators, memory profiling, and high-performance Web APIs.',
    stampedMark: 'JS',
  },
  {
    id: 'tailwind',
    name: 'Tailwind CSS',
    category: 'Tooling & UI',
    partType: 'keycap',
    label: 'TAILWIND',
    level: 'Design Systems',
    detail: 'Bespoke design systems, responsive architectures, custom arbitrary variants, and zero-runtime bundle efficiency.',
    stampedMark: 'TW',
  },
  {
    id: 'nodejs',
    name: 'Node.js',
    category: 'Full-Stack & Data',
    partType: 'cable',
    label: 'NODE.JS',
    level: 'Service Layer',
    detail: 'RESTful API routing, WebSocket event hubs, stream pipelines, and robust authentication middleware.',
    stampedMark: '⬢',
  },
  {
    id: 'sql',
    name: 'SQL',
    category: 'Full-Stack & Data',
    partType: 'screw',
    label: 'SQL / POSTGRES',
    level: 'Query & Schema',
    detail: 'Relational data modeling, index optimization, complex joins, migrations, and Prisma/Drizzle ORMs.',
    stampedMark: 'SQL',
  },
]

export const skillGroups = [
  {
    name: 'Production Core',
    skills: skills.filter((s) => s.category === 'Core Frontend'),
  },
  {
    name: 'Full-Stack & Data Layer',
    skills: skills.filter((s) => s.category === 'Full-Stack & Data'),
  },
  {
    name: 'Systems & Interface Engine',
    skills: skills.filter((s) => s.category === 'Tooling & UI'),
  },
]
