import { interviewRequest, publicInterviewRequest } from '@/api/client'
import type { CreateInterviewRequest, CreateInterviewResponse, InterviewResult, InterviewSessionDetails, InterviewSessionSummary, LearningRoadmapResponse, TechnologyGroupResponse, TechnologyResponse } from '@/types/api'

export function createInterview(data: CreateInterviewRequest) {
  return interviewRequest<CreateInterviewResponse>('/interviews', {
    method: 'POST',
    body: data,
  })
}

export function getInterviewReport(sessionId: string) {
  return interviewRequest<InterviewResult>(`/interviews/${sessionId}/report`)
}

export function getInterviewSession(sessionId: string) {
  return interviewRequest<InterviewSessionDetails>(`/interviews/${sessionId}`)
}

export function getLearningRoadmap(sessionId: string, language: 'en' | 'ru') {
  return interviewRequest<LearningRoadmapResponse>(`/interviews/${sessionId}/learning-roadmap`, {
    query: { language },
    headers: { 'Accept-Language': language },
  })
}

export function getUserLearningRoadmap(language: 'en' | 'ru') {
  return interviewRequest<LearningRoadmapResponse>('/interviews/learning-roadmap', {
    query: { language },
    headers: { 'Accept-Language': language },
  })
}

export function getMyInterviews() {
  return interviewRequest<InterviewSessionSummary[]>('/interviews/my')
}

export function getTechnologies() {
  return publicInterviewRequest<TechnologyResponse[]>('/technologies')
}

export function getGroupedTechnologies() {
  return publicInterviewRequest<TechnologyGroupResponse[]>('/technologies/grouped')
}
