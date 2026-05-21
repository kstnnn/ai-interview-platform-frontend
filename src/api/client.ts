import { ofetch, type FetchOptions } from 'ofetch'
import { getAccessToken } from '@/auth/zitadel'

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

function createApiClient(baseURL: string) {
  return ofetch.create({
    baseURL,
    async onRequest({ options }) {
      const token = await getAccessToken()
      if (!token) throw new ApiError('Missing authentication token.', 401)
      const existingHeaders = options.headers as any
      options.headers = { ...existingHeaders, Authorization: `Bearer ${token}` }
    },
    onResponseError({ response }) {
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

const userApiClient = createApiClient(import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080/api/v1')
const interviewApiClient = createApiClient(import.meta.env.VITE_INTERVIEW_API_BASE_URL ?? 'http://localhost:8081/api/v1')

export async function apiRequest<T>(path: string, options?: FetchOptions<'json'>) {
  return userApiClient<T>(path, options)
}

export async function interviewRequest<T>(path: string, options?: FetchOptions<'json'>) {
  return interviewApiClient<T>(path, options)
}
