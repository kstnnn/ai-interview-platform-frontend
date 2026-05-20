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

const STORAGE_KEY = 'techscreen-locale'

function getLocale(): 'en' | 'ru' {
  const stored = typeof window !== 'undefined' ? window.localStorage.getItem(STORAGE_KEY) : null
  if (stored === 'en' || stored === 'ru') return stored
  return typeof window !== 'undefined' && window.navigator.language.toLowerCase().startsWith('ru') ? 'ru' : 'en'
}

const mockTranslations: Record<string, Record<string, string>> = {
  en: {
    'session.session-001.position': 'Senior Full-Stack Engineer',
    'session.session-001.interviewerName': 'Alex Johnson',
    'session.session-001.feedback': 'Strong technical foundation with excellent system design knowledge. Clear, structured communication throughout the interview.',
    'session.session-002.position': 'Full-Stack Engineer',
    'session.session-002.interviewerName': 'Emma Watson',
    'session.session-002.feedback': 'Good foundation. Would benefit from a deeper understanding of distributed systems and system trade-offs.',
    'session.session-003.position': 'Frontend Engineer',
    'session.session-003.interviewerName': 'David Chen',
    'session.session-004.position': 'Backend Engineer',
    'question.q-001.title': 'Two Sum Problem',
    'question.q-001.description': 'Given an array of integers and a target, how would you find two numbers that add up to the target efficiently?',
    'question.q-001.notes': 'Clean O(n) solution using a map. Good explanation of time and space complexity.',
    'question.q-002.title': 'Design a URL Shortener',
    'question.q-002.description': 'How would you design a scalable URL shortener with fast lookups and collision avoidance?',
    'question.q-002.notes': 'Strong system design discussion covering sharding, cache, and failure handling.',
    'question.q-003.title': 'Handling Disagreements',
    'question.q-003.description': 'Tell me about a time you disagreed with a teammate on a technical decision. How did you resolve it?',
    'question.q-003.notes': 'Balanced answer with empathy and decision-making discipline.',
    'org.org-001.name': 'Northstar Labs',
    'org.org-001.industry': 'Fintech infrastructure',
    'vacancy.vacancy-001.title': 'Senior Full-Stack Engineer',
    'vacancy.vacancy-001.department': 'Core Platform',
    'vacancy.vacancy-001.description': 'Build customer-facing analytics and internal workflow tools for a fintech platform used by operations teams every day.',
    'vacancy.vacancy-001.location': 'Remote / Europe',
    'vacancy.vacancy-001.q-vq-001.title': 'How would you design tenant isolation for a multi-tenant reporting service?',
    'vacancy.vacancy-001.q-vq-002.title': 'Explain how you would debug slow Vue rendering in a large table.',
    'vacancy.vacancy-002.title': 'Backend Engineer',
    'vacancy.vacancy-002.department': 'Payments',
    'vacancy.vacancy-002.description': 'Work on payment workflows, event-driven services, and reliable financial transaction processing.',
    'vacancy.vacancy-002.location': 'Hybrid / Warsaw',
    'vacancy.vacancy-003.title': 'Frontend Engineer',
    'vacancy.vacancy-003.department': 'Product Experience',
    'vacancy.vacancy-003.description': 'Create accessible product interfaces, reusable components, and high-quality user experiences for complex workflows.',
    'vacancy.vacancy-003.q-vq-003.title': 'Describe how you structure reusable form components with validation.',
    'preset.preset-001.title': 'Frontend readiness check',
    'preset.preset-001.focus': 'Components, browser APIs, practical debugging',
    'preset.preset-002.title': 'Backend system design practice',
    'preset.preset-002.focus': 'Architecture trade-offs, consistency, observability',
    'preset.preset-003.title': 'Full-stack product interview',
    'preset.preset-003.focus': 'End-to-end feature delivery and communication',
    'recommendation.rec-001.title': 'How to explain API trade-offs clearly',
    'recommendation.rec-001.reason': 'Your answers were technically correct but sometimes missed the business impact.',
    'recommendation.rec-002.title': 'Design a notification service from scratch',
    'recommendation.rec-002.reason': 'You should practice capacity planning and failure modes before senior interviews.',
    'recommendation.rec-003.title': 'Build a small interview analytics dashboard',
    'recommendation.rec-003.reason': 'A project will help connect component design, state, and API boundaries.',
    'roadmap.roadmap-001.week': 'Week 1',
    'roadmap.roadmap-001.title': 'Tighten interview fundamentals',
    'roadmap.roadmap-001.description': 'Practice concise answers, define assumptions early, and explain trade-offs before implementation details.',
    'roadmap.roadmap-001.goal-0': 'Record two mock answers',
    'roadmap.roadmap-001.goal-1': 'Review STAR structure',
    'roadmap.roadmap-001.goal-2': 'Rewrite weak feedback areas',
    'roadmap.roadmap-002.week': 'Week 2',
    'roadmap.roadmap-002.title': 'Strengthen system design depth',
    'roadmap.roadmap-002.description': 'Focus on scalability, data modeling, failure handling, and observability for product-facing systems.',
    'roadmap.roadmap-002.goal-0': 'Complete one design prompt',
    'roadmap.roadmap-002.goal-1': 'Create architecture notes',
    'roadmap.roadmap-002.goal-2': 'Practice capacity estimates',
    'roadmap.roadmap-003.week': 'Week 3',
    'roadmap.roadmap-003.title': 'Run targeted mock interviews',
    'roadmap.roadmap-003.description': 'Use stack-specific sessions to verify progress and produce a new AI feedback snapshot.',
    'roadmap.roadmap-003.goal-0': 'Pass one frontend mock',
    'roadmap.roadmap-003.goal-1': 'Pass one backend mock',
    'roadmap.roadmap-003.goal-2': 'Compare score trends',
    'scriptedInterview.0': 'Tell me a bit about yourself and the kind of engineering work you enjoy most.',
    'scriptedInterview.1': 'Describe a recent technical problem you solved and how you approached it.',
    'scriptedInterview.2': 'When you design a feature, how do you balance speed of delivery with maintainability?',
    'scriptedInterview.3': 'Tell me about a disagreement you had with a teammate and how you handled it.',
    'scriptedInterview.4': 'What would you improve in your current team or delivery process if you could?',
    'scriptedInterview.5': 'Do you have any questions for the interviewer before we wrap up?',
  },
  ru: {
    'session.session-001.position': 'Senior Full-Stack Engineer',
    'session.session-001.interviewerName': 'Алекс Джонсон',
    'session.session-001.feedback': 'Сильная техническая база и отличные знания системного дизайна. Чёткая, структурированная коммуникация на протяжении всего интервью.',
    'session.session-002.position': 'Full-Stack Engineer',
    'session.session-002.interviewerName': 'Эмма Уотсон',
    'session.session-002.feedback': 'Хорошая база. Было бы полезно глубже разобраться в распределённых системах и системных trade-offs.',
    'session.session-003.position': 'Frontend Engineer',
    'session.session-003.interviewerName': 'Дэвид Чен',
    'session.session-004.position': 'Backend Engineer',
    'question.q-001.title': 'Задача Two Sum',
    'question.q-001.description': 'Дан массив целых чисел и целевое значение. Как эффективно найти два числа, которые в сумме дают целевое?',
    'question.q-001.notes': 'Чистое решение O(n) с использованием map. Хорошее объяснение временной и пространственной сложности.',
    'question.q-002.title': 'Спроектировать сокращатель URL',
    'question.q-002.description': 'Как спроектировать масштабируемый сокращатель URL с быстрым поиском и предотвращением коллизий?',
    'question.q-002.notes': 'Сильное обсуждение системного дизайна, охватывающее шардирование, кэш и обработку отказов.',
    'question.q-003.title': 'Разрешение разногласий',
    'question.q-003.description': 'Расскажите о случае, когда вы не согласились с коллегой по техническому решению. Как вы это разрешили?',
    'question.q-003.notes': 'Сбалансированный ответ с эмпатией и дисциплиной принятия решений.',
    'org.org-001.name': 'Northstar Labs',
    'org.org-001.industry': 'Инфраструктура финтеха',
    'vacancy.vacancy-001.title': 'Senior Full-Stack Engineer',
    'vacancy.vacancy-001.department': 'Основная платформа',
    'vacancy.vacancy-001.description': 'Создание аналитики для клиентов и внутренних инструментов для финтех-платформы, которую команды используют каждый день.',
    'vacancy.vacancy-001.location': 'Удалённо / Европа',
    'vacancy.vacancy-001.q-vq-001.title': 'Как бы вы спроектировали изоляцию арендаторов для мультитенантного сервиса отчётности?',
    'vacancy.vacancy-001.q-vq-002.title': 'Объясните, как отлаживать медленный рендеринг Vue в большой таблице.',
    'vacancy.vacancy-002.title': 'Backend Engineer',
    'vacancy.vacancy-002.department': 'Платежи',
    'vacancy.vacancy-002.description': 'Работа над платёжными процессами, event-driven сервисами и надёжной обработкой финансовых транзакций.',
    'vacancy.vacancy-002.location': 'Гибрид / Варшава',
    'vacancy.vacancy-003.title': 'Frontend Engineer',
    'vacancy.vacancy-003.department': 'Продуктовый опыт',
    'vacancy.vacancy-003.description': 'Создание доступных интерфейсов, переиспользуемых компонентов и высококачественного UX для сложных рабочих процессов.',
    'vacancy.vacancy-003.q-vq-003.title': 'Опишите, как вы структурируете переиспользуемые компоненты форм с валидацией.',
    'preset.preset-001.title': 'Проверка готовности к Frontend',
    'preset.preset-001.focus': 'Компоненты, браузерные API, практическая отладка',
    'preset.preset-002.title': 'Практика системного дизайна Backend',
    'preset.preset-002.focus': 'Архитектурные trade-offs, консистентность, наблюдаемость',
    'preset.preset-003.title': 'Full-stack продуктовое интервью',
    'preset.preset-003.focus': 'Сквозная разработка фич и коммуникация',
    'recommendation.rec-001.title': 'Как ясно объяснять trade-offs API',
    'recommendation.rec-001.reason': 'Ваши ответы были технически верными, но иногда упускали бизнес-влияние.',
    'recommendation.rec-002.title': 'Спроектировать сервис уведомлений с нуля',
    'recommendation.rec-002.reason': 'Вам стоит попрактиковаться в планировании мощности и режимах отказов перед senior-интервью.',
    'recommendation.rec-003.title': 'Создать небольшой дашборд аналитики интервью',
    'recommendation.rec-003.reason': 'Проект поможет связать дизайн компонентов, состояние и API.',
    'roadmap.roadmap-001.week': 'Неделя 1',
    'roadmap.roadmap-001.title': 'Укрепите основы интервью',
    'roadmap.roadmap-001.description': 'Практикуйте лаконичные ответы, определяйте предположения заранее и объясняйте trade-offs до деталей реализации.',
    'roadmap.roadmap-001.goal-0': 'Запишите два mock-ответа',
    'roadmap.roadmap-001.goal-1': 'Изучите структуру STAR',
    'roadmap.roadmap-001.goal-2': 'Переработайте слабые области фидбека',
    'roadmap.roadmap-002.week': 'Неделя 2',
    'roadmap.roadmap-002.title': 'Углубите системный дизайн',
    'roadmap.roadmap-002.description': 'Сосредоточьтесь на масштабируемости, моделировании данных, обработке отказов и наблюдаемости для продуктовых систем.',
    'roadmap.roadmap-002.goal-0': 'Выполните один дизайн-промпт',
    'roadmap.roadmap-002.goal-1': 'Создайте архитектурные заметки',
    'roadmap.roadmap-002.goal-2': 'Практикуйте оценку мощности',
    'roadmap.roadmap-003.week': 'Неделя 3',
    'roadmap.roadmap-003.title': 'Проведите целевые mock-интервью',
    'roadmap.roadmap-003.description': 'Используйте сессии по стеку для проверки прогресса и получения нового AI-фидбека.',
    'roadmap.roadmap-003.goal-0': 'Пройдите один frontend mock',
    'roadmap.roadmap-003.goal-1': 'Пройдите один backend mock',
    'roadmap.roadmap-003.goal-2': 'Сравните тренды оценок',
    'scriptedInterview.0': 'Расскажите немного о себе и какой инженерной работой вам нравится заниматься больше всего.',
    'scriptedInterview.1': 'Опишите недавнюю техническую проблему, которую вы решили, и как вы к ней подошли.',
    'scriptedInterview.2': 'Когда вы проектируете фичу, как вы балансируете между скоростью доставки и поддерживаемостью?',
    'scriptedInterview.3': 'Расскажите о разногласии с коллегой и как вы его разрешили.',
    'scriptedInterview.4': 'Что бы вы улучшили в своей текущей команде или процессе доставки, если бы могли?',
    'scriptedInterview.5': 'Есть ли у вас вопросы к интервьюеру перед завершением?',
  },
}

