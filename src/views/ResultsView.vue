<template>
  <div v-if="isLoading" class="flex min-h-screen items-center justify-center px-4 text-center">
    <BaseCard class="max-w-md p-8">
      <h1 class="text-2xl font-bold text-foreground">{{ t('results.loading') }}</h1>
    </BaseCard>
  </div>

  <div v-else-if="isVacancyApplication" class="flex min-h-screen flex-col bg-background">
    <AppHeader />
    <main class="flex flex-1 items-center justify-center px-4 py-12 text-center sm:px-6 lg:px-8">
      <BaseCard class="max-w-lg p-8">
        <h1 class="text-2xl font-bold text-foreground">{{ vacancyStatusTitle }}</h1>
        <p class="mt-3 leading-relaxed text-muted-foreground">{{ vacancyStatusDescription }}</p>
        <div class="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <RouterLink v-if="canContinueVacancyInterview" :to="`/candidate/interview/${sessionId}`">
            <BaseButton>{{ t('userWorkspace.continueInterview') }}</BaseButton>
          </RouterLink>
          <RouterLink to="/user">
            <BaseButton variant="outline">{{ t('results.backToWorkspace') }}</BaseButton>
          </RouterLink>
        </div>
      </BaseCard>
    </main>
    <AppFooter />
  </div>

  <div v-else-if="result" class="flex min-h-screen flex-col bg-background">
    <AppHeader />

    <main class="flex-1 px-4 py-12 sm:px-6 lg:px-8">
      <div class="mx-auto max-w-4xl">
        <div class="mb-8 text-center">
          <h1 class="text-3xl font-bold text-foreground sm:text-4xl">{{ t('results.title') }}</h1>
          <p class="mt-2 text-muted-foreground">{{ t('results.subtitle') }}</p>
        </div>

        <BaseCard v-if="reportError" class="mb-8 border border-warning/20 bg-warning/10 p-5">
          <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 class="font-semibold text-foreground">{{ t('results.fullReportFailed') }}</h2>
              <p class="mt-1 text-sm text-muted-foreground">
                  {{ reportError }}
              </p>
            </div>
            <BaseButton variant="outline" :disabled="isRetrying" @click="loadReport">
              {{ isRetrying ? t('results.loading') : t('results.retryReport') }}
            </BaseButton>
          </div>
        </BaseCard>

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
                <h3 class="font-semibold text-foreground">{{ topicLabel(topic.topic) }}</h3>
                <span class="text-sm font-bold text-primary">{{ scoreLabel(topic.masteryScore) }}</span>
              </div>
              <div class="mt-2 h-2 overflow-hidden rounded-full bg-background/50">
                <div class="h-full rounded-full bg-primary" :style="{ width: scoreWidth(topic.masteryScore) }"></div>
              </div>
              <div class="mt-3 grid grid-cols-3 gap-4 text-center text-xs text-muted-foreground">
                <div>
                  <p class="font-semibold text-foreground">{{ topic.questionsAsked }}</p>
                  <p>{{ t('results.questionsAsked') }}</p>
                </div>
                <div>
                  <p class="font-semibold text-foreground">{{ formatScore10(topic.avgScore) }}/10</p>
                  <p>{{ t('results.avgScore') }}</p>
                </div>
                <div>
                  <p class="font-semibold text-foreground">{{ scoreLabel(topic.confidenceScore) }}</p>
                  <p>{{ t('results.confidence') }}</p>
                </div>
              </div>
            </div>
          </div>
        </BaseCard>

        <BaseCard class="mb-8 p-8">
          <h2 class="text-xl font-bold text-foreground">{{ t('results.questionReview') }}</h2>
          <div v-if="!result.questions?.length" class="mt-6 rounded-[1.5rem] bg-muted/40 p-6 text-sm text-muted-foreground">
            {{ t('results.noQuestionReview') }}
          </div>
          <div v-else class="mt-6 space-y-4">
            <details v-for="question in result.questions" :key="question.sessionQuestionId" class="rounded-[1.5rem] bg-muted/40 p-5">
              <summary class="cursor-pointer list-none">
                <div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div class="flex flex-wrap gap-2 text-xs font-semibold text-muted-foreground">
                      <span class="rounded-full bg-background px-3 py-1">#{{ question.questionIndex || question.roundNumber }}</span>
                      <span class="rounded-full bg-background px-3 py-1">{{ question.questionType }}</span>
                      <span v-if="question.difficulty" class="rounded-full bg-background px-3 py-1">{{ question.difficulty }}</span>
                      <span v-if="question.sourceType" class="rounded-full bg-primary/10 px-3 py-1 text-primary">{{ questionSourceLabel(question.sourceType) }}</span>
                    </div>
                    <h3 class="mt-3 font-semibold text-foreground">{{ question.questionText }}</h3>
                    <p class="mt-1 text-xs text-muted-foreground">
                      {{ topicLabel(question.topic) }}<span v-if="question.subtopic"> · {{ topicLabel(question.subtopic) }}</span>
                    </p>
                  </div>
                  <div class="text-left sm:text-right">
                    <p class="text-sm font-bold text-primary">{{ scoreLabel(question.totalScore) }}</p>
                    <p class="text-xs text-muted-foreground">{{ t('results.totalScore') }}</p>
                  </div>
                </div>
              </summary>

              <div class="mt-5 grid gap-4">
                <div>
                  <h4 class="text-sm font-semibold text-foreground">{{ t('results.yourAnswer') }}</h4>
                  <p class="mt-2 rounded-2xl bg-background/60 p-4 text-sm leading-relaxed text-muted-foreground">
                    {{ question.answerText || t('results.notAnswered') }}
                  </p>
                </div>

                <div>
                  <h4 class="text-sm font-semibold text-foreground">{{ t('results.aiFeedback') }}</h4>
                  <p class="mt-2 rounded-2xl bg-background/60 p-4 text-sm leading-relaxed text-muted-foreground">
                    {{ question.feedback || t('results.notEvaluated') }}
                  </p>
                </div>

                <div class="grid gap-3 sm:grid-cols-4">
                  <ScorePill :label="t('results.correctness')" :score="question.correctnessScore ?? undefined" />
                  <ScorePill :label="t('results.depth')" :score="question.depthScore ?? undefined" />
                  <ScorePill :label="t('results.practical')" :score="question.practicalScore ?? undefined" />
                  <ScorePill :label="t('results.totalScore')" :score="question.totalScore ?? undefined" />
                </div>

                <div v-if="question.knowledgeGaps.length">
                  <h4 class="text-sm font-semibold text-foreground">{{ t('results.knowledgeGaps') }}</h4>
                  <div class="mt-2 flex flex-wrap gap-2">
                    <span v-for="gap in question.knowledgeGaps" :key="gap" class="rounded-full bg-warning/10 px-3 py-1 text-xs font-semibold text-foreground">
                      {{ gap }}
                    </span>
                  </div>
                </div>
              </div>
            </details>
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
          <RouterLink to="/user/roadmap">
            <BaseButton variant="outline">{{ t('results.openFullRoadmap') }}</BaseButton>
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
import { computed, defineComponent, h, onMounted, ref } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import { ArrowLeft } from 'lucide-vue-next'
import AppFooter from '@/components/AppFooter.vue'
import AppHeader from '@/components/AppHeader.vue'
import BaseButton from '@/components/BaseButton.vue'
import BaseCard from '@/components/BaseCard.vue'
import { getInterviewReport, getInterviewSession } from '@/api/interview'
import type { InterviewResult, InterviewSessionDetails } from '@/types/api'
import { useI18n } from '@/i18n'

