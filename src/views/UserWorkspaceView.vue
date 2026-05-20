<template>
  <div class="flex min-h-screen flex-col bg-background">
    <AppHeader />

    <main class="flex-1 px-4 py-8 sm:px-6 lg:px-8">
      <div class="mx-auto max-w-7xl">
        <section class="mb-8 grid gap-6 lg:grid-cols-[1.35fr_0.65fr]">
          <BaseCard class="overflow-hidden p-8">
            <div class="max-w-3xl">
              <p class="text-sm font-semibold uppercase tracking-[0.2em] text-primary">{{ t('userWorkspace.title') }}</p>
              <h1 class="mt-3 font-serif text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
                {{ t('userWorkspace.hero') }}
              </h1>
              <p class="mt-5 text-lg leading-relaxed text-muted-foreground">
                {{ t('userWorkspace.heroDesc') }}
              </p>
            </div>
            <div class="mt-8 flex flex-col gap-3 sm:flex-row">
              <RouterLink to="/user/mock-interview/new">
                <BaseButton size="lg">
                  <Sparkles class="h-4 w-4" />
                  {{ t('userWorkspace.startMock') }}
                </BaseButton>
              </RouterLink>
              <RouterLink to="/user/roadmap">
                <BaseButton size="lg" variant="outline">{{ t('userWorkspace.viewRoadmap') }}</BaseButton>
              </RouterLink>
            </div>
          </BaseCard>

          <BaseCard class="p-8">
            <h2 class="text-xl font-bold text-foreground">{{ t('userWorkspace.latestFeedback') }}</h2>
            <div class="mt-5 rounded-[1.5rem] bg-primary/10 p-5">
              <div class="text-4xl font-bold text-primary">82</div>
              <p class="mt-1 text-sm text-muted-foreground">{{ t('userWorkspace.scoreLabel') }}</p>
            </div>
            <p class="mt-5 text-sm leading-relaxed text-muted-foreground">
              {{ t('userWorkspace.feedbackText') }}
            </p>
            <RouterLink to="/user/roadmap" class="mt-5 inline-flex text-sm font-semibold text-primary">
              {{ t('userWorkspace.openRecommendations') }}
            </RouterLink>
          </BaseCard>
        </section>

        <section class="mb-8">
          <div class="mb-4 flex items-center justify-between gap-4">
            <div>
              <h2 class="text-2xl font-bold text-foreground">{{ t('userWorkspace.presetsTitle') }}</h2>
              <p class="mt-1 text-sm text-muted-foreground">{{ t('userWorkspace.presetsDesc') }}</p>
            </div>
          </div>

          <div class="grid gap-5 md:grid-cols-3">
            <BaseCard v-for="preset in presets" :key="preset.id" class="p-6">
              <div class="flex items-start justify-between gap-4">
                <div>
                  <h3 class="text-lg font-bold text-foreground">{{ preset.title }}</h3>
                  <p class="mt-1 text-sm text-muted-foreground">{{ preset.level }} · {{ preset.durationMinutes }} {{ t('common.minutes') }}</p>
                </div>
                <span class="rounded-full bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground">{{ preset.attempts }} {{ t('userWorkspace.tries') }}</span>
              </div>
              <p class="mt-4 text-sm leading-relaxed text-muted-foreground">{{ preset.focus }}</p>
              <div class="mt-5 flex flex-wrap gap-2">
                <span v-for="item in preset.stack" :key="item" class="rounded-full border border-border px-3 py-1 text-xs font-semibold">
                  {{ item }}
                </span>
              </div>
            </BaseCard>
          </div>
        </section>

        <section class="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <BaseCard class="p-8">
            <h2 class="text-xl font-bold text-foreground">{{ t('userWorkspace.recentAttempts') }}</h2>
            <div class="mt-5 space-y-4">
              <div v-for="session in completedSessions" :key="session.id" class="rounded-[1.5rem] border border-border/60 p-4">
                <div class="flex items-start justify-between gap-4">
                  <div>
                    <p class="font-semibold text-foreground">{{ session.position }}</p>
                    <p class="mt-1 text-sm text-muted-foreground">{{ session.completedAt ? new Date(session.completedAt).toLocaleDateString() : t('userWorkspace.notCompleted') }}</p>
                  </div>
                  <span class="font-bold text-primary">{{ session.score ?? '—' }}</span>
                </div>
              </div>
            </div>
          </BaseCard>

          <BaseCard class="p-8">
            <h2 class="text-xl font-bold text-foreground">{{ t('userWorkspace.recommendedLearning') }}</h2>
            <div class="mt-5 grid gap-4 sm:grid-cols-2">
              <div v-for="item in recommendations.slice(0, 2)" :key="item.id" class="rounded-[1.5rem] bg-muted/50 p-5">
                <p class="text-xs font-semibold uppercase tracking-[0.16em] text-primary">{{ item.type }}</p>
                <h3 class="mt-2 font-bold text-foreground">{{ item.title }}</h3>
                <p class="mt-2 text-sm leading-relaxed text-muted-foreground">{{ item.reason }}</p>
              </div>
            </div>
          </BaseCard>
        </section>
      </div>
    </main>

    <AppFooter />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { Sparkles } from 'lucide-vue-next'
import AppFooter from '@/components/AppFooter.vue'
import AppHeader from '@/components/AppHeader.vue'
import BaseButton from '@/components/BaseButton.vue'
import BaseCard from '@/components/BaseCard.vue'
import { getLocalizedSessions, getLocalizedPresets, getLocalizedRecommendations } from '@/data/mock-data'
import { useI18n } from '@/i18n'

const { t } = useI18n()
const presets = computed(() => getLocalizedPresets())
const recommendations = computed(() => getLocalizedRecommendations())
const completedSessions = computed(() => getLocalizedSessions().filter((session) => session.status === 'completed'))
</script>
