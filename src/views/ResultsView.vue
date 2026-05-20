<template>
  <div v-if="session && score" class="flex min-h-screen flex-col bg-background">
    <AppHeader />

    <main class="flex-1 px-4 py-12 sm:px-6 lg:px-8">
      <div class="mx-auto max-w-4xl">
        <div class="mb-8 text-center">
          <h1 class="text-3xl font-bold text-foreground sm:text-4xl">{{ t('results.title') }}</h1>
          <p class="mt-2 text-muted-foreground">{{ t('results.subtitle').replace('{name}', session.candidateName) }}</p>
        </div>

        <BaseCard class="mb-8 border-2 border-primary/20 p-8">
          <div class="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div class="text-5xl font-bold text-primary">{{ score.overallScore }}</div>
              <p class="mt-2 text-sm text-muted-foreground">{{ t('results.outOf') }}</p>
            </div>
            <div :class="recommendationClass" class="rounded-full px-4 py-2 text-sm font-semibold">
              {{ recommendationLabel }}
            </div>
          </div>

          <div class="mt-6 h-3 overflow-hidden rounded-full bg-muted">
            <div class="h-full rounded-full bg-primary" :style="{ width: `${score.overallScore}%` }"></div>
          </div>
        </BaseCard>

        <div class="mb-8 grid gap-4 sm:grid-cols-2">
          <MetricCard :title="t('results.technicalSkill')" :value="score.technicalSkill" />
          <MetricCard :title="t('results.problemSolving')" :value="score.problemSolving" />
          <MetricCard :title="t('results.communication')" :value="score.communication" />
          <MetricCard :title="t('results.codeQuality')" :value="score.codeQuality" />
        </div>

        <BaseCard class="mb-8 p-8">
          <h2 class="text-xl font-bold text-foreground">{{ t('results.sessionInfo') }}</h2>
          <div class="mt-6 grid gap-4 sm:grid-cols-2">
            <InfoItem :label="t('results.candidate')" :value="session.candidateName" />
            <InfoItem :label="t('results.position')" :value="session.position" />
            <InfoItem :label="t('results.level')" :value="session.level" />
            <InfoItem :label="t('results.interviewer')" :value="session.interviewerName ?? '—'" />
            <InfoItem :label="t('results.date')" :value="completedDate" />
            <InfoItem :label="t('results.duration')" :value="t('results.durationValue')" />
          </div>
        </BaseCard>

        <BaseCard v-if="session.feedback" class="mb-8 p-8">
          <h2 class="text-xl font-bold text-foreground">{{ t('results.feedback') }}</h2>
          <p class="mt-4 leading-relaxed text-muted-foreground">{{ session.feedback }}</p>
        </BaseCard>

        <div class="flex flex-col gap-3 sm:flex-row sm:justify-between">
          <RouterLink to="/dashboard">
            <BaseButton variant="outline">
              <ArrowLeft class="h-4 w-4" />
              {{ t('results.backToDashboard') }}
            </BaseButton>
          </RouterLink>
          <RouterLink :to="`/sessions/${session.id}/report`">
            <BaseButton>{{ t('results.openReport') }}</BaseButton>
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
      <RouterLink to="/dashboard" class="mt-6 inline-block">
        <BaseButton>{{ t('results.backToDashboardBtn') }}</BaseButton>
      </RouterLink>
    </BaseCard>
  </div>
</template>

<script setup lang="ts">
import { computed, defineComponent, h } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import { ArrowLeft } from 'lucide-vue-next'
import AppFooter from '@/components/AppFooter.vue'
import AppHeader from '@/components/AppHeader.vue'
import BaseButton from '@/components/BaseButton.vue'
import BaseCard from '@/components/BaseCard.vue'
import { getScoreForSession, getSessionById } from '@/data/mock-data'
import { useI18n } from '@/i18n'

const route = useRoute()
const { t } = useI18n()
const sessionId = computed(() => String(route.params.sessionId ?? ''))
const session = computed(() => getSessionById(sessionId.value))
const score = computed(() => getScoreForSession(sessionId.value))

const completedDate = computed(() => {
  if (!session.value?.completedAt) {
    return '—'
  }

  return new Date(session.value.completedAt).toLocaleDateString()
})

const recommendationLabel = computed(() => {
  const recommendation = score.value?.recommendation
  if (recommendation === 'strong-yes') return t('results.strongYes')
  if (recommendation === 'yes') return t('results.yes')
  if (recommendation === 'maybe') return t('results.maybe')
  if (recommendation === 'no') return t('results.no')
  return t('results.strongNo')
})

const recommendationClass = computed(() => {
  const recommendation = score.value?.recommendation
  if (recommendation === 'strong-yes') return 'bg-success/10 text-success'
  if (recommendation === 'yes') return 'bg-primary/10 text-primary'
  if (recommendation === 'maybe') return 'bg-warning/10 text-foreground'
  return 'bg-destructive/10 text-destructive'
})

const MetricCard = defineComponent({
  name: 'MetricCard',
  props: {
    title: { type: String, required: true },
    value: { type: Number, required: true },
  },
  setup(props) {
    return () =>
      h(BaseCard, { class: 'p-6' }, () => [
        h('h3', { class: 'text-lg font-bold text-foreground' }, props.title),
        h('div', { class: 'mt-3 text-3xl font-bold text-primary' }, `${props.value}/10`),
        h('div', { class: 'mt-3 h-2 overflow-hidden rounded-full bg-muted' }, [
          h('div', { class: 'h-full rounded-full bg-primary', style: { width: `${props.value * 10}%` } }),
        ]),
      ])
  },
})

const InfoItem = defineComponent({
  name: 'InfoItem',
  props: {
    label: { type: String, required: true },
    value: { type: String, required: true },
  },
  setup(props) {
    return () =>
      h('div', [
        h('p', { class: 'text-sm font-medium text-muted-foreground' }, props.label),
        h('p', { class: 'mt-1 font-semibold text-foreground' }, props.value),
      ])
  },
})
</script>
