export type SessionStatus = 'pending' | 'in-progress' | 'completed'

export type CandidateSession = {
  id: string
  sessionCode: string
  candidateName: string
  candidateEmail: string
  position: string
  level: 'Junior' | 'Mid' | 'Senior' | 'Lead'
  status: SessionStatus
  createdAt: string
  startedAt?: string
  completedAt?: string
  interviewerName?: string
  score?: number
  feedback?: string
}

export type InterviewQuestion = {
  id: string
  sessionId: string
  order: number
  category: 'intro' | 'coding' | 'design' | 'behavioral' | 'closing'
  title: string
  description: string
  timeLimit: number
  notes?: string
  answer?: string
  scoreGiven?: number
}

export type InterviewScore = {
  sessionId: string
  technicalSkill: number
  problemSolving: number
  communication: number
  codeQuality: number
  overallScore: number
  recommendation: 'strong-yes' | 'yes' | 'maybe' | 'no' | 'strong-no'
}

export type ChatMessage = {
  id: string
  role: 'assistant' | 'user'
  text: string
}

export type SkillLevel = 'Junior' | 'Mid' | 'Senior' | 'Lead'

export type InterviewMode = 'mock' | 'vacancy'

export type Organization = {
  id: string
  name: string
  industry: string
  plan: 'Starter' | 'Growth' | 'Enterprise'
  activeVacancies: number
  monthlyInterviews: number
}

export type VacancyStatus = 'draft' | 'published' | 'paused' | 'closed'

export type VacancyQuestion = {
  id: string
  title: string
  category: InterviewQuestion['category']
  difficulty: SkillLevel
  source: 'company' | 'question-bank'
}

export type Vacancy = {
  id: string
  organizationId: string
  organizationName: string
  title: string
  department: string
  description: string
  location: string
  employmentType: 'Full-time' | 'Part-time' | 'Contract' | 'Internship'
  salaryRange?: string
  level: SkillLevel
  status: VacancyStatus
  isPublic: boolean
  stack: string[]
  requiredSkills: string[]
  candidateCount: number
  interviewDurationMinutes: number
  customQuestions: VacancyQuestion[]
  createdAt: string
}

export type ApplicationStatus = 'applied' | 'invited' | 'interviewing' | 'review' | 'accepted' | 'rejected'

export type CandidateApplication = {
  id: string
  vacancyId: string
  candidateName: string
  candidateEmail: string
  status: ApplicationStatus
  score?: number
  appliedAt: string
  sessionId?: string
}

export type MockInterviewPreset = {
  id: string
  title: string
  stack: string[]
  level: SkillLevel
  durationMinutes: number
  focus: string
  attempts: number
}

export type LearningRecommendation = {
  id: string
  title: string
  type: 'article' | 'practice' | 'project'
  area: string
  estimatedMinutes: number
  reason: string
}

export type RoadmapStep = {
  id: string
  week: string
  title: string
  description: string
  goals: string[]
}
