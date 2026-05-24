import { apiRequest, publicApiRequest } from '@/api/client'
import type { AuthUserResponse, CreateUserRequest, UserResponse } from '@/types/api'

export function getUserByProviderId(providerUserId: string) {
  return publicApiRequest<UserResponse>(`/users/by-provider-id/${providerUserId}`)
}

export function getAuthUserByProviderId(providerUserId: string) {
  return apiRequest<AuthUserResponse>(`/users/auth/by-provider-id/${providerUserId}`)
}

export function getUserById(id: string) {
  return apiRequest<UserResponse>(`/users/${id}`)
}

export function createUser(data: CreateUserRequest) {
  return apiRequest<UserResponse>('/users', {
    method: 'POST',
    body: data,
  })
}
