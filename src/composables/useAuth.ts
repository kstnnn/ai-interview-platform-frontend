import { computed, readonly, ref } from 'vue'
import type { User } from 'oidc-client-ts'
import {
  getCurrentUser,
  getDisplayName,
  handleAuthCallback,
  handleLogoutCallback,
  isZitadelConfigured,
  signIn,
  signOut,
  signUp,
  userManager,
} from '@/auth/zitadel'

const user = ref<User | null>(null)
const isLoading = ref(false)
const error = ref('')
let initialized = false

userManager.events.addUserLoaded((loadedUser) => {
  user.value = loadedUser
})

userManager.events.addUserUnloaded(() => {
  user.value = null
})

export function useAuth() {
  const isAuthenticated = computed(() => Boolean(user.value && !user.value.expired))
  const displayName = computed(() => getDisplayName(user.value))

  async function initialize() {
    if (initialized) return
    initialized = true
    isLoading.value = true
    error.value = ''

    try {
      user.value = await getCurrentUser()
    } catch (caughtError) {
      error.value = caughtError instanceof Error ? caughtError.message : 'Failed to load auth state.'
    } finally {
      isLoading.value = false
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
      user.value = await handleAuthCallback()
      return user.value
    } catch (caughtError) {
      error.value = caughtError instanceof Error ? caughtError.message : 'Failed to complete sign in.'
      throw caughtError
    } finally {
      isLoading.value = false
    }
  }

  async function logout() {
    error.value = ''
    try {
      await signOut()
    } catch (caughtError) {
      error.value = caughtError instanceof Error ? caughtError.message : 'Failed to sign out.'
    }
  }

  async function completeLogout() {
    isLoading.value = true
    error.value = ''
    try {
      await handleLogoutCallback()
      user.value = null
    } catch (caughtError) {
      error.value = caughtError instanceof Error ? caughtError.message : 'Failed to complete sign out.'
      throw caughtError
    } finally {
      isLoading.value = false
    }
  }

  return {
    user: readonly(user),
    isLoading: readonly(isLoading),
    error: readonly(error),
    isAuthenticated,
    displayName,
    isZitadelConfigured,
    initialize,
    login,
    register,
    completeCallback,
    logout,
    completeLogout,
  }
}