function t(key: string): string {
  const locale = getLocale()
  return mockTranslations[locale]?.[key] ?? mockTranslations.en[key] ?? key
}

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

export function getLocalizedSessions(): CandidateSession[] {
  return mockSessions.map((s) => ({
    ...s,
    position: t(`session.${s.id}.position`),
    interviewerName: t(`session.${s.id}.interviewerName`),
    feedback: s.feedback ? t(`session.${s.id}.feedback`) : s.feedback,
  }))
}

export function getLocalizedQuestions(sessionId: string): InterviewQuestion[] {
  return mockQuestions
    .filter((q) => q.sessionId === sessionId)
    .map((q) => ({
      ...q,
      title: t(`question.${q.id}.title`),
      description: t(`question.${q.id}.description`),
      notes: q.notes ? t(`question.${q.id}.notes`) : q.notes,
    }))
}

export function getLocalizedScriptedQuestions(): string[] {
  return scriptedInterviewQuestions.map((_, i) => t(`scriptedInterview.${i}`))
}

export function getLocalizedOrganizations(): Organization[] {
  return mockOrganizations.map((o) => ({
    ...o,
    name: t(`org.${o.id}.name`),
    industry: t(`org.${o.id}.industry`),
  }))
}

export function getLocalizedVacancies(): Vacancy[] {
  return mockVacancies.map((v) => ({
    ...v,
    title: t(`vacancy.${v.id}.title`),
    department: t(`vacancy.${v.id}.department`),
    description: t(`vacancy.${v.id}.description`),
    location: t(`vacancy.${v.id}.location`),
    customQuestions: v.customQuestions.map((q) => ({
      ...q,
      title: t(`vacancy.${v.id}.q-${q.id}.title`),
    })),
  }))
}

