import { interviewRequest, publicInterviewRequest } from '@/api/client'
import { getAccessToken } from '@/auth/zitadel'
import type { CreateInterviewRequest, CreateInterviewResponse, InterviewResult, InterviewSessionDetails, InterviewSessionSummary, LearningRoadmapResponse, TechnologyGroupResponse, TechnologyResponse, VoiceSynthesisRequest, VoiceTranscriptionResponse } from '@/types/api'

const INTERVIEW_API_BASE_URL = import.meta.env.VITE_INTERVIEW_API_BASE_URL ?? 'http://localhost:8081/api/v1'

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

export function transcribeInterviewAudio(sessionId: string, audioFile: File, signal?: AbortSignal) {
  const formData = new FormData()
  formData.append('audio', audioFile)

  return interviewRequest<VoiceTranscriptionResponse>(`/interviews/${sessionId}/voice/transcribe`, {
    method: 'POST',
    body: formData,
    signal,
  })
}

export async function synthesizeInterviewSpeech(data: VoiceSynthesisRequest) {
  const token = await getAccessToken()
  const accessToken = typeof token === 'string' ? token.trim() : ''

  if (!accessToken) {
    throw new Error('Missing authentication token.')
  }

  const response = await fetch(`${INTERVIEW_API_BASE_URL}/interviews/voice/synthesize`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    throw new Error(response.statusText || 'Speech synthesis failed.')
  }

  return response.blob()
}
