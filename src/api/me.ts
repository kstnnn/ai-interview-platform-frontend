import { apiRequest } from '@/api/client'

export type AppAccountType = 'USER' | 'BUSINESS'
export type AppUserStatus = 'PENDING_ONBOARDING' | 'ACTIVE' | 'DISABLED'

export type AppUser = {
  id: string
  providerUserId: string
  email: string
  firstName?: string | null
  lastName?: string | null
  accountType?: AppAccountType | null
  status: AppUserStatus
}

export type AppOrganization = {
  id: string
  name: string
}

export type MeResponse = {
  user: AppUser
  organization?: AppOrganization | null
  onboardingRequired: boolean
}

export type CompleteOnboardingPayload = {
  firstName: string
  lastName: string
  accountType: AppAccountType
  organizationName?: string
}

export function getMe() {
  return apiRequest<MeResponse>('/me')
}

export function completeOnboarding(payload: CompleteOnboardingPayload) {
  return apiRequest<MeResponse>('/onboarding/complete', {
    method: 'POST',
    body: payload,
  })
}
