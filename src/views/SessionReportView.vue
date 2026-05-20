<template>
  <div v-if="session" class="flex min-h-screen flex-col bg-background">
    <AppHeader />

    <main class="flex-1 px-4 py-8 sm:px-6 lg:px-8">
      <div class="mx-auto max-w-5xl">
        <div class="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <RouterLink to="/dashboard" class="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
              <ArrowLeft class="h-4 w-4" />
              {{ t('sessionReport.backToDashboard') }}
            </RouterLink>
            <h1 class="mt-3 text-3xl font-bold text-foreground">{{ t('sessionReport.title') }}</h1>
            <p class="mt-1 text-muted-foreground">{{ session.candidateName }} · {{ session.position }}</p>
          </div>
          <RouterLink v-if="score" :to="`/results/${session.id}`">
            <BaseButton>{{ t('sessionReport.openSummary') }}</BaseButton>
          </RouterLink>
        </div>

        <div class="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <div class="space-y-6">
            <BaseCard class="p-8">
              <h2 class="text-xl font-bold text-foreground">{{ t('sessionReport.candidateInfo') }}</h2>
              <div class="mt-6 grid gap-4 sm:grid-cols-2">
                <InfoItem :label="t('sessionReport.name')" :value="session.candidateName" />
                <InfoItem :label="t('sessionReport.email')" :value="session.candidateEmail" />
                <InfoItem :label="t('sessionReport.position')" :value="session.position" />
                <InfoItem :label="t('sessionReport.level')" :value="session.level" />
                <InfoItem :label="t('sessionReport.interviewer')" :value="session.interviewerName ?? '—'" />
                <InfoItem :label="t('sessionReport.sessionCode')" :value="session.sessionCode" />
              </div>
            </BaseCard>

            <BaseCard class="p-8">
              <h2 class="text-xl font-bold text-foreground">{{ t('sessionReport.questionReview') }}</h2>
              <div v-if="questions.length" class="mt-6 space-y-4">
                <div v-for="question in questions" :key="question.id" class="rounded-[1.5rem] border border-border/60 p-5">
                  <div class="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <div class="mb-2 flex flex-wrap gap-2 text-xs font-semibold">
                        <span class="rounded-full bg-muted px-3 py-1">Q{{ question.order }}</span>
                        <span class="rounded-full border border-border px-3 py-1 capitalize">{{ question.category }}</span>
                      </div>
                      <h3 class="text-lg font-bold text-foreground">{{ question.title }}</h3>
                    </div>
                    <div v-if="question.scoreGiven" class="rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold text-primary">
                      {{ question.scoreGiven }}/10
                    </div>
                  </div>

                  <p class="mt-4 text-sm leading-relaxed text-foreground">{{ question.description }}</p>
                  <p v-if="question.answer" class="mt-4 rounded-xl bg-muted/60 p-4 text-sm text-muted-foreground">
                    {{ question.answer }}
                  </p>
                  <p v-if="question.notes" class="mt-4 text-sm leading-relaxed text-muted-foreground">
                    {{ question.notes }}
                  </p>
                </div>
              </div>
              <div v-else class="mt-6 rounded-organic bg-muted/40 p-6 text-sm text-muted-foreground">
                {{ t('sessionReport.noQuestions') }}
              </div>
            </BaseCard>
          </div>

          <div class="space-y-6">
            <BaseCard v-if="score" class="p-8">
              <h2 class="text-xl font-bold text-foreground">{{ t('sessionReport.performanceSummary') }}</h2>
              <div class="mt-6 space-y-4">
                <ScoreRow :label="t('sessionReport.overallScore')" :value="score.overallScore" suffix="/100" />
                <ScoreRow :label="t('sessionReport.technical')" :value="score.technicalSkill" suffix="/10" />
                <ScoreRow :label="t('sessionReport.problemSolving')" :value="score.problemSolving" suffix="/10" />
                <ScoreRow :label="t('sessionReport.communication')" :value="score.communication" suffix="/10" />
                <ScoreRow :label="t('sessionReport.codeQuality')" :value="score.codeQuality" suffix="/10" />
              </div>
            </BaseCard>

            <BaseCard class="p-8">
              <h2 class="text-xl font-bold text-foreground">{{ t('sessionReport.notes') }}</h2>
              <p class="mt-4 text-sm leading-relaxed text-muted-foreground">
                {{ t('sessionReport.notesText') }}
              </p>
            </BaseCard>
          </div>
        </div>
      </div>
    </main>

    <AppFooter />
  </div>

  <div v-else class="flex min-h-screen items-center justify-center px-4 text-center">
    <BaseCard class="max-w-md p-8">
      <h1 class="text-2xl font-bold text-foreground">{{ t('sessionReport.notFound') }}</h1>
      <p class="mt-3 text-muted-foreground">{{ t('sessionReport.notFoundDesc') }}</p>
      <RouterLink to="/dashboard" class="mt-6 inline-block">
        <BaseButton>{{ t('sessionReport.backToDashboardBtn') }}</BaseButton>
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
import { getQuestionsForSession, getScoreForSession, getSessionById } from '@/data/mock-data'
import { useI18n } from '@/i18n'

const route = useRoute()
const { t } = useI18n()
const sessionId = computed(() => String(route.params.sessionId ?? ''))
const session = computed(() => getSessionById(sessionId.value))
const questions = computed(() => getQuestionsForSession(sessionId.value))
const score = computed(() => getScoreForSession(sessionId.value))

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

const ScoreRow = defineComponent({
  name: 'ScoreRow',
  props: {
    label: { type: String, required: true },
    value: { type: Number, required: true },
    suffix: { type: String, required: true },
  },
  setup(props) {
    return () =>
      h('div', { class: 'rounded-[1.5rem] bg-muted/40 p-4' }, [
        h('p', { class: 'text-sm text-muted-foreground' }, props.label),
        h('p', { class: 'mt-2 text-2xl font-bold text-primary' }, `${props.value}${props.suffix}`),
      ])
  },
})
</script>
