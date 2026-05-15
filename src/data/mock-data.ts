import type {
  CandidateApplication,
  CandidateSession,
  InterviewQuestion,
  InterviewScore,
  LearningRecommendation,
  MockInterviewPreset,
  Organization,
  RoadmapStep,
  Vacancy,
} from '@/types/interview'

export const mockSessions: CandidateSession[] = [
  {
    id: 'session-001',
    sessionCode: 'ABC123XYZ',
    candidateName: 'Sarah Chen',
    candidateEmail: 'sarah.chen@email.com',
    position: 'Senior Full-Stack Engineer',
    level: 'Senior',
    status: 'completed',
    createdAt: '2024-05-01T10:00:00Z',
    startedAt: '2024-05-02T14:00:00Z',
    completedAt: '2024-05-02T15:30:00Z',
    interviewerName: 'Alex Johnson',
    score: 88,
    feedback: 'Strong technical foundation with excellent system design knowledge. Clear, structured communication throughout the interview.',
  },
  {
    id: 'session-002',
    sessionCode: 'DEV456MID',
    candidateName: 'Marcus Rodriguez',
    candidateEmail: 'm.rodriguez@email.com',
    position: 'Full-Stack Engineer',
    level: 'Mid',
    status: 'completed',
    createdAt: '2024-05-03T09:00:00Z',
    startedAt: '2024-05-04T13:00:00Z',
    completedAt: '2024-05-04T14:45:00Z',
    interviewerName: 'Emma Watson',
    score: 72,
    feedback: 'Good foundation. Would benefit from a deeper understanding of distributed systems and system trade-offs.',
  },
  {
    id: 'session-003',
    sessionCode: 'FRONT789UI',
    candidateName: 'Jennifer Park',
    candidateEmail: 'jpark@email.com',
    position: 'Frontend Engineer',
    level: 'Mid',
    status: 'in-progress',
    createdAt: '2024-05-05T08:00:00Z',
    startedAt: '2024-05-06T10:00:00Z',
    interviewerName: 'David Chen',
  },
  {
    id: 'session-004',
    sessionCode: 'BACK111JR',
    candidateName: 'James Mitchell',
    candidateEmail: 'james.m@email.com',
    position: 'Backend Engineer',
    level: 'Junior',
    status: 'pending',
    createdAt: '2024-05-06T11:00:00Z',
  },
]

export const mockQuestions: InterviewQuestion[] = [
  {
    id: 'q-001',
    sessionId: 'session-001',
    order: 1,
    category: 'coding',
    title: 'Two Sum Problem',
    description: 'Given an array of integers and a target, how would you find two numbers that add up to the target efficiently?',
    timeLimit: 25,
    notes: 'Clean O(n) solution using a map. Good explanation of time and space complexity.',
    answer: 'Use a hash map to store previously seen values and check if target - current exists.',
    scoreGiven: 9,
  },
  {
    id: 'q-002',
    sessionId: 'session-001',
    order: 2,
    category: 'design',
    title: 'Design a URL Shortener',
    description: 'How would you design a scalable URL shortener with fast lookups and collision avoidance?',
    timeLimit: 35,
    notes: 'Strong system design discussion covering sharding, cache, and failure handling.',
    scoreGiven: 9,
  },
  {
    id: 'q-003',
    sessionId: 'session-001',
    order: 3,
    category: 'behavioral',
    title: 'Handling Disagreements',
    description: 'Tell me about a time you disagreed with a teammate on a technical decision. How did you resolve it?',
    timeLimit: 20,
    notes: 'Balanced answer with empathy and decision-making discipline.',
    scoreGiven: 8,
  },
]

export const mockScores: InterviewScore[] = [
  {
    sessionId: 'session-001',
    technicalSkill: 9,
    problemSolving: 9,
    communication: 8,
    codeQuality: 8,
    overallScore: 88,
    recommendation: 'strong-yes',
  },
  {
    sessionId: 'session-002',
    technicalSkill: 7,
    problemSolving: 7,
    communication: 8,
    codeQuality: 7,
    overallScore: 72,
    recommendation: 'maybe',
  },
]

