import { interviewRequest } from '@/api/client'
import type { CreateInterviewRequest, CreateInterviewResponse } from '@/types/api'

export function createInterview(data: CreateInterviewRequest) {
  return interviewRequest<CreateInterviewResponse>('/interviews', {
    method: 'POST',
    body: data,
  })
}