const route = useRoute()
const { locale, t } = useI18n()
const sessionId = String(route.params.sessionId ?? '')
const result = ref<InterviewResult | null>(null)
const sessionDetails = ref<InterviewSessionDetails | null>(null)
const isLoading = ref(true)
const isRetrying = ref(false)
const reportError = ref('')
const isVacancyApplication = computed(() => sessionDetails.value?.sessionType === 'VACANCY_APPLICATION')
const canContinueVacancyInterview = computed(() => sessionDetails.value?.status === 'CREATED' || sessionDetails.value?.status === 'IN_PROGRESS')
const vacancyStatusTitle = computed(() => {
  if (canContinueVacancyInterview.value) return t('results.vacancyInProgressTitle')
  if (sessionDetails.value?.status === 'CANCELLED') return t('results.vacancyCancelledTitle')
  return t('results.vacancyCompletedTitle')
})
const vacancyStatusDescription = computed(() => {
  if (canContinueVacancyInterview.value) return t('results.vacancyInProgressDesc')
  if (sessionDetails.value?.status === 'CANCELLED') return t('results.vacancyCancelledDesc')
  return t('results.vacancyCompletedDesc')
})

async function loadReport() {
  isRetrying.value = !isLoading.value
  reportError.value = ''

  try {
    result.value = await getInterviewReport(sessionId)
  } catch (err) {
    reportError.value = err instanceof Error ? err.message : t('results.fullReportFailed')
    result.value = null
  } finally {
    isLoading.value = false
    isRetrying.value = false
  }
}

