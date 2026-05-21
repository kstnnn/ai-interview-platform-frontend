<template>
  <div v-if="result" class="flex min-h-screen flex-col bg-background">
    <AppHeader />

    <main class="flex-1 px-4 py-12 sm:px-6 lg:px-8">
      <div class="mx-auto max-w-4xl">
        <div class="mb-8 text-center">
          <h1 class="text-3xl font-bold text-foreground sm:text-4xl">{{ t('results.title') }}</h1>
          <p class="mt-2 text-muted-foreground">{{ t('results.subtitle') }}</p>
        </div>

        <BaseCard class="mb-8 border-2 border-primary/20 p-8">
          <div class="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div class="text-5xl font-bold text-primary">{{ Math.round(result.sessionConfidence * 100) }}</div>
              <p class="mt-2 text-sm text-muted-foreground">{{ t('results.outOf') }}</p>
            </div>
            <div :class="confidenceClass" class="rounded-full px-4 py-2 text-sm font-semibold">
              {{ confidenceLabel }}
            </div>
          </div>

          <div class="mt-6 h-3 overflow-hidden rounded-full bg-muted">
            <div class="h-full rounded-full bg-primary" :style="{ width: `${Math.round(result.sessionConfidence * 100)}%` }"></div>
          </div>
        </BaseCard>

        <BaseCard class="mb-8 p-8">
          <h2 class="text-xl font-bold text-foreground">{{ t('results.topicBreakdown') }}</h2>
          <div class="mt-6 space-y-4">
            <div v-for="topic in result.topics" :key="topic.topic" class="rounded-[1.5rem] bg-muted/40 p-4">
              <div class="flex items-center justify-between">
                <h3 class="font-semibold text-foreground">{{ topic.topic }}</h3>
                <span class="text-sm font-bold text-primary">{{ Math.round(topic.masteryScore * 100) }}%</span>
              </div>
              <div class="mt-2 h-2 overflow-hidden rounded-full bg-background/50">
                <div class="h-full rounded-full bg-primary" :style="{ width: `${Math.round(topic.masteryScore * 100)}%` }"></div>
              </div>
              <div class="mt-3 grid grid-cols-3 gap-4 text-center text-xs text-muted-foreground">
                <div>
                  <p class="font-semibold text-foreground">{{ topic.questionsAsked }}</p>
                  <p>{{ t('results.questionsAsked') }}</p>
                </div>
                <div>
                  <p class="font-semibold text-foreground">{{ topic.avgScore.toFixed(1) }}/10</p>
                  <p>{{ t('results.avgScore') }}</p>
                </div>
                <div>
                  <p class="font-semibold text-foreground">{{ Math.round(topic.confidenceScore * 100) }}%</p>
                  <p>{{ t('results.confidence') }}</p>
                </div>
              </div>
            </div>
          </div>
        </BaseCard>

        <div class="flex flex-col gap-3 sm:flex-row sm:justify-between">
          <RouterLink to="/user">
            <BaseButton variant="outline">
              <ArrowLeft class="h-4 w-4" />
              {{ t('results.backToWorkspace') }}
            </BaseButton>
          </RouterLink>
          <RouterLink to="/user/mock-interview/new">
            <BaseButton>{{ t('results.newInterview') }}</BaseButton>
          </RouterLink>
        </div>
      </div>
    </main>

    <AppFooter />
  </div>

  <div v-else class="flex min-h-screen items-center justify-center px-4 text-center">
    <BaseCard class="max-w-md p-8">
      <h1 class="text-2xl font-bold text-foreground">{{ t('results.unavailable') }}</h1>
      <p class="mt-3 text-muted-foreground">{{ t('results.unavailableDesc') }}</p>
      <RouterLink to="/user" class="mt-6 inline-block">
        <BaseButton>{{ t('results.backToWorkspace') }}</BaseButton>
      </RouterLink>
    </BaseCard>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import { ArrowLeft } from 'lucide-vue-next'
import AppFooter from '@/components/AppFooter.vue'
import AppHeader from '@/components/AppHeader.vue'
import BaseButton from '@/components/BaseButton.vue'
import BaseCard from '@/components/BaseCard.vue'
import type { InterviewResult } from '@/types/api'
import { useI18n } from '@/i18n'

const route = useRoute()
const { t } = useI18n()
const sessionId = String(route.params.sessionId ?? '')

const result = computed<InterviewResult | null>(() => {
  const stored = localStorage.getItem(`interviewResult_${sessionId}`)
  if (!stored) return null
  try {
    return JSON.parse(stored) as InterviewResult
  } catch {
    return null
  }
})

const confidenceLabel = computed(() => {
  if (!result.value) return ''
  const confidence = result.value.sessionConfidence
  if (confidence >= 0.85) return t('results.strongYes')
  if (confidence >= 0.70) return t('results.yes')
  if (confidence >= 0.50) return t('results.maybe')
  if (confidence >= 0.30) return t('results.no')
  return t('results.strongNo')
})

const confidenceClass = computed(() => {
  if (!result.value) return ''
  const confidence = result.value.sessionConfidence
  if (confidence >= 0.85) return 'bg-success/10 text-success'
  if (confidence >= 0.70) return 'bg-primary/10 text-primary'
  if (confidence >= 0.50) return 'bg-warning/10 text-foreground'
  return 'bg-destructive/10 text-destructive'
})
</script>