export function getLocalizedPresets(): MockInterviewPreset[] {
  return mockInterviewPresets.map((p) => ({
    ...p,
    title: t(`preset.${p.id}.title`),
    focus: t(`preset.${p.id}.focus`),
  }))
}

export function getLocalizedRecommendations(): LearningRecommendation[] {
  return mockRecommendations.map((r) => ({
    ...r,
    title: t(`recommendation.${r.id}.title`),
    reason: t(`recommendation.${r.id}.reason`),
  }))
}

export function getLocalizedRoadmap(): RoadmapStep[] {
  return mockRoadmap.map((step) => ({
    ...step,
    week: t(`roadmap.${step.id}.week`),
    title: t(`roadmap.${step.id}.title`),
    description: t(`roadmap.${step.id}.description`),
    goals: step.goals.map((_, i) => t(`roadmap.${step.id}.goal-${i}`)),
  }))
}

export function getSessionById(sessionId: string) {
  return getLocalizedSessions().find((session) => session.id === sessionId)
}

export function getSessionByCode(code: string) {
  return getLocalizedSessions().find((session) => session.sessionCode === code)
}

export function getScoreForSession(sessionId: string) {
  return mockScores.find((score) => score.sessionId === sessionId) ?? null
}

export function getQuestionsForSession(sessionId: string) {
  return getLocalizedQuestions(sessionId)
}

export function getOrganizationById(organizationId: string) {
  return getLocalizedOrganizations().find((organization) => organization.id === organizationId)
}

export function getVacancyById(vacancyId: string) {
  return getLocalizedVacancies().find((vacancy) => vacancy.id === vacancyId)
}

export function getPublicVacancies() {
  return getLocalizedVacancies().filter((vacancy) => vacancy.isPublic && vacancy.status === 'published')
}

export function getApplicationsForVacancy(vacancyId: string) {
  return mockApplications.filter((application) => application.vacancyId === vacancyId)
}
