<template>
  <div class="flex min-h-screen items-center justify-center bg-background px-4 text-center">
    <BaseCard class="max-w-md p-8">
      <LoaderCircle class="mx-auto h-8 w-8 animate-spin text-primary" />
      <h1 class="mt-5 text-2xl font-bold text-foreground">Completing sign in</h1>
      <p class="mt-3 text-sm leading-relaxed text-muted-foreground">Zitadel redirected back to the app. The frontend is finalizing the OIDC session.</p>

      <div v-if="error" class="mt-6 rounded-[1.5rem] border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">
        {{ error }}
      </div>
    </BaseCard>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { LoaderCircle } from 'lucide-vue-next'
import type { User } from 'oidc-client-ts'
import BaseCard from '@/components/BaseCard.vue'
import { getPostLoginUrl } from '@/auth/zitadel'
import { useAuth } from '@/composables/useAuth'

const router = useRouter()
const { completeCallback, error } = useAuth()

onMounted(async () => {
  try {
    const user = await completeCallback()
    await router.replace(getCallbackRedirect(user))
  } catch {
    window.setTimeout(() => {
      void router.replace('/sign-in')
    }, 2500)
  }
})

function getCallbackRedirect(user: User | null) {
  const state = user?.state
  if (state && typeof state === 'object') {
    const returnTo = (state as { returnTo?: unknown }).returnTo
    if (typeof returnTo === 'string') {
      return returnTo
    }
  }

  return getPostLoginUrl()
}
</script>
