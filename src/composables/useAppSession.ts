import { computed, readonly, ref } from 'vue'
import { getAuthUserByProviderId, getUserByProviderId, createUser } from '@/api/user'
import type { AuthUserResponse, UserResponse, CreateUserRequest, UserRole, UserType } from '@/types/api'

const user = ref<UserResponse | null>(null)
const authUser = ref<AuthUserResponse | null>(null)
const providerUserId = ref('')
const isLoading = ref(false)
const error = ref('')
let loaded = false

export async function loadAppSession(sub: string, force = false) {
  if (loaded && !force && providerUserId.value === sub) {
    return user.value
  }

  isLoading.value = true
  error.value = ''

    try {
      user.value = await getUserByProviderId(sub)
      try {
        authUser.value = await getAuthUserByProviderId(sub)
      } catch {
        authUser.value = null
      }
      providerUserId.value = sub
    loaded = true
    return user.value
  } catch (caughtError) {
    if (caughtError instanceof Error && 'status' in caughtError && (caughtError as any).status === 404) {
      loaded = true
      providerUserId.value = sub
      throw Object.assign(new Error('User not found'), { status: 404, code: 'USER_NOT_FOUND' })
    }
    error.value = caughtError instanceof Error ? caughtError.message : 'Failed to load your profile.'
    throw caughtError
  } finally {
    isLoading.value = false
  }
}

export async function registerUser(payload: CreateUserRequest) {
  isLoading.value = true
  error.value = ''

  try {
    user.value = await createUser(payload)
    providerUserId.value = payload.providerUserId
    loaded = true
    return user.value
  } catch (caughtError) {
    error.value = caughtError instanceof Error ? caughtError.message : 'Failed to create your account.'
    throw caughtError
  } finally {
    isLoading.value = false
  }
}

export function resetAppSession() {
    user.value = null
  authUser.value = null
  providerUserId.value = ''
  loaded = false
  error.value = ''
}

export function getDefaultWorkspaceRoute(ut?: UserType | null) {
  return ut === 'BUSINESS' ? '/business' : '/user'
}

export function getDefaultRouteForSession(ut?: UserType | null, roles?: UserRole[] | null) {
  return roles?.includes('ADMIN') ? '/admin' : getDefaultWorkspaceRoute(ut)
}

export function useAppSession() {
  const userId = computed(() => user.value?.id ?? '')
  const email = computed(() => user.value?.email ?? '')
  const displayName = computed(() => {
    if (!user.value) return ''
    return [user.value.firstName, user.value.lastName].filter(Boolean).join(' ') || user.value.email
  })
  const userType = computed(() => user.value?.userType ?? null)
  const userStatus = computed(() => user.value?.userStatus ?? null)
  const roles = computed(() => authUser.value?.roles ?? [])
  const isAdmin = computed(() => roles.value.includes('ADMIN'))

  return {
    user: readonly(user),
    authUser: readonly(authUser),
    userId,
    email,
    displayName,
    userType,
    userStatus,
    roles,
    isAdmin,
    providerUserId: readonly(providerUserId),
    isLoading: readonly(isLoading),
    error: readonly(error),
    loadAppSession,
    registerUser,
    resetAppSession,
  }
}
