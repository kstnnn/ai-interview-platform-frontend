export type UserType = 'PERSONAL' | 'BUSINESS'
export type UserStatus = 'ACTIVE' | 'PENDING_ONBOARDING' | 'BLOCKED' | 'DELETED' | 'DISABLED'
export type UserRole = 'CANDIDATE' | 'MANAGER' | 'ADMIN'

export type CreateUserRequest = {
  providerUserId: string
  email: string
  userType: UserType
  firstName: string
  lastName?: string | null
  roles?: UserRole[]
}

export type UserResponse = {
  id: string
  email: string
  firstName: string | null
  lastName: string | null
  emailVerified: boolean
  userType: UserType
  userStatus: UserStatus
  createdAt: string
}

export type AuthUserResponse = {
  id: string
  userStatus: UserStatus
  roles: UserRole[]
}

export type PageResponse<T> = {
  content: T[]
  totalElements: number
  totalPages: number
  size: number
  number: number
}

export type AdminUserResponse = UserResponse & {
  roles: UserRole[]
}

export type AdminUserQuery = {
  search?: string
  userType?: UserType | ''
  userStatus?: UserStatus | ''
  role?: UserRole | ''
  page?: number
  size?: number
  sort?: string
}

export type QuestionDifficulty = 'EASY' | 'MEDIUM' | 'HARD' | string

export type AdminQuestionTechnology = {
  id: number
  key: string
  displayName: string
}

export type AdminQuestionResponse = {
  id: string
  externalId: string
  technology: AdminQuestionTechnology
  topic: string
  subtopic: string | null
  difficulty: QuestionDifficulty
  questionText: string
  expectedAnswer: string
  active: boolean
  createdAt: string
  updatedAt: string
}

export type AdminQuestionRequest = {
  externalId?: string | null
  technologyKey: string
  topic: string
  subtopic?: string | null
  difficulty: QuestionDifficulty
  questionText: string
  expectedAnswer: string
  active: boolean
}

export type AdminQuestionQuery = {
  search?: string
  technologyKey?: string
  difficulty?: string
  active?: boolean | ''
  page?: number
  size?: number
  sort?: string
}

export type InterviewLevel = 'JUNIOR' | 'MIDDLE' | 'SENIOR'
export type InterviewLanguage = 'Russian' | 'English'
export type InterviewSessionType = 'MOCK' | 'VACANCY_APPLICATION'

export type TechnologyResponse = {
  key: string
  displayName: string
  groupKey?: string | null
  groupName?: string | null
  sortOrder?: number | null
}

export type TechnologyGroupResponse = {
  groupKey: string
  groupName: string
  items: TechnologyResponse[]
}

export type CreateInterviewRequest = {
  userId: string
  minQuestions: number
  maxQuestions: number
  interviewLevel: InterviewLevel
  interviewLanguage: InterviewLanguage
  technologyKeys: string[]
}

export type CreateInterviewResponse = {
  sessionId: string
  status: 'CREATED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'FINISHED'
  interviewLevel: InterviewLevel
  interviewLanguage?: InterviewLanguage
  minQuestions: number
  maxQuestions: number
  technologyKeys: string[]
  createdAt: string
}

export type InterviewSessionStatus = 'CREATED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'

export type InterviewSessionSummary = {
  sessionId: string
  sessionType: InterviewSessionType
  status: InterviewSessionStatus
  interviewLevel: InterviewLevel
  interviewLanguage: InterviewLanguage
  technologyKeys: string[]
  sessionConfidence: number | null
  startedAt: string | null
  finishedAt: string | null
  questionsAsked: number
}

export type InterviewSessionDetails = {
  sessionId: string
  sessionType: InterviewSessionType
  status: InterviewSessionStatus
  interviewLevel: InterviewLevel
  interviewLanguage: InterviewLanguage
  vacancyId: string | null
  applicationId: string | null
  startedAt: string | null
  finishedAt: string | null
}

export type STOMPEventType = 'GREETING' | 'QUESTION_ASKED' | 'ANSWER_EVALUATED' | 'FEEDBACK' | 'SESSION_FINISHED' | 'ERROR'

export type STOMPEvent = {
  type: STOMPEventType
  payload: Record<string, unknown>
}

export type InterviewTopicResult = {
  topic: string
  questionsAsked: number
  masteryScore: number | null
  confidenceScore: number | null
  avgScore: number | null
}

export type InterviewQuestionReport = {
  sessionQuestionId: string
  roundNumber: number
  questionIndex: number
  questionType: string
  topic: string
  subtopic: string | null
  difficulty: string | null
  questionText: string
  answerText: string | null
  correctnessScore: number | null
  depthScore: number | null
  practicalScore: number | null
  totalScore: number | null
  feedback: string | null
  knowledgeGaps: string[]
  sourceType?: 'QUESTION_BANK' | 'VACANCY_CUSTOM' | 'AI_FOLLOW_UP'
}

export type InterviewResult = {
  sessionId: string
  status?: string
  finishedReason?: string | null
  interviewLevel?: InterviewLevel
  interviewLanguage?: InterviewLanguage
  sessionConfidence: number
  startedAt?: string | null
  finishedAt?: string | null
  topics: InterviewTopicResult[]
  questions?: InterviewQuestionReport[]
}