export const scriptedInterviewQuestions = [
  'Tell me a bit about yourself and the kind of engineering work you enjoy most.',
  'Describe a recent technical problem you solved and how you approached it.',
  'When you design a feature, how do you balance speed of delivery with maintainability?',
  'Tell me about a disagreement you had with a teammate and how you handled it.',
  'What would you improve in your current team or delivery process if you could?',
  'Do you have any questions for the interviewer before we wrap up?',
]

export const mockOrganizations: Organization[] = [
  {
    id: 'org-001',
    name: 'Northstar Labs',
    industry: 'Fintech infrastructure',
    plan: 'Growth',
    activeVacancies: 3,
    monthlyInterviews: 42,
  },
]

export const mockVacancies: Vacancy[] = [
  {
    id: 'vacancy-001',
    organizationId: 'org-001',
    organizationName: 'Northstar Labs',
    title: 'Senior Full-Stack Engineer',
    department: 'Core Platform',
    description: 'Build customer-facing analytics and internal workflow tools for a fintech platform used by operations teams every day.',
    location: 'Remote / Europe',
    employmentType: 'Full-time',
    salaryRange: '$75k - $105k',
    level: 'Senior',
    status: 'published',
    isPublic: true,
    stack: ['Vue', 'Node.js', 'PostgreSQL', 'AWS'],
    requiredSkills: ['System design', 'API architecture', 'Frontend performance'],
    candidateCount: 18,
    interviewDurationMinutes: 75,
    createdAt: '2024-05-01T10:00:00Z',
    customQuestions: [
      {
        id: 'vq-001',
        title: 'How would you design tenant isolation for a multi-tenant reporting service?',
        category: 'design',
        difficulty: 'Senior',
        source: 'company',
      },
      {
        id: 'vq-002',
        title: 'Explain how you would debug slow Vue rendering in a large table.',
        category: 'coding',
        difficulty: 'Senior',
        source: 'company',
      },
    ],
  },
  {
    id: 'vacancy-002',
    organizationId: 'org-001',
    organizationName: 'Northstar Labs',
    title: 'Backend Engineer',
    department: 'Payments',
    description: 'Work on payment workflows, event-driven services, and reliable financial transaction processing.',
    location: 'Hybrid / Warsaw',
    employmentType: 'Full-time',
    salaryRange: '$55k - $80k',
    level: 'Mid',
    status: 'published',
    isPublic: true,
    stack: ['Java', 'Spring Boot', 'Kafka', 'PostgreSQL'],
    requiredSkills: ['Transactions', 'Event-driven systems', 'Testing'],
    candidateCount: 11,
    interviewDurationMinutes: 60,
    createdAt: '2024-05-04T09:00:00Z',
    customQuestions: [],
  },
  {
    id: 'vacancy-003',
    organizationId: 'org-001',
    organizationName: 'Northstar Labs',
    title: 'Frontend Engineer',
    department: 'Product Experience',
    description: 'Create accessible product interfaces, reusable components, and high-quality user experiences for complex workflows.',
    location: 'Remote',
    employmentType: 'Contract',
    level: 'Mid',
    status: 'draft',
    isPublic: false,
    stack: ['Vue', 'TypeScript', 'Tailwind CSS'],
    requiredSkills: ['Accessibility', 'State management', 'Component design'],
    candidateCount: 0,
    interviewDurationMinutes: 50,
    createdAt: '2024-05-06T11:00:00Z',
    customQuestions: [
      {
        id: 'vq-003',
        title: 'Describe how you structure reusable form components with validation.',
        category: 'design',
        difficulty: 'Mid',
        source: 'company',
      },
    ],
  },
]

export const mockApplications: CandidateApplication[] = [
  {
    id: 'app-001',
    vacancyId: 'vacancy-001',
    candidateName: 'Sarah Chen',
    candidateEmail: 'sarah.chen@email.com',
    status: 'review',
    score: 88,
    appliedAt: '2024-05-02T08:00:00Z',
    sessionId: 'session-001',
  },
  {
    id: 'app-002',
    vacancyId: 'vacancy-001',
    candidateName: 'Marcus Rodriguez',
    candidateEmail: 'm.rodriguez@email.com',
    status: 'review',
    score: 72,
    appliedAt: '2024-05-03T12:20:00Z',
    sessionId: 'session-002',
  },
  {
    id: 'app-003',
    vacancyId: 'vacancy-002',
    candidateName: 'Jennifer Park',
    candidateEmail: 'jpark@email.com',
    status: 'interviewing',
    appliedAt: '2024-05-05T16:30:00Z',
    sessionId: 'session-003',
  },
  {
    id: 'app-004',
    vacancyId: 'vacancy-002',
    candidateName: 'James Mitchell',
    candidateEmail: 'james.m@email.com',
    status: 'invited',
    appliedAt: '2024-05-06T10:10:00Z',
    sessionId: 'session-004',
  },
]

