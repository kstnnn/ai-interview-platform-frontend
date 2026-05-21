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

export type CreateInterviewRequest = {
  userId: string
  minQuestions: number
  maxQuestions: number
  interviewLevel: InterviewLevel
  technologyKeys: string[]
}

export type CreateInterviewResponse = {
  sessionId: string
  status: 'CREATED' | 'IN_PROGRESS' | 'FINISHED'
  interviewLevel: InterviewLevel
  minQuestions: number
  maxQuestions: number
  technologyKeys: string[]
  createdAt: string
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

export type InterviewResult = {
  sessionId: string
  sessionConfidence: number
  topics: InterviewTopicResult[]
}
