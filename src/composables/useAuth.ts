import { computed, readonly, ref } from 'vue'
import type { User } from 'oidc-client-ts'
import {
  getCurrentUser,
  getDisplayName,
  handleAuthCallback,
  handleLogoutCallback,
  isStateNotFoundError,
  isZitadelConfigured,
  signIn,
  signOut,
  signUp,
  userManager,
} from '@/auth/zitadel'
import type { UserResponse } from '@/types/api'
import { loadAppSession, resetAppSession } from '@/composables/useAppSession'

const zitadelUser = ref<User | null>(null)
const appUser = ref<UserResponse | null>(null)
const isLoading = ref(false)
const error = ref('')
const needsRegistration = ref(false)
let initialized = false
let authStateInitialized = false

userManager.events.addUserLoaded((loadedUser) => {
  zitadelUser.value = loadedUser
})

userManager.events.addUserUnloaded(() => {
  zitadelUser.value = null
  appUser.value = null
  needsRegistration.value = false
})

export function useAuth() {
  const isAuthenticated = computed(() => Boolean(zitadelUser.value && !zitadelUser.value.expired))
  const displayName = computed(() => getDisplayName(zitadelUser.value))
  const isRegistered = computed(() => Boolean(appUser.value))

  async function initialize() {
    if (initialized) return
    initialized = true
    isLoading.value = true
    error.value = ''

    try {
      zitadelUser.value = await getCurrentUser()
      authStateInitialized = true
      if (zitadelUser.value) {
        await resolveAppSession()
      }
    } catch (caughtError) {
      error.value = caughtError instanceof Error ? caughtError.message : 'Failed to load auth state.'
    } finally {
      isLoading.value = false
    }
  }

  async function initializeAuthState() {
    if (authStateInitialized) return
    authStateInitialized = true
    isLoading.value = true
    error.value = ''

    try {
      zitadelUser.value = await getCurrentUser()
    } catch (caughtError) {
      error.value = caughtError instanceof Error ? caughtError.message : 'Failed to load auth state.'
    } finally {
      isLoading.value = false
    }
  }

  async function resolveAppSession() {
    if (!zitadelUser.value) return

    const sub = zitadelUser.value.profile.sub
    if (!sub) {
      needsRegistration.value = true
      return
    }

    try {
      appUser.value = await loadAppSession(sub)
      needsRegistration.value = false
    } catch (caughtError: any) {
      if (caughtError?.code === 'USER_NOT_FOUND' || caughtError?.status === 404) {
        needsRegistration.value = true
      } else {
        error.value = caughtError instanceof Error ? caughtError.message : 'Failed to load your profile.'
        throw caughtError
      }
    }
  }

  async function login(returnTo?: string) {
    error.value = ''
    try {
      await signIn(returnTo)
    } catch (caughtError) {
      error.value = caughtError instanceof Error ? caughtError.message : 'Failed to start sign in.'
    }
  }

  async function register() {
    error.value = ''
    try {
      await signUp()
    } catch (caughtError) {
      error.value = caughtError instanceof Error ? caughtError.message : 'Failed to start sign up.'
    }
  }

  async function completeCallback() {
    isLoading.value = true
    error.value = ''
    try {
      zitadelUser.value = await handleAuthCallback()
      await resolveAppSession()
      return zitadelUser.value
    } catch (caughtError) {
      if (isStateNotFoundError(caughtError)) {
        error.value = 'Session state was lost during redirect. This usually happens when the login was started from a different URL than the callback. Restarting login...'
        await signIn()
        return null
      }
      error.value = caughtError instanceof Error ? caughtError.message : 'Failed to complete sign in.'
      throw caughtError
    } finally {
      isLoading.value = false
    }
  }

  async function logout() {
    error.value = ''
    try {
      resetAppSession()
      await signOut()
    } catch (caughtError) {
      error.value = caughtError instanceof Error ? caughtError.message : 'Failed to sign out.'
    }
  }

  async function completeLogout() {
    isLoading.value = true
    error.value = ''
    try {
      resetAppSession()
      await handleLogoutCallback()
      zitadelUser.value = null
      appUser.value = null
      needsRegistration.value = false
    } catch (caughtError) {
      error.value = caughtError instanceof Error ? caughtError.message : 'Failed to complete sign out.'
      throw caughtError
    } finally {
      isLoading.value = false
    }
  }

  return {
    user: readonly(zitadelUser),
    isLoading: readonly(isLoading),
    error: readonly(error),
    isAuthenticated,
    displayName,
    isZitadelConfigured,
    needsRegistration: readonly(needsRegistration),
    isRegistered,
    initialize,
    initializeAuthState,
    login,
    register,
    completeCallback,
    logout,
    completeLogout,
  }
}
