import { organizationRequest, publicOrganizationRequest } from '@/api/client'
import type {
  CreateOrganizationRequest,
  CreateVacancyRequest,
  OrganizationResponse,
  UpdateVacancyRequest,
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
