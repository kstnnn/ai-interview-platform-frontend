import type { TechnologyGroupResponse, TechnologyResponse } from '@/types/api'

export const FALLBACK_TECHNOLOGIES: TechnologyResponse[] = [
  { key: 'java', displayName: 'Java' },
  { key: 'spring', displayName: 'Spring' },
  { key: 'python', displayName: 'Python' },
  { key: 'django', displayName: 'Django' },
  { key: 'fastapi', displayName: 'FastAPI' },
  { key: 'postgresql', displayName: 'PostgreSQL' },
  { key: 'hibernate', displayName: 'Hibernate' },
  { key: 'kafka', displayName: 'Kafka' },
  { key: 'redis', displayName: 'Redis' },
  { key: 'system_design', displayName: 'System Design' },
  { key: 'testing', displayName: 'Testing' },
  { key: 'devops', displayName: 'DevOps' },
  { key: 'javascript', displayName: 'JavaScript' },
  { key: 'typescript', displayName: 'TypeScript' },
  { key: 'react', displayName: 'React' },
  { key: 'node', displayName: 'Node.js' },
  { key: 'go', displayName: 'Go' },
  { key: 'csharp', displayName: 'C#' },
  { key: 'dotnet', displayName: '.NET' },
  { key: 'rust', displayName: 'Rust' },
]

export const FALLBACK_TECHNOLOGY_GROUPS: TechnologyGroupResponse[] = [
  {
    groupKey: 'languages',
    groupName: 'Programming Languages',
    items: [
      { key: 'java', displayName: 'Java' },
      { key: 'python', displayName: 'Python' },
      { key: 'javascript', displayName: 'JavaScript' },
      { key: 'typescript', displayName: 'TypeScript' },
      { key: 'go', displayName: 'Go' },
      { key: 'csharp', displayName: 'C#' },
      { key: 'rust', displayName: 'Rust' },
    ],
  },
  {
    groupKey: 'frameworks',
    groupName: 'Frameworks',
    items: [
      { key: 'spring', displayName: 'Spring' },
      { key: 'django', displayName: 'Django' },
      { key: 'fastapi', displayName: 'FastAPI' },
      { key: 'react', displayName: 'React' },
      { key: 'node', displayName: 'Node.js' },
      { key: 'dotnet', displayName: '.NET' },
    ],
  },
  {
    groupKey: 'data-infra',
    groupName: 'Data & Infrastructure',
    items: [
      { key: 'postgresql', displayName: 'PostgreSQL' },
      { key: 'hibernate', displayName: 'Hibernate' },
      { key: 'kafka', displayName: 'Kafka' },
      { key: 'redis', displayName: 'Redis' },
      { key: 'system_design', displayName: 'System Design' },
      { key: 'testing', displayName: 'Testing' },
      { key: 'devops', displayName: 'DevOps' },
    ],
  },
]

export function flattenTechnologyGroups(groups: TechnologyGroupResponse[]) {
  return groups.flatMap((group) => group.items)
}

export function technologyLabel(key: string, technologies: TechnologyResponse[]) {
  return technologies.find((technology) => technology.key === key)?.displayName
    ?? key.replace(/_/g, ' ').replace(/\b\w/g, (character) => character.toUpperCase())
}
