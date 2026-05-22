import { apiRequest } from '@/api/client'
import type { CreateUserRequest, UserResponse } from '@/types/api'

export function getUserByProviderId(providerUserId: string) {
  return apiRequest<UserResponse>(`/users/by-provider-id/${providerUserId}`)
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
