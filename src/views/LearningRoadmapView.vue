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

        <section v-else class="mt-6 space-y-6">
          <BaseCard v-for="topic in roadmap.priorityTopics" :key="topic.topic" class="overflow-hidden p-0">
            <div class="border-b border-border/50 bg-muted/25 p-6">
              <div class="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <div class="flex flex-wrap gap-2 text-xs font-semibold">
                    <span class="rounded-full bg-primary/10 px-3 py-1 text-primary">{{ topicLabel(topic.topic) }}</span>
                    <span v-if="topic.priority" class="rounded-full px-3 py-1" :class="priorityClass(topic.priority)">{{ priorityLabel(topic.priority) }}</span>
                    <span v-if="topic.trend" class="rounded-full px-3 py-1" :class="trendClass(topic.trend)">{{ trendLabel(topic.trend) }}</span>
                  </div>
                  <p class="mt-4 max-w-3xl leading-relaxed text-muted-foreground">{{ topic.reason }}</p>
                </div>
                <div class="grid min-w-[220px] grid-cols-2 gap-3 text-center">
                  <div class="rounded-[1.25rem] bg-background/70 p-4">
                    <div class="text-2xl font-bold text-primary">{{ scoreLabel(topic.currentScore ?? topic.score) }}</div>
                    <p class="mt-1 text-xs text-muted-foreground">{{ t('learningRoadmap.currentScore') }}</p>
                  </div>
                  <div class="rounded-[1.25rem] bg-background/70 p-4">
                    <div class="text-2xl font-bold text-foreground">{{ scoreLabel(topic.previousScore) }}</div>
                    <p class="mt-1 text-xs text-muted-foreground">{{ t('learningRoadmap.previousScore') }}</p>
                  </div>
                </div>
              </div>
            </div>

            <div class="grid gap-6 p-6 lg:grid-cols-[0.95fr_1.05fr]">
              <div>
                <h3 class="font-semibold text-foreground">{{ t('results.recommendedActions') }}</h3>
                <div v-if="topic.recommendedActions.length" class="mt-3 space-y-3">
                  <div v-for="action in topic.recommendedActions" :key="action" class="flex gap-3 rounded-[1rem] bg-muted/35 p-3 text-sm text-muted-foreground">
                    <span class="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">✓</span>
                    <span>{{ action }}</span>
                  </div>
                </div>
                <p v-else class="mt-3 rounded-[1rem] bg-muted/35 p-3 text-sm text-muted-foreground">{{ t('learningRoadmap.noActions') }}</p>
              </div>

              <div>
                <h3 class="font-semibold text-foreground">{{ t('learningRoadmap.resourcesTitle') }}</h3>
                <div v-if="topic.resources.length" class="mt-3 grid gap-3">
                  <a v-for="resource in topic.resources" :key="resource.url" :href="resource.url" target="_blank" rel="noreferrer" class="group rounded-[1.25rem] border border-border/70 bg-background p-4 transition hover:border-primary/40 hover:bg-primary/5">
                    <div class="flex items-start justify-between gap-4">
                      <div>
                        <p class="font-semibold text-foreground group-hover:text-primary">{{ resource.title }}</p>
                        <p class="mt-2 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                          {{ resourceTypeLabel(resource.type) }} · {{ resource.language }}
                        </p>
                      </div>
                      <span class="text-sm font-semibold text-primary">{{ t('learningRoadmap.openResource') }}</span>
                    </div>
                  </a>
                </div>
                <p v-else class="mt-3 rounded-[1rem] bg-muted/35 p-3 text-sm text-muted-foreground">{{ t('learningRoadmap.noResources') }}</p>
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
import type { LearningRoadmapPriority, LearningRoadmapResponse, LearningRoadmapResourceType, LearningRoadmapTrend } from '@/types/api'

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
  return t(`learningRoadmap.trend.${trend}` as any) || trendFallback[locale.value]?.[trend] || trend
}

function priorityLabel(priority: LearningRoadmapPriority) {
  return t(`learningRoadmap.priority.${priority}` as any) || priorityFallback[locale.value]?.[priority] || priority
}

function resourceTypeLabel(type: LearningRoadmapResourceType) {
  return t(`learningRoadmap.resourceType.${type}` as any) || resourceTypeFallback[locale.value]?.[type] || type
}

function priorityClass(priority: LearningRoadmapPriority) {
  if (priority === 'HIGH') return 'bg-destructive/10 text-destructive'
  if (priority === 'MEDIUM') return 'bg-warning/10 text-foreground'
  return 'bg-success/10 text-success'
}

function trendClass(trend: LearningRoadmapTrend) {
  if (trend === 'IMPROVING') return 'bg-success/10 text-success'
  if (trend === 'DECLINING') return 'bg-destructive/10 text-destructive'
  if (trend === 'NEW') return 'bg-primary/10 text-primary'
  return 'bg-muted text-muted-foreground'
}

const trendFallback: Record<string, Record<string, string>> = {
  en: { IMPROVING: 'Improving', DECLINING: 'Declining', STABLE: 'Stable', NEW: 'New' },
  ru: { IMPROVING: 'Улучшается', DECLINING: 'Снижается', STABLE: 'Стабильно', NEW: 'Новая тема' },
}

const priorityFallback: Record<string, Record<string, string>> = {
  en: { HIGH: 'High priority', MEDIUM: 'Medium priority', LOW: 'Low priority' },
  ru: { HIGH: 'Высокий приоритет', MEDIUM: 'Средний приоритет', LOW: 'Низкий приоритет' },
}

const resourceTypeFallback: Record<string, Record<string, string>> = {
  en: { ARTICLE: 'Article', DOC: 'Documentation', VIDEO: 'Video', PRACTICE: 'Practice' },
  ru: { ARTICLE: 'Статья', DOC: 'Документация', VIDEO: 'Видео', PRACTICE: 'Практика' },
}

onMounted(loadRoadmap)
watch(locale, () => {
  void loadRoadmap()
})
</script>
