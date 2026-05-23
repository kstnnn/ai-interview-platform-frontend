<template>
  <div class="flex min-h-screen flex-col bg-background">
    <AppHeader />

    <main class="flex-1 px-4 py-10 sm:px-6 lg:px-8">
      <div class="mx-auto max-w-6xl">
        <RouterLink to="/user" class="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft class="h-4 w-4" />
          {{ t('learningRoadmap.backToUser') }}
        </RouterLink>

        <BaseCard class="mt-6 p-8">
          <p class="text-sm font-semibold uppercase tracking-[0.2em] text-primary">{{ t('learningRoadmap.aiFeedback') }}</p>
          <h1 class="mt-3 font-serif text-4xl font-bold text-foreground">{{ t('learningRoadmap.title') }}</h1>
          <p class="mt-4 leading-relaxed text-muted-foreground">{{ roadmap?.summary || t('learningRoadmap.realRoadmapDesc') }}</p>

          <div v-if="roadmap" class="mt-6 grid gap-3 text-center sm:grid-cols-3">
            <div class="rounded-[1.25rem] bg-muted/50 p-4">
              <div class="text-2xl font-bold text-primary">{{ roadmap.priorityTopics.length }}</div>
              <p class="mt-1 text-xs text-muted-foreground">{{ t('learningRoadmap.priorityTopics') }}</p>
            </div>
            <div class="rounded-[1.25rem] bg-muted/50 p-4">
              <div class="text-2xl font-bold text-primary">{{ roadmap.sourceSessionIds?.length ?? 0 }}</div>
              <p class="mt-1 text-xs text-muted-foreground">{{ t('learningRoadmap.sourceInterviews') }}</p>
            </div>
            <div class="rounded-[1.25rem] bg-muted/50 p-4">
              <div class="text-lg font-bold text-primary">{{ roadmap.updatedAt ? formatDate(roadmap.updatedAt) : '—' }}</div>
              <p class="mt-1 text-xs text-muted-foreground">{{ t('learningRoadmap.updatedAt') }}</p>
            </div>
          </div>
        </BaseCard>

        <BaseCard v-if="isLoading" class="mt-6 p-8 text-center text-muted-foreground">
          {{ t('learningRoadmap.loading') }}
        </BaseCard>
        <BaseCard v-else-if="error" class="mt-6 p-8 text-center text-destructive">
          {{ error }}
        </BaseCard>
        <BaseCard v-else-if="!roadmap?.priorityTopics.length" class="mt-6 p-8 text-center">
          <h2 class="text-xl font-bold text-foreground">{{ t('learningRoadmap.emptyTitle') }}</h2>
          <p class="mt-3 text-muted-foreground">{{ roadmap?.summary || t('learningRoadmap.noMockYet') }}</p>
          <RouterLink to="/user/mock-interview/new" class="mt-6 inline-flex">
            <BaseButton size="lg">{{ t('userWorkspace.startMock') }}</BaseButton>
          </RouterLink>
        </BaseCard>

        <section v-else class="mt-6 space-y-5">
          <BaseCard v-for="topic in roadmap.priorityTopics" :key="topic.topic" class="p-6">
            <div class="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <div class="flex flex-wrap gap-2 text-xs font-semibold">
                  <span class="rounded-full bg-primary/10 px-3 py-1 text-primary">{{ topicLabel(topic.topic) }}</span>
                  <span v-if="topic.priority" class="rounded-full bg-muted px-3 py-1 text-muted-foreground">{{ priorityLabel(topic.priority) }}</span>
                  <span v-if="topic.trend" class="rounded-full bg-muted px-3 py-1 text-muted-foreground">{{ trendLabel(topic.trend) }}</span>
                </div>
                <p class="mt-4 leading-relaxed text-muted-foreground">{{ topic.reason }}</p>
              </div>
              <div class="min-w-[140px] rounded-[1.25rem] bg-muted/50 p-4 text-center">
                <div class="text-2xl font-bold text-primary">{{ scoreLabel(topic.currentScore ?? topic.score) }}</div>
                <p class="mt-1 text-xs text-muted-foreground">{{ t('learningRoadmap.currentScore') }}</p>
                <p v-if="topic.previousScore !== undefined && topic.previousScore !== null" class="mt-2 text-xs text-muted-foreground">
                  {{ t('learningRoadmap.previousScore') }}: {{ scoreLabel(topic.previousScore) }}
                </p>
              </div>
            </div>

            <div v-if="topic.recommendedActions.length" class="mt-5">
              <h3 class="font-semibold text-foreground">{{ t('results.recommendedActions') }}</h3>
              <ul class="mt-3 space-y-2 text-sm text-muted-foreground">
                <li v-for="action in topic.recommendedActions" :key="action">{{ action }}</li>
              </ul>
            </div>

            <div v-if="topic.resources.length" class="mt-5">
              <h3 class="font-semibold text-foreground">{{ t('learningRoadmap.resourcesTitle') }}</h3>
              <div class="mt-3 flex flex-wrap gap-2">
                <a v-for="resource in topic.resources" :key="resource.url" :href="resource.url" target="_blank" rel="noreferrer" class="rounded-full border border-border px-3 py-1 text-xs font-semibold text-primary hover:bg-primary/5">
                  {{ resource.title }} · {{ resource.type }}
                </a>
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
import { onMounted, ref, watch } from 'vue'
import { RouterLink } from 'vue-router'
import { ArrowLeft } from 'lucide-vue-next'
import AppFooter from '@/components/AppFooter.vue'
import AppHeader from '@/components/AppHeader.vue'
import BaseButton from '@/components/BaseButton.vue'
import BaseCard from '@/components/BaseCard.vue'
import { getUserLearningRoadmap } from '@/api/interview'
import { useI18n } from '@/i18n'
import type { LearningRoadmapPriority, LearningRoadmapResponse, LearningRoadmapTrend } from '@/types/api'

const { locale, t } = useI18n()
const roadmap = ref<LearningRoadmapResponse | null>(null)
const isLoading = ref(true)
const error = ref('')

async function loadRoadmap() {
  isLoading.value = true
  error.value = ''
  try {
    roadmap.value = await getUserLearningRoadmap(locale.value)
  } catch (err) {
    error.value = err instanceof Error ? err.message : t('learningRoadmap.loadFailed')
  } finally {
    isLoading.value = false
  }
}

function scoreLabel(score: number | null | undefined) {
  return typeof score === 'number' ? `${Math.round(score * 100)}%` : '—'
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(new Date(value))
}

function topicLabel(topic: string) {
  return topic
    .split('_')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

function trendLabel(trend: LearningRoadmapTrend) {
  return t(`learningRoadmap.trend.${trend}` as any)
}

function priorityLabel(priority: LearningRoadmapPriority) {
  return t(`learningRoadmap.priority.${priority}` as any)
}

onMounted(loadRoadmap)
watch(locale, () => {
  void loadRoadmap()
})
</script>
