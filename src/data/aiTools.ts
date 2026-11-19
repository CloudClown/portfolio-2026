export type AITool = {
  id: string
  name: string
  role: string
  usage: string
  verdict: string
}

export const aiWorkflow = {
  headline: 'I use AI daily to plan, write, and debug faster.',
  subheadline: 'I review every single line before it ships.',
  philosophy:
    'AI is a 10x force multiplier for architecture exploration, rapid boilerplating, and bug triage. But code quality, accessibility, security, and runtime performance remain 100% human-verified.',
  tools: [
    {
      id: 'claude-code',
      name: 'Claude Code',
      role: 'Architecture & Deep Refactoring',
      usage: 'Scaffolding complex system designs, cross-module refactoring, and verifying edge cases.',
      verdict: 'Deep context reasoning, stellar code generation.',
    },
    {
      id: 'cursor',
      name: 'Cursor',
      role: 'Inline Flow & Accelerated Triage',
      usage: 'Rapid keyboard-driven code navigation, contextual edits, and immediate test fixture generation.',
      verdict: 'Peak developer velocity and inline diff clarity.',
    },
    {
      id: 'vscode',
      name: 'VS Code',
      role: 'Battle-Tested Workspace',
      usage: 'Extensions, terminal splits, performance profiling, and git conflict reconciliation.',
      verdict: 'The dependable foundation for all production work.',
    },
    {
      id: 'git',
      name: 'Git',
      role: 'The Ultimate Arbiter',
      usage: 'Atomic commits, rebase workflows, branch discipline, and clean PR histories.',
      verdict: 'If it is not committed and reviewed, it does not exist.',
    },
  ] as AITool[],
}
