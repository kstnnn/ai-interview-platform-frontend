<template>
  <div class="flex min-h-screen flex-col bg-background">
    <AppHeader />

    <main class="flex flex-1 items-center px-4 py-12 sm:px-6 lg:px-8">
      <div class="mx-auto grid w-full max-w-6xl gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
        <section class="lg:sticky lg:top-28">
          <p class="text-sm font-semibold uppercase tracking-[0.2em] text-primary">{{ t('onboarding.finishSetup') }}</p>
          <h1 class="mt-4 font-serif text-5xl font-bold tracking-tight text-foreground sm:text-6xl">{{ t('onboarding.title') }}</h1>
          <p class="mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">
            {{ t('onboarding.description') }}
          </p>
        </section>

        <BaseCard class="p-8">
          <form class="space-y-6" @submit.prevent="submitOnboarding">
            <div v-if="zitadelEmail" class="rounded-[1.5rem] border border-border/60 bg-muted/35 p-5">
              <p class="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">{{ t('onboarding.verifiedIdentity') }}</p>
              <p class="mt-2 text-lg font-bold text-foreground">{{ zitadelDisplayName }}</p>
              <p class="mt-1 text-sm text-muted-foreground">{{ zitadelEmail }}</p>
            </div>

            <div class="grid gap-4 sm:grid-cols-2">
              <label class="block">
                <span class="text-sm font-semibold text-foreground">{{ t('onboarding.firstName') }}</span>
                <input v-model.trim="form.firstName" required class="mt-2 h-12 w-full rounded-full border border-border bg-input px-4 outline-none transition focus:border-primary" :placeholder="t('onboarding.firstNamePlaceholder')" />
              </label>
              <label class="block">
                <span class="text-sm font-semibold text-foreground">{{ t('onboarding.lastName') }}</span>
                <input v-model.trim="form.lastName" class="mt-2 h-12 w-full rounded-full border border-border bg-input px-4 outline-none transition focus:border-primary" :placeholder="t('onboarding.lastNamePlaceholder')" />
              </label>
            </div>

            <fieldset>
              <legend class="text-sm font-semibold text-foreground">{{ t('onboarding.accountType') }}</legend>
              <div class="mt-3 grid gap-3 sm:grid-cols-2">
                <label class="cursor-pointer rounded-[1.5rem] border p-5 transition" :class="form.userType === 'PERSONAL' ? 'border-primary bg-primary/10' : 'border-border bg-muted/25 hover:border-primary/40'">
                  <input v-model="form.userType" class="sr-only" type="radio" value="PERSONAL" />
                  <span class="font-bold text-foreground">{{ t('onboarding.personalAccount') }}</span>
                  <span class="mt-2 block text-sm leading-relaxed text-muted-foreground">{{ t('onboarding.personalAccountDesc') }}</span>
                </label>

                <label class="cursor-pointer rounded-[1.5rem] border p-5 transition" :class="form.userType === 'BUSINESS' ? 'border-primary bg-primary/10' : 'border-border bg-muted/25 hover:border-primary/40'">
                  <input v-model="form.userType" class="sr-only" type="radio" value="BUSINESS" />
                  <span class="font-bold text-foreground">{{ t('onboarding.businessAccount') }}</span>
                  <span class="mt-2 block text-sm leading-relaxed text-muted-foreground">{{ t('onboarding.businessAccountDesc') }}</span>
                </label>
              </div>
            </fieldset>

            <div v-if="error" class="rounded-[1.5rem] border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">
              {{ error }}
            </div>

            <BaseButton class="w-full" size="lg" tag="button" :disabled="isLoading">
              {{ isLoading ? t('onboarding.creating') : t('onboarding.finish') }}
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
import { useAuth } from '@/composables/useAuth'
import { useI18n } from '@/i18n'
import type { UserType } from '@/types/api'

const router = useRouter()
const { t } = useI18n()
const { user: zitadelUser } = useAuth()
const { error, isLoading, registerUser, userType } = useAppSession()

const form = reactive({
  firstName: '',
  lastName: '',
  userType: 'PERSONAL' as UserType,
})

const zitadelEmail = computed(() => zitadelUser.value?.profile.email ?? '')
const zitadelDisplayName = computed(() => {
  if (!zitadelUser.value) return ''
  const profile = zitadelUser.value.profile
  return profile.name || profile.preferred_username || profile.email || ''
})

onMounted(() => {
  if (zitadelEmail.value) {
    const parts = zitadelEmail.value.split('@')[0]
    if (parts && !form.firstName) {
      form.firstName = parts.charAt(0).toUpperCase() + parts.slice(1)
    }
  }
})

async function submitOnboarding() {
  const sub = zitadelUser.value?.profile.sub
  if (!sub) {
    return
  }

  await registerUser({
    providerUserId: sub,
    email: zitadelEmail.value,
    userType: form.userType,
    firstName: form.firstName,
    lastName: form.lastName || null,
  })

  await router.replace(getDefaultWorkspaceRoute(userType.value))
}
</script>
