import { interviewRequest } from '@/api/client'
import type { CreateInterviewRequest, CreateInterviewResponse, InterviewResult, InterviewSessionSummary } from '@/types/api'

export function createInterview(data: CreateInterviewRequest) {
  return interviewRequest<CreateInterviewResponse>('/interviews', {
    method: 'POST',
    body: data,
  })
}

export function getInterviewReport(sessionId: string) {
  return interviewRequest<InterviewResult>(`/interviews/${sessionId}/report`)
}

export function getMyInterviews() {
  return interviewRequest<InterviewSessionSummary[]>('/interviews/my')
}