export type LearningRoadmapTrend = 'IMPROVING' | 'DECLINING' | 'STABLE' | 'NEW'
export type LearningRoadmapPriority = 'HIGH' | 'MEDIUM' | 'LOW'
export type LearningRoadmapResourceType = 'ARTICLE' | 'DOC' | 'VIDEO' | 'PRACTICE' | string

export type LearningRoadmapResource = {
  title: string
  url: string
  type: LearningRoadmapResourceType
  language: LocaleString
}

export type LocaleString = 'en' | 'ru' | string

export type LearningRoadmapTopic = {
  topic: string
  score?: number
  currentScore?: number
  previousScore?: number | null
  trend?: LearningRoadmapTrend
  priority?: LearningRoadmapPriority
  reason: string
  recommendedActions: string[]
  resources: LearningRoadmapResource[]
}

export type LearningRoadmapResponse = {
  sessionId?: string
  userId?: string
  language: LocaleString
  updatedAt?: string
  sourceSessionIds?: string[]
  summary: string
  priorityTopics: LearningRoadmapTopic[]
}

export type OrganizationStatus = 'ACTIVE' | 'ARCHIVED'
export type VacancyStatus = 'DRAFT' | 'PUBLISHED' | 'CLOSED' | 'ARCHIVED'
export type EmploymentType = 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERNSHIP'
export type WorkFormat = 'REMOTE' | 'HYBRID' | 'ONSITE'
export type VacancyLevel = 'JUNIOR' | 'MIDDLE' | 'SENIOR'

export type OrganizationResponse = {
  id: string
  ownerUserId: string
  name: string
  description: string | null
  websiteUrl: string | null
  logoUrl: string | null
  status: OrganizationStatus
  createdAt: string
  updatedAt: string
}

export type CreateOrganizationRequest = {
  name: string
  description?: string | null
  websiteUrl?: string | null
  logoUrl?: string | null
}

export type VacancyResponse = {
  id: string
  organizationId: string
  organizationName: string
  title: string
  description: string
  requirements: string | null
  location: string | null
  employmentType: EmploymentType
  workFormat: WorkFormat
  level: VacancyLevel
  status: VacancyStatus
  createdByUserId: string
  technologyKeys: string[]
  minPrimaryQuestions: number
  maxPrimaryQuestions: number
  maxFollowUpsPerPrimary: number
  estimatedMaxTotalQuestions: number
  createdAt: string
  updatedAt: string
}

export type CreateVacancyRequest = {
  title: string
  description: string
  requirements?: string | null
  location?: string | null
  employmentType: EmploymentType
  workFormat: WorkFormat
  level: VacancyLevel
  technologyKeys?: string[]
  minPrimaryQuestions?: number
  maxPrimaryQuestions?: number
  maxFollowUpsPerPrimary?: number
}

export type UpdateVacancyRequest = Partial<CreateVacancyRequest>

export type VacancyQuestionRequest = {
  questionText: string
  expectedAnswer?: string | null
  evaluationRubric?: string | null
  topic?: string | null
  required: boolean
  displayOrder: number
}

export type VacancyQuestionResponse = {
  id: string
  vacancyId: string
  questionText: string
  expectedAnswer: string | null
  evaluationRubric: string | null
  topic: string | null
  required: boolean
  displayOrder: number
  active: boolean
  createdAt: string
  updatedAt: string
}

export type VacancyApplicationRequest = {
  coverLetter?: string | null
  candidateContacts: CandidateContacts
}

export type ApplicationStatus = 'INTERVIEW_CREATED' | 'INTERVIEW_IN_PROGRESS' | 'INTERVIEW_COMPLETED' | 'REJECTED' | 'WITHDRAWN'
export type ApplicationRecommendation = 'STRONG_YES' | 'YES' | 'MAYBE' | 'NO' | 'STRONG_NO'

export type CandidateContacts = {
  email: string | null
  phone: string | null
  telegram: string | null
  linkedIn: string | null
  portfolioUrl: string | null
  hhResumeUrl: string | null
}

export type ApplicationCandidate = {
  userId: string
  firstName: string | null
  lastName: string | null
  email: string | null
  contacts: CandidateContacts
}

export type VacancyApplicationResponse = {
  applicationId: string
  vacancyId: string
  candidateUserId: string
  candidateName?: string | null
  candidateContacts: CandidateContacts
  status: ApplicationStatus
  interviewSessionId: string | null
  sessionConfidence?: number | null
  recommendation?: ApplicationRecommendation | null
  coverLetter: string | null
  createdAt: string
  updatedAt: string
  completedAt?: string | null
}

export type VacancyApplicationSummary = VacancyApplicationResponse

export type EmployerApplicationReport = {
  applicationId: string
  vacancyId: string
  interviewSessionId: string
  candidate: ApplicationCandidate
  status: ApplicationStatus
  sessionConfidence: number | null
  recommendation: ApplicationRecommendation | null
  topics: InterviewTopicResult[]
  questions: InterviewQuestionReport[]
  createdAt: string
  completedAt: string | null
}