onMounted(async () => {
  try {
    sessionDetails.value = await getInterviewSession(sessionId)
    if (sessionDetails.value.sessionType === 'MOCK') {
      await loadReport()
      return
    }
  } catch (err) {
    reportError.value = err instanceof Error ? err.message : t('results.fullReportFailed')
  } finally {
    isLoading.value = false
  }
})

const topicLabels: Record<string, { en: string; ru: string }> = {
  language_basics: { en: 'Language Basics', ru: 'Основы языка' },
  concurrency: { en: 'Concurrency', ru: 'Многопоточность' },
  collections: { en: 'Collections', ru: 'Коллекции' },
  strings: { en: 'Strings', ru: 'Строки' },
  spring: { en: 'Spring', ru: 'Spring' },
  spring_boot: { en: 'Spring Boot', ru: 'Spring Boot' },
  persistence: { en: 'Persistence', ru: 'Работа с данными' },
  hibernate: { en: 'Hibernate', ru: 'Hibernate' },
  postgresql: { en: 'PostgreSQL', ru: 'PostgreSQL' },
  kafka: { en: 'Kafka', ru: 'Kafka' },
  redis: { en: 'Redis', ru: 'Redis' },
  system_design: { en: 'System Design', ru: 'Проектирование систем' },
  testing: { en: 'Testing', ru: 'Тестирование' },
  devops: { en: 'DevOps', ru: 'DevOps' },
}

function topicLabel(topic?: string | null) {
  if (!topic) return '—'
  const mapped = topicLabels[topic]
  if (mapped) return mapped[locale.value]
  return topic
    .split('_')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

function normalizedPercent(score: number | null | undefined) {
  if (typeof score !== 'number') return null
  return Math.round(score * 100)
}

function scoreLabel(score: number | null | undefined) {
  const percent = normalizedPercent(score)
  return percent === null ? t('results.notEvaluated') : `${percent}%`
}

function scoreWidth(score: number | null | undefined) {
  const percent = normalizedPercent(score)
  return percent === null ? '0%' : `${percent}%`
}

function questionSourceLabel(sourceType: string) {
  return t(`results.sourceType.${sourceType}` as any)
}

function formatScore10(score: number | null | undefined) {
  if (typeof score !== 'number') return '—'
  return (score * 10).toFixed(1)
}

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

const ScorePill = defineComponent({
  name: 'ScorePill',
  props: {
    label: { type: String, required: true },
    score: { type: Number, default: null },
  },
  setup(props) {
    return () =>
      h('div', { class: 'rounded-2xl bg-background/60 p-4 text-center' }, [
        h('p', { class: 'text-lg font-bold text-primary' }, scoreLabel(props.score)),
        h('p', { class: 'mt-1 text-xs text-muted-foreground' }, props.label),
      ])
  },
})
</script>
