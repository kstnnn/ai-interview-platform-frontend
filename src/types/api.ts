export type UserType = 'PERSONAL' | 'BUSINESS'
export type UserStatus = 'ACTIVE' | 'DISABLED'
export type UserRole = 'CANDIDATE' | 'MANAGER'

export type CreateUserRequest = {
  providerUserId: string
  email: string
  userType: UserType
  firstName: string
  lastName?: string | null
  roles: UserRole[]
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

export type InterviewLevel = 'JUNIOR' | 'MIDDLE' | 'SENIOR'
export type InterviewLanguage = 'Russian' | 'English'

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
  status: InterviewSessionStatus
  interviewLevel: InterviewLevel
  interviewLanguage: InterviewLanguage
  technologyKeys: string[]
  sessionConfidence: number | null
  startedAt: string | null
  finishedAt: string | null
  questionsAsked: number
}

export type STOMPEventType = 'GREETING' | 'QUESTION_ASKED' | 'ANSWER_EVALUATED' | 'FEEDBACK' | 'SESSION_FINISHED' | 'ERROR'

export type STOMPEvent = {
  type: STOMPEventType
  payload: Record<string, unknown>
}

export type InterviewTopicResult = {
  topic: string
  questionsAsked: number
  masteryScore: number
  confidenceScore: number
  avgScore: number
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
}

export type ApplicationStatus = 'INTERVIEW_CREATED' | 'INTERVIEW_IN_PROGRESS' | 'INTERVIEW_COMPLETED' | 'REJECTED' | 'WITHDRAWN'

export type VacancyApplicationResponse = {
  applicationId: string
  vacancyId: string
  candidateUserId: string
  status: ApplicationStatus
  interviewSessionId: string
  coverLetter: string | null
  createdAt: string
  updatedAt: string
}

export type VacancyApplicationSummary = VacancyApplicationResponse
