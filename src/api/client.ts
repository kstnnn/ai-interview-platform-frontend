import { ofetch, type FetchOptions } from 'ofetch'
import { getAccessToken, getCurrentUser } from '@/auth/zitadel'

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly data?: unknown,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

function createApiClient(baseURL: string, requireAuth: boolean) {
  return ofetch.create({
    baseURL,
    async onRequest({ options }) {
      if (!requireAuth) {
        return
      }

      const token = await getAccessToken()
      const accessToken = typeof token === 'string' ? token.trim() : ''

      if (!accessToken) {
        throw new ApiError('Missing authentication token.', 401)
      }

      const existingHeaders = options.headers as any
      options.headers = { ...existingHeaders, Authorization: `Bearer ${accessToken}` }
    },
    onResponseError({ response }) {
      void redirectBlockedUserOnForbidden(response.status)
      const data = response._data as { message?: unknown; error?: unknown } | undefined
      const message = typeof data?.message === 'string'
        ? data.message
        : typeof data?.error === 'string'
          ? data.error
          : response.statusText || 'API request failed.'

      throw new ApiError(message, response.status, data)
    },
  })
}

async function redirectBlockedUserOnForbidden(status: number) {
  if (status !== 403 || window.location.pathname === '/blocked') {
    return
  }

  try {
    const [user, token] = await Promise.all([getCurrentUser(), getAccessToken()])
    const sub = user?.profile.sub
    const accessToken = typeof token === 'string' ? token.trim() : ''
    if (!sub || !accessToken) return

    const response = await fetch(`${userApiBaseUrl}/users/auth/by-provider-id/${encodeURIComponent(sub)}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
    if (!response.ok) return

    const authUser = await response.json() as { userStatus?: string }
    if (authUser.userStatus === 'BLOCKED' || authUser.userStatus === 'DELETED') {
      window.location.assign('/blocked')
    }
  } catch {
    // Keep the original API error behavior if status refresh fails.
  }
}

const userApiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080/api/v1'
const organizationApiBaseUrl = import.meta.env.VITE_ORGANIZATION_API_BASE_URL ?? 'http://localhost:8082/api/v1'
const interviewApiBaseUrl = import.meta.env.VITE_INTERVIEW_API_BASE_URL ?? 'http://localhost:8081/api/v1'
const userApiClient = createApiClient(userApiBaseUrl, true)
const publicUserApiClient = createApiClient(userApiBaseUrl, false)
const interviewApiClient = createApiClient(interviewApiBaseUrl, true)
const publicInterviewApiClient = createApiClient(interviewApiBaseUrl, false)
const organizationApiClient = createApiClient(organizationApiBaseUrl, true)
const publicOrganizationApiClient = createApiClient(organizationApiBaseUrl, false)

export async function apiRequest<T>(path: string, options?: FetchOptions<'json'>) {
  return userApiClient<T>(path, options)
}

export async function publicApiRequest<T>(path: string, options?: FetchOptions<'json'>) {
  return publicUserApiClient<T>(path, options)
}

export async function interviewRequest<T>(path: string, options?: FetchOptions<'json'>) {
  return interviewApiClient<T>(path, options)
}

export async function publicInterviewRequest<T>(path: string, options?: FetchOptions<'json'>) {
  return publicInterviewApiClient<T>(path, options)
}

export async function organizationRequest<T>(path: string, options?: FetchOptions<'json'>) {
  return organizationApiClient<T>(path, options)
}

export async function publicOrganizationRequest<T>(path: string, options?: FetchOptions<'json'>) {
  return publicOrganizationApiClient<T>(path, options)
}
