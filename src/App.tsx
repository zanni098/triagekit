import { useState, useCallback } from 'react'
import { Hero } from './components/Hero'
import { Generator } from './components/Generator'
import { Features } from './components/Features'
import { slugify } from './lib/slug'

export type TemplateType = 'bug-report' | 'feature-request' | 'support-request'

export interface GeneratedOutputs {
  markdown: string
  config: string
  checklist: string
}

export interface FormState {
  projectName: string
  repoUrl: string
  type: TemplateType
  additionalFields: string
}

const TYPES: { value: TemplateType; label: string; desc: string }[] = [
  { value: 'bug-report', label: 'Bug Report', desc: 'Report unexpected behavior' },
  { value: 'feature-request', label: 'Feature Request', desc: 'Suggest a new feature' },
  { value: 'support-request', label: 'Support Request', desc: 'Ask for help' },
]

function generateMarkdown(f: FormState): string {
  const repo = f.projectName ? slugify(f.projectName) : 'your-project'
  const url = f.repoUrl || `https://github.com/username/${repo}`

  const sections: Record<TemplateType, string[]> = {
    'bug-report': [
      '### Description\n\n<!-- A clear and concise description of the bug -->',
      '### Steps to Reproduce\n\n1. Go to \'...\'\n2. Click on \'....\'\n3. Scroll down to \'....\'\n4. See error',
      '### Expected Behavior\n\n<!-- What did you expect to happen? -->',
      '### Actual Behavior\n\n<!-- What actually happened? -->',
      '### Environment\n\n- OS: \n- Browser: \n- Version: `v0.0.0`',
      '### Screenshots / Logs\n\n<!-- If applicable, add screenshots or error logs to help explain -->',
      '### Additional Context\n\n<!-- Add any other context about the problem here -->',
    ],
    'feature-request': [
      '### Problem Statement\n\n<!-- Is your feature request related to a problem? Please describe. -->\n\nI\'m always frustrated when [...]',
      '### Proposed Solution\n\n<!-- A clear and concise description of what you want to happen -->',
      '### Alternatives Considered\n\n<!-- What alternatives have you considered? -->',
      '### Implementation Ideas\n\n<!-- Optional: sketch how this could be implemented -->',
      '### Additional Context\n\n<!-- Add any other context or screenshots about the feature request here -->',
    ],
    'support-request': [
      '### Question\n\n<!-- What do you need help with? -->',
      '### What I\'ve Tried\n\n<!-- Describe what you\'ve already tried -->',
      '### Environment\n\n- OS: \n- Version: `v0.0.0`\n- Relevant config/setup:',
      '### Screenshots / Logs\n\n<!-- If applicable, add screenshots or logs -->',
    ],
  }

  const body = sections[f.type].join('\n\n')

  const extra = f.additionalFields.trim()
  const bodyWithExtra = extra ? body + '\n\n### Additional Fields\n\n' + extra : body

  const labels: Record<TemplateType, string> = {
    'bug-report': 'bug',
    'feature-request': 'enhancement',
    'support-request': 'question',
  }

  return `---
name: ${TYPES.find(t => t.value === f.type)!.label}
about: ${TYPES.find(t => t.value === f.type)!.desc}
title: '[${labels[f.type]}]: '
labels: ['${labels[f.type]}']
assignees: ''
---

<!--
  Thanks for contributing to ${repo}!
  Please fill out this template carefully.
  ${url}
-->

${bodyWithExtra}`
}

function generateConfig(f: FormState): string {
  const repo = f.projectName || 'your-project'
  const types = ['bug-report', 'feature-request', 'support-request'] as TemplateType[]

  const links = types
    .filter(t => f.type === t ? true : false)
    .map(t => {
      const found = TYPES.find(x => x.value === t)!
      return `  - about: ${found.desc}\n    name: ${found.label}\n    title: '[${t.split('-')[0]}]: '\n    labels: ['${t.split('-')[0]}']`
    })

  return `# ${repo} Issue Templates
# Located in .github/ISSUE_TEMPLATE/

blank_issues_enabled: false
contact_links:
${links.join('\n')}`
}

function generateChecklist(f: FormState): string {
  const repo = f.projectName || 'your-project'

  const items: Record<TemplateType, string[]> = {
    'bug-report': [
      '- [ ] Bug title is descriptive and includes affected area',
      '- [ ] Steps to reproduce are clear and numbered',
      '- [ ] Environment details (OS, browser, version) are provided',
      '- [ ] Screenshots or logs are attached if relevant',
      '- [ ] Issue is labeled with correct priority',
    ],
    'feature-request': [
      '- [ ] Problem statement clearly describes the motivation',
      '- [ ] Proposed solution is specific and actionable',
      '- [ ] Alternatives have been documented',
      '- [ ] Feature aligns with project roadmap',
      '- [ ] Issue is labeled as `enhancement`',
    ],
    'support-request': [
      '- [ ] Question is specific and answerable',
      '- [ ] User has described what they\'ve already tried',
      '- [ ] Environment details are provided',
      '- [ ] Relevant logs or screenshots are attached',
      '- [ ] Issue is labeled as `question`',
    ],
  }

  return `# Triage Checklist — ${repo}
## ${TYPES.find(t => t.value === f.type)!.label}

**Submitted by:** <!-- contributor name -->
**Date:** <!-- date submitted -->

### Pre-triage checks

${items[f.type].join('\n')}

### Maintainer notes

- **Severity:** \`low / medium / high / critical\`
- **Priority:** \`P0 / P1 / P2 / P3\`
- **Milestone:** \`v0.0.0\`
- **Assignee:** <!-- @username -->

<!-- Additional triage notes here -->`
}

export default function App() {
  const [form, setForm] = useState<FormState>({
    projectName: '',
    repoUrl: '',
    type: 'bug-report',
    additionalFields: '',
  })

  const update = useCallback((patch: Partial<FormState>) => {
    setForm(prev => ({ ...prev, ...patch }))
  }, [])

  const outputs: GeneratedOutputs = {
    markdown: generateMarkdown(form),
    config: generateConfig(form),
    checklist: generateChecklist(form),
  }

  return (
    <main className="bg-black min-h-screen">
      <Hero />
      <Generator form={form} update={update} outputs={outputs} types={TYPES} />
      <Features />
    </main>
  )
}
