import { computed, readonly, ref } from 'vue'
import { completeOnboarding, getMe, type AppAccountType, type CompleteOnboardingPayload, type MeResponse } from '@/api/me'

const me = ref<MeResponse | null>(null)
const isLoading = ref(false)
const error = ref('')
let loaded = false

export async function loadAppSession(force = false) {
  if (loaded && !force) {
    return me.value
  }

  isLoading.value = true
  error.value = ''

  try {
    me.value = await getMe()
    loaded = true
    return me.value
  } catch (caughtError) {
    error.value = caughtError instanceof Error ? caughtError.message : 'Failed to load your app profile.'
    throw caughtError
  } finally {
    isLoading.value = false
  }
}

export async function completeAppOnboarding(payload: CompleteOnboardingPayload) {
  isLoading.value = true
  error.value = ''

  try {
    me.value = await completeOnboarding(payload)
    loaded = true
    return me.value
  } catch (caughtError) {
    error.value = caughtError instanceof Error ? caughtError.message : 'Failed to complete onboarding.'
    throw caughtError
  } finally {
    isLoading.value = false
  }
}

export function resetAppSession() {
  me.value = null
  loaded = false
  error.value = ''
}

export function getDefaultWorkspaceRoute(accountType?: AppAccountType | null) {
  return accountType === 'BUSINESS' ? '/business' : '/user'
}

export function useAppSession() {
  const user = computed(() => me.value?.user ?? null)
  const organization = computed(() => me.value?.organization ?? null)
  const onboardingRequired = computed(() => Boolean(me.value?.onboardingRequired))
  const accountType = computed(() => me.value?.user.accountType ?? null)
  const providerUserId = computed(() => me.value?.user.providerUserId ?? '')

  return {
    me: readonly(me),
    user,
    organization,
    onboardingRequired,
    accountType,
    providerUserId,
    isLoading: readonly(isLoading),
    error: readonly(error),
    loadAppSession,
    completeAppOnboarding,
    resetAppSession,
  }
}
