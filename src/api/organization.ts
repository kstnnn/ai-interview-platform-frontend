import { organizationRequest, publicOrganizationRequest } from '@/api/client'
import type {
  CreateOrganizationRequest,
  CreateVacancyRequest,
  EmployerApplicationReport,
  OrganizationResponse,
  UpdateVacancyRequest,
  VacancyApplicationRequest,
  VacancyApplicationResponse,
  VacancyApplicationSummary,
  VacancyQuestionRequest,
  VacancyQuestionResponse,
  VacancyResponse,
} from '@/types/api'

export function getMyOrganizations() {
  return organizationRequest<OrganizationResponse[]>('/organizations/my')
}

export function createOrganization(data: CreateOrganizationRequest) {
  return organizationRequest<OrganizationResponse>('/organizations', {
    method: 'POST',
    body: data,
  })
}

export function getOrganization(organizationId: string) {
  return organizationRequest<OrganizationResponse>(`/organizations/${organizationId}`)
}

export function updateOrganization(organizationId: string, data: Partial<CreateOrganizationRequest>) {
  return organizationRequest<OrganizationResponse>(`/organizations/${organizationId}`, {
    method: 'PATCH',
    body: data,
  })
}

export function createVacancy(organizationId: string, data: CreateVacancyRequest) {
  return organizationRequest<VacancyResponse>(`/organizations/${organizationId}/vacancies`, {
    method: 'POST',
    body: data,
  })
}

export function getOrganizationVacancies(organizationId: string) {
  return organizationRequest<VacancyResponse[]>(`/organizations/${organizationId}/vacancies`)
}

export function getPublicVacancies() {
  return publicOrganizationRequest<VacancyResponse[]>('/vacancies/public')
}

export function getPublicVacancy(vacancyId: string) {
  return publicOrganizationRequest<VacancyResponse>(`/vacancies/public/${vacancyId}`)
}

export function getVacancy(vacancyId: string) {
  return organizationRequest<VacancyResponse>(`/vacancies/${vacancyId}`)
}

export function updateVacancy(vacancyId: string, data: UpdateVacancyRequest) {
  return organizationRequest<VacancyResponse>(`/vacancies/${vacancyId}`, {
    method: 'PATCH',
    body: data,
  })
}

export function publishVacancy(vacancyId: string) {
  return organizationRequest<VacancyResponse>(`/vacancies/${vacancyId}/publish`, { method: 'POST' })
}

export function draftVacancy(vacancyId: string) {
  return organizationRequest<VacancyResponse>(`/vacancies/${vacancyId}/draft`, { method: 'POST' })
}

export function closeVacancy(vacancyId: string) {
  return organizationRequest<VacancyResponse>(`/vacancies/${vacancyId}/close`, { method: 'POST' })
}

export function getVacancyQuestions(vacancyId: string) {
  return organizationRequest<VacancyQuestionResponse[]>(`/vacancies/${vacancyId}/questions`)
}

export function createVacancyQuestion(vacancyId: string, data: VacancyQuestionRequest) {
  return organizationRequest<VacancyQuestionResponse>(`/vacancies/${vacancyId}/questions`, {
    method: 'POST',
    body: data,
  })
}

export function updateVacancyQuestion(vacancyId: string, questionId: string, data: Partial<VacancyQuestionRequest>) {
  return organizationRequest<VacancyQuestionResponse>(`/vacancies/${vacancyId}/questions/${questionId}`, {
    method: 'PATCH',
    body: data,
  })
}

export function deleteVacancyQuestion(vacancyId: string, questionId: string) {
  return organizationRequest<void>(`/vacancies/${vacancyId}/questions/${questionId}`, { method: 'DELETE' })
}

export function applyToVacancy(vacancyId: string, data: VacancyApplicationRequest) {
  return organizationRequest<VacancyApplicationResponse>(`/vacancies/public/${vacancyId}/applications`, {
    method: 'POST',
    body: data,
  })
}

export function getMyApplications() {
  return organizationRequest<VacancyApplicationSummary[]>('/applications/my')
}

export function getApplication(applicationId: string) {
  return organizationRequest<VacancyApplicationResponse>(`/applications/${applicationId}`)
}

export function getVacancyApplications(vacancyId: string) {
  return organizationRequest<VacancyApplicationSummary[]>(`/vacancies/${vacancyId}/applications`)
}

export function getVacancyApplicationReport(vacancyId: string, applicationId: string) {
  return organizationRequest<EmployerApplicationReport>(`/vacancies/${vacancyId}/applications/${applicationId}/report`)
}
