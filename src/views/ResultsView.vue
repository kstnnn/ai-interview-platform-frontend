<template>
  <div v-if="session && score" class="flex min-h-screen flex-col bg-background">
    <AppHeader />

    <main class="flex-1 px-4 py-12 sm:px-6 lg:px-8">
      <div class="mx-auto max-w-4xl">
        <div class="mb-8 text-center">
          <h1 class="text-3xl font-bold text-foreground sm:text-4xl">Interview Results</h1>
          <p class="mt-2 text-muted-foreground">Detailed frontend report for {{ session.candidateName }}</p>
        </div>

        <BaseCard class="mb-8 border-2 border-primary/20 p-8">
          <div class="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div class="text-5xl font-bold text-primary">{{ score.overallScore }}</div>
              <p class="mt-2 text-sm text-muted-foreground">out of 100</p>
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
          <MetricCard title="Technical Skill" :value="score.technicalSkill" />
          <MetricCard title="Problem Solving" :value="score.problemSolving" />
          <MetricCard title="Communication" :value="score.communication" />
          <MetricCard title="Code Quality" :value="score.codeQuality" />
        </div>

        <BaseCard class="mb-8 p-8">
          <h2 class="text-xl font-bold text-foreground">Session Information</h2>
          <div class="mt-6 grid gap-4 sm:grid-cols-2">
            <InfoItem label="Candidate" :value="session.candidateName" />
            <InfoItem label="Position" :value="session.position" />
            <InfoItem label="Level" :value="session.level" />
            <InfoItem label="Interviewer" :value="session.interviewerName ?? '—'" />
            <InfoItem label="Date" :value="completedDate" />
            <InfoItem label="Duration" value="1 hour 30 minutes" />
          </div>
        </BaseCard>

        <BaseCard v-if="session.feedback" class="mb-8 p-8">
          <h2 class="text-xl font-bold text-foreground">Interviewer Feedback</h2>
          <p class="mt-4 leading-relaxed text-muted-foreground">{{ session.feedback }}</p>
        </BaseCard>

        <div class="flex flex-col gap-3 sm:flex-row sm:justify-between">
          <RouterLink to="/dashboard">
            <BaseButton variant="outline">
              <ArrowLeft class="h-4 w-4" />
              Back to Dashboard
            </BaseButton>
          </RouterLink>
          <RouterLink :to="`/sessions/${session.id}/report`">
            <BaseButton>Open Session Report</BaseButton>
          </RouterLink>
        </div>
      </div>
    </main>

    <AppFooter />
  </div>

  <div v-else class="flex min-h-screen items-center justify-center px-4 text-center">
    <BaseCard class="max-w-md p-8">
      <h1 class="text-2xl font-bold text-foreground">Result unavailable</h1>
      <p class="mt-3 text-muted-foreground">This demo result exists only for completed local sessions.</p>
      <RouterLink to="/dashboard" class="mt-6 inline-block">
        <BaseButton>Back to Dashboard</BaseButton>
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

const route = useRoute()
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
  if (recommendation === 'strong-yes') return 'Strong Yes'
  if (recommendation === 'yes') return 'Yes'
  if (recommendation === 'maybe') return 'Maybe'
  if (recommendation === 'no') return 'No'
  return 'Strong No'
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
