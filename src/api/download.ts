import { getAccessToken } from '@/auth/zitadel'

export const organizationApiBaseUrl = import.meta.env.VITE_ORGANIZATION_API_BASE_URL ?? 'http://localhost:8082/api/v1'
export const interviewApiBaseUrl = import.meta.env.VITE_INTERVIEW_API_BASE_URL ?? 'http://localhost:8081/api/v1'

export async function downloadAuthenticatedFile(url: string, filename: string) {
  const token = await getAccessToken()
  const accessToken = typeof token === 'string' ? token.trim() : ''

  if (!accessToken) {
    throw new Error('Missing authentication token.')
  }

  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })

  if (!response.ok) {
    throw new Error(response.statusText || 'Download failed.')
  }

  const blob = await response.blob()
  const objectUrl = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = objectUrl
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(objectUrl)
}
