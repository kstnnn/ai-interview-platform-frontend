import { apiRequest, interviewRequest } from '@/api/client'
import type {
  AdminQuestionQuery,
  AdminQuestionRequest,
  AdminQuestionResponse,
  AdminUserQuery,
  AdminUserResponse,
  PageResponse,
} from '@/types/api'

function cleanQuery<T extends Record<string, unknown>>(query: T) {
  return Object.fromEntries(
    Object.entries(query).filter(([, value]) => value !== '' && value !== undefined && value !== null),
  )
}

export function getAdminUsers(query: AdminUserQuery) {
  return apiRequest<PageResponse<AdminUserResponse>>('/admin/users', { query: cleanQuery(query) })
}

export function getAdminUser(userId: string) {
  return apiRequest<AdminUserResponse>(`/admin/users/${userId}`)
}

export function blockAdminUser(userId: string) {
  return apiRequest<AdminUserResponse>(`/admin/users/${userId}/block`, { method: 'POST' })
}

export function unblockAdminUser(userId: string) {
  return apiRequest<AdminUserResponse>(`/admin/users/${userId}/unblock`, { method: 'POST' })
}

export function getAdminQuestions(query: AdminQuestionQuery) {
  return interviewRequest<PageResponse<AdminQuestionResponse>>('/admin/questions', { query: cleanQuery(query) })
}

export function getAdminQuestion(questionId: string) {
  return interviewRequest<AdminQuestionResponse>(`/admin/questions/${questionId}`)
}

export function createAdminQuestion(data: AdminQuestionRequest) {
  return interviewRequest<AdminQuestionResponse>('/admin/questions', { method: 'POST', body: data })
}

export function updateAdminQuestion(questionId: string, data: Omit<AdminQuestionRequest, 'externalId'>) {
  return interviewRequest<AdminQuestionResponse>(`/admin/questions/${questionId}`, { method: 'PATCH', body: data })
}

export function activateAdminQuestion(questionId: string) {
  return interviewRequest<AdminQuestionResponse>(`/admin/questions/${questionId}/activate`, { method: 'POST' })
}

export function deactivateAdminQuestion(questionId: string) {
  return interviewRequest<AdminQuestionResponse>(`/admin/questions/${questionId}/deactivate`, { method: 'POST' })
}

export function syncQuestionVectorStore() {
  return interviewRequest<void>('/questions/sync/vector', { method: 'POST' })
}

export function importBundledQuestions() {
  return interviewRequest<void>('/questions/import', { method: 'POST' })
}

export function deleteQuestionVectorCollection() {
  return interviewRequest<void>('/questions/delete', { method: 'POST' })
}
