<template>
  <div class="flex min-h-screen flex-col bg-background">
    <AppHeader />

    <main class="flex flex-1 items-center px-4 py-12 sm:px-6 lg:px-8">
      <div class="mx-auto grid w-full max-w-6xl gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
        <section class="lg:sticky lg:top-28">
          <p class="text-sm font-semibold uppercase tracking-[0.2em] text-primary">Finish setup</p>
          <h1 class="mt-4 font-serif text-5xl font-bold tracking-tight text-foreground sm:text-6xl">Tell us how you want to use TechScreen.</h1>
          <p class="mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">
            Your identity has already been verified. This step only chooses your app workspace and, for business accounts, creates your app organization.
          </p>
        </section>

        <BaseCard class="p-8">
          <form class="space-y-6" @submit.prevent="submitOnboarding">
            <div v-if="user" class="rounded-[1.5rem] border border-border/60 bg-muted/35 p-5">
              <p class="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Verified identity</p>
              <p class="mt-2 text-lg font-bold text-foreground">{{ displayName }}</p>
              <p class="mt-1 text-sm text-muted-foreground">{{ user.email }}</p>
              <p class="mt-3 text-xs leading-relaxed text-muted-foreground">
                Name and email come from your verified identity profile. Your app profile will be linked to this account by the backend.
              </p>
            </div>

            <fieldset>
              <legend class="text-sm font-semibold text-foreground">Account type</legend>
              <div class="mt-3 grid gap-3 sm:grid-cols-2">
                <label class="cursor-pointer rounded-[1.5rem] border p-5 transition" :class="form.accountType === 'USER' ? 'border-primary bg-primary/10' : 'border-border bg-muted/25 hover:border-primary/40'">
                  <input v-model="form.accountType" class="sr-only" type="radio" value="USER" />
                  <span class="font-bold text-foreground">User account</span>
                  <span class="mt-2 block text-sm leading-relaxed text-muted-foreground">Practice mock interviews and follow a personal learning roadmap.</span>
                </label>

                <label class="cursor-pointer rounded-[1.5rem] border p-5 transition" :class="form.accountType === 'BUSINESS' ? 'border-primary bg-primary/10' : 'border-border bg-muted/25 hover:border-primary/40'">
                  <input v-model="form.accountType" class="sr-only" type="radio" value="BUSINESS" />
                  <span class="font-bold text-foreground">Business account</span>
                  <span class="mt-2 block text-sm leading-relaxed text-muted-foreground">Create your app organization and manage vacancies.</span>
                </label>
              </div>
            </fieldset>

            <label v-if="form.accountType === 'BUSINESS'" class="block">
              <span class="text-sm font-semibold text-foreground">Organization name</span>
              <input v-model.trim="form.organizationName" required class="mt-2 h-12 w-full rounded-full border border-border bg-input px-4 outline-none transition focus:border-primary" placeholder="Acme Inc" />
            </label>

            <div v-if="error" class="rounded-[1.5rem] border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">
              {{ error }}
            </div>

            <BaseButton class="w-full" size="lg" tag="button" :disabled="isLoading">
              {{ isLoading ? 'Saving profile...' : 'Finish registration' }}
            </BaseButton>
          </form>
        </BaseCard>
      </div>
    </main>

    <AppFooter />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive } from 'vue'
import { useRouter } from 'vue-router'
import AppFooter from '@/components/AppFooter.vue'
import AppHeader from '@/components/AppHeader.vue'
import BaseButton from '@/components/BaseButton.vue'
import BaseCard from '@/components/BaseCard.vue'
import { getDefaultWorkspaceRoute, useAppSession } from '@/composables/useAppSession'
import type { AppAccountType } from '@/api/me'

const router = useRouter()
const { completeAppOnboarding, error, isLoading, loadAppSession, user } = useAppSession()

const form = reactive({
  accountType: 'USER' as AppAccountType,
  organizationName: '',
})

const displayName = computed(() => {
  if (!user.value) return 'Verified user'

  return [user.value.firstName, user.value.lastName].filter(Boolean).join(' ') || user.value.email
})

onMounted(async () => {
  try {
    const session = await loadAppSession()
    if (session && !session.onboardingRequired) {
      await router.replace(getDefaultWorkspaceRoute(session.user.accountType))
    }
  } catch {
    // The visible error from useAppSession explains backend/token failures.
  }
})

async function submitOnboarding() {
  const session = await completeAppOnboarding({
    accountType: form.accountType,
    organizationName: form.accountType === 'BUSINESS' ? form.organizationName : undefined,
  })

  await router.replace(getDefaultWorkspaceRoute(session.user.accountType))
}
</script>
