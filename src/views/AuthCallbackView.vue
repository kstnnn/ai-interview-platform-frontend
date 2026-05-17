<template>
  <div class="flex min-h-screen items-center justify-center bg-background px-4 text-center">
    <BaseCard class="max-w-md p-8">
      <LoaderCircle v-if="!hasError" class="mx-auto h-8 w-8 animate-spin text-primary" />
      <h1 class="mt-5 text-2xl font-bold text-foreground">
        {{ hasError ? 'Connection failed' : 'Completing sign in' }}
      </h1>
      <p v-if="!hasError" class="mt-3 text-sm leading-relaxed text-muted-foreground">The secure login flow redirected back to the app. Finalizing your session.</p>

      <div v-if="callbackError || appSessionError" class="mt-6 rounded-[1.5rem] border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">
        {{ callbackError || appSessionError }}
      </div>

      <div v-if="isStateError" class="mt-4 rounded-[1.5rem] border border-warning/30 bg-warning/10 p-4 text-sm text-foreground">
        Redirecting you back to login...
      </div>

      <div v-if="hasError && !isStateError" class="mt-6 flex flex-col gap-3 sm:flex-row">
        <BaseButton size="md" @click="retry">
          Retry
        </BaseButton>
        <BaseButton variant="outline" size="md" @click="signOut">
          Sign out
        </BaseButton>
      </div>
    </BaseCard>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { LoaderCircle } from 'lucide-vue-next'
import type { User } from 'oidc-client-ts'
import BaseButton from '@/components/BaseButton.vue'
import BaseCard from '@/components/BaseCard.vue'
import { useAuth } from '@/composables/useAuth'
import { getDefaultWorkspaceRoute, useAppSession } from '@/composables/useAppSession'

const router = useRouter()
const { completeCallback, error: callbackError, logout } = useAuth()
const { error: appSessionError, loadAppSession } = useAppSession()
const hasError = ref(false)

const isStateError = computed(() => callbackError.value.toLowerCase().includes('session state was lost'))

onMounted(async () => {
  try {
    const user = await completeCallback()
    if (!user) return
    const returnTo = getCallbackRedirect(user)
    const session = await loadAppSession(true)

    if (session?.onboardingRequired) {
      await router.replace('/onboarding')
      return
    }

    await router.replace(returnTo ?? getDefaultWorkspaceRoute(session?.user.accountType))
  } catch {
    hasError.value = true
  }
})

async function retry() {
  hasError.value = false
  try {
    const user = await completeCallback()
    if (!user) return
    const returnTo = getCallbackRedirect(user)
    const session = await loadAppSession(true)

    if (session?.onboardingRequired) {
      await router.replace('/onboarding')
      return
    }

    await router.replace(returnTo ?? getDefaultWorkspaceRoute(session?.user.accountType))
  } catch {
    hasError.value = true
  }
}

async function signOut() {
  await logout()
  await router.replace('/sign-in')
}

function getCallbackRedirect(user: User | null) {
  const state = user?.state
  if (state && typeof state === 'object') {
    const returnTo = (state as { returnTo?: unknown }).returnTo
    if (typeof returnTo === 'string') {
      return returnTo
    }
  }

  return null
}
</script>