export const mockInterviewPresets: MockInterviewPreset[] = [
  {
    id: 'preset-001',
    title: 'Frontend readiness check',
    stack: ['Vue', 'TypeScript', 'Accessibility'],
    level: 'Mid',
    durationMinutes: 45,
    focus: 'Components, browser APIs, practical debugging',
    attempts: 6,
  },
  {
    id: 'preset-002',
    title: 'Backend system design practice',
    stack: ['Spring Boot', 'PostgreSQL', 'Kafka'],
    level: 'Senior',
    durationMinutes: 60,
    focus: 'Architecture trade-offs, consistency, observability',
    attempts: 4,
  },
  {
    id: 'preset-003',
    title: 'Full-stack product interview',
    stack: ['Vue', 'Node.js', 'SQL'],
    level: 'Senior',
    durationMinutes: 75,
    focus: 'End-to-end feature delivery and communication',
    attempts: 3,
  },
]

export const mockRecommendations: LearningRecommendation[] = [
  {
    id: 'rec-001',
    title: 'How to explain API trade-offs clearly',
    type: 'article',
    area: 'Communication',
    estimatedMinutes: 12,
    reason: 'Your answers were technically correct but sometimes missed the business impact.',
  },
  {
    id: 'rec-002',
    title: 'Design a notification service from scratch',
    type: 'practice',
    area: 'System design',
    estimatedMinutes: 45,
    reason: 'You should practice capacity planning and failure modes before senior interviews.',
  },
  {
    id: 'rec-003',
    title: 'Build a small interview analytics dashboard',
    type: 'project',
    area: 'Frontend architecture',
    estimatedMinutes: 120,
    reason: 'A project will help connect component design, state, and API boundaries.',
  },
]

export const mockRoadmap: RoadmapStep[] = [
  {
    id: 'roadmap-001',
    week: 'Week 1',
    title: 'Tighten interview fundamentals',
    description: 'Practice concise answers, define assumptions early, and explain trade-offs before implementation details.',
    goals: ['Record two mock answers', 'Review STAR structure', 'Rewrite weak feedback areas'],
  },
  {
    id: 'roadmap-002',
    week: 'Week 2',
    title: 'Strengthen system design depth',
    description: 'Focus on scalability, data modeling, failure handling, and observability for product-facing systems.',
    goals: ['Complete one design prompt', 'Create architecture notes', 'Practice capacity estimates'],
  },
  {
    id: 'roadmap-003',
    week: 'Week 3',
    title: 'Run targeted mock interviews',
    description: 'Use stack-specific sessions to verify progress and produce a new AI feedback snapshot.',
    goals: ['Pass one frontend mock', 'Pass one backend mock', 'Compare score trends'],
  },
]

export function getSessionById(sessionId: string) {
  return mockSessions.find((session) => session.id === sessionId)
}

export function getSessionByCode(code: string) {
  return mockSessions.find((session) => session.sessionCode === code)
}

export function getScoreForSession(sessionId: string) {
  return mockScores.find((score) => score.sessionId === sessionId) ?? null
}

export function getQuestionsForSession(sessionId: string) {
  return mockQuestions.filter((question) => question.sessionId === sessionId)
}

export function getOrganizationById(organizationId: string) {
  return mockOrganizations.find((organization) => organization.id === organizationId)
}

export function getVacancyById(vacancyId: string) {
  return mockVacancies.find((vacancy) => vacancy.id === vacancyId)
}

export function getPublicVacancies() {
  return mockVacancies.filter((vacancy) => vacancy.isPublic && vacancy.status === 'published')
}

export function getApplicationsForVacancy(vacancyId: string) {
  return mockApplications.filter((application) => application.vacancyId === vacancyId)
}
