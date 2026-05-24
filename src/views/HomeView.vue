<template>
  <div class="flex min-h-screen flex-col bg-background">
    <AppHeader />

    <main class="flex-1">
      <section class="relative overflow-hidden px-4 py-24 sm:px-6 lg:px-8">
        <div class="absolute inset-0 -z-10 opacity-[0.03]">
          <div class="rounded-blob-1 absolute -left-[10%] -top-[20%] h-96 w-96 bg-primary blur-3xl"></div>
          <div class="rounded-blob-2 absolute -bottom-[20%] -right-[10%] h-96 w-96 bg-secondary blur-3xl"></div>
        </div>

        <div class="mx-auto max-w-4xl text-center">
          <h1 class="font-serif text-5xl font-bold tracking-tight text-foreground sm:text-6xl lg:text-7xl">
            {{ t('home.title') }}
          </h1>
          <p class="mx-auto mt-8 max-w-3xl text-lg leading-relaxed text-muted-foreground sm:text-xl">
            {{ t('home.subtitle') }}
          </p>

          <div class="mt-10 flex flex-col gap-4 sm:flex-row sm:justify-center">
            <RouterLink to="/user">
              <BaseButton size="lg">{{ t('home.userCta') }}</BaseButton>
            </RouterLink>
            <RouterLink to="/business">
              <BaseButton size="lg" variant="outline">{{ t('home.businessCta') }}</BaseButton>
            </RouterLink>
            <RouterLink to="/vacancies">
              <BaseButton size="lg" variant="ghost">{{ t('nav.vacancies') }}</BaseButton>
            </RouterLink>
          </div>

          <div class="mt-20 grid grid-cols-1 gap-6 sm:grid-cols-3">
            <BaseCard class="p-6">
              <div class="text-3xl font-bold text-primary">{{ t('home.card.mockTitle') }}</div>
              <p class="mt-2 text-sm text-muted-foreground">{{ t('home.card.mockDesc') }}</p>
            </BaseCard>
            <BaseCard class="p-6">
              <div class="text-3xl font-bold text-secondary">{{ t('home.card.aiPlanTitle') }}</div>
              <p class="mt-2 text-sm text-muted-foreground">{{ t('home.card.aiPlanDesc') }}</p>
            </BaseCard>
            <BaseCard class="p-6">
              <div class="text-3xl font-bold text-primary">{{ t('home.card.hiringTitle') }}</div>
              <p class="mt-2 text-sm text-muted-foreground">{{ t('home.card.hiringDesc') }}</p>
            </BaseCard>
          </div>
        </div>
      </section>

      <section id="features" class="bg-muted/20 px-4 py-24 sm:px-6 lg:px-8">
        <div class="mx-auto max-w-6xl">
          <div class="mb-16 text-center">
            <h2 class="font-serif text-4xl font-bold text-foreground sm:text-5xl">{{ t('home.featuresTitle') }}</h2>
            <p class="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
              {{ t('home.featuresSubtitle') }}
            </p>
          </div>

          <div class="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            <BaseCard class="p-8">
              <Mic class="h-6 w-6 text-primary" />
              <h3 class="mt-4 font-serif text-lg font-bold">{{ t('home.feature.mockTitle') }}</h3>
              <p class="mt-2 text-sm leading-relaxed text-muted-foreground">{{ t('home.feature.mockDesc') }}</p>
            </BaseCard>
            <BaseCard class="p-8">
              <LayoutDashboard class="h-6 w-6 text-secondary" />
              <h3 class="mt-4 font-serif text-lg font-bold">{{ t('home.feature.businessTitle') }}</h3>
              <p class="mt-2 text-sm leading-relaxed text-muted-foreground">{{ t('home.feature.businessDesc') }}</p>
            </BaseCard>
            <BaseCard class="p-8">
              <FileBarChart class="h-6 w-6 text-primary" />
              <h3 class="mt-4 font-serif text-lg font-bold">{{ t('home.feature.feedbackTitle') }}</h3>
              <p class="mt-2 text-sm leading-relaxed text-muted-foreground">{{ t('home.feature.feedbackDesc') }}</p>
            </BaseCard>
          </div>
        </div>
      </section>
    </main>

    <AppFooter />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { useRouter } from 'vue-router'
import { FileBarChart, LayoutDashboard, Mic } from 'lucide-vue-next'
import { getCurrentUser } from '@/auth/zitadel'
import AppFooter from '@/components/AppFooter.vue'
import AppHeader from '@/components/AppHeader.vue'
import BaseButton from '@/components/BaseButton.vue'
import BaseCard from '@/components/BaseCard.vue'
import { getDefaultRouteForSession, loadAppSession, useAppSession } from '@/composables/useAppSession'
import { useI18n } from '@/i18n'

const { t } = useI18n()
const router = useRouter()
const { roles } = useAppSession()

onMounted(async () => {
  try {
    const zitadelUser = await getCurrentUser()
    if (!zitadelUser || zitadelUser.expired) return

    const sub = zitadelUser.profile.sub
    if (!sub) return

    try {
      const appUser = await loadAppSession(sub)
      if (!appUser) return

      if (appUser.userStatus === 'BLOCKED' || appUser.userStatus === 'DELETED') {
        await router.replace('/blocked')
        return
      }

      if (appUser.userStatus === 'PENDING_ONBOARDING') {
        await router.replace('/onboarding')
        return
      }

      await router.replace(getDefaultRouteForSession(appUser.userType, roles.value))
    } catch (err: any) {
      if (err?.code === 'USER_NOT_FOUND' || err?.status === 404) {
        await router.replace('/onboarding')
      }
    }
  } catch {
    // Keep the public landing available if auth state cannot be read.
  }
})
</script>
