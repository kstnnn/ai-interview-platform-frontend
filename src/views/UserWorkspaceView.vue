<template>
  <div class="flex min-h-screen flex-col bg-background">
    <AppHeader />

    <main class="flex-1 px-4 py-8 sm:px-6 lg:px-8">
      <div class="mx-auto max-w-7xl">
        <section class="mb-8 grid gap-6 lg:grid-cols-[1.35fr_0.65fr]">
          <BaseCard class="overflow-hidden p-8">
            <div class="max-w-3xl">
              <p class="text-sm font-semibold uppercase tracking-[0.2em] text-primary">{{ t('userWorkspace.title') }}
              </p>
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
              <div class="text-4xl font-bold text-primary">{{ latestScore }}</div>
              <p class="mt-1 text-sm text-muted-foreground">{{ t('userWorkspace.scoreLabel') }}</p>
            </div>
            <p class="mt-5 text-sm leading-relaxed text-muted-foreground">
              {{ latestMockCompleted ? t('userWorkspace.feedbackFromLatest') : t('userWorkspace.noFeedbackYet') }}
            </p>
            <RouterLink :to="latestMockCompleted ? `/results/${latestMockCompleted.sessionId}` : '/user/roadmap'"
              class="mt-5 inline-flex text-sm font-semibold text-primary">
              {{ latestMockCompleted ? t('userWorkspace.openLatestReport') : t('userWorkspace.openRecommendations') }}
            </RouterLink>
          </BaseCard>
        </section>

        <!-- <section class="mb-8"> -->
        <!--   <div class="mb-4 flex items-center justify-between gap-4"> -->
        <!--     <div> -->
        <!--       <h2 class="text-2xl font-bold text-foreground">{{ t('userWorkspace.presetsTitle') }}</h2> -->
        <!--       <p class="mt-1 text-sm text-muted-foreground">{{ t('userWorkspace.presetsDesc') }}</p> -->
        <!--     </div> -->
        <!--   </div> -->
        <!---->
        <!--   <div class="grid gap-5 md:grid-cols-3"> -->
        <!--     <BaseCard v-for="preset in presets" :key="preset.id" class="p-6"> -->
        <!--       <div class="flex items-start justify-between gap-4"> -->
        <!--         <div> -->
        <!--           <h3 class="text-lg font-bold text-foreground">{{ preset.title }}</h3> -->
        <!--           <p class="mt-1 text-sm text-muted-foreground">{{ preset.level }} · {{ preset.durationMinutes }} {{ -->
        <!--             t('common.minutes') }}</p> -->
        <!--         </div> -->
        <!--         <span class="rounded-full bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground">{{ -->
        <!--           preset.attempts }} {{ t('userWorkspace.tries') }}</span> -->
        <!--       </div> -->
        <!--       <p class="mt-4 text-sm leading-relaxed text-muted-foreground">{{ preset.focus }}</p> -->
        <!--       <div class="mt-5 flex flex-wrap gap-2"> -->
        <!--         <span v-for="item in preset.stack" :key="item" -->
        <!--           class="rounded-full border border-border px-3 py-1 text-xs font-semibold"> -->
        <!--           {{ item }} -->
        <!--         </span> -->
        <!--       </div> -->
        <!--     </BaseCard> -->
        <!--   </div> -->
        <!-- </section> -->
        <!---->
        <section class="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <BaseCard class="p-8">
            <h2 class="text-xl font-bold text-foreground">{{ t('userWorkspace.recentAttempts') }}</h2>
            <div class="mt-5 max-h-[420px] space-y-4 overflow-y-auto pr-2">
              <div v-if="isLoadingSessions"
                class="rounded-[1.5rem] border border-border/60 p-4 text-sm text-muted-foreground">
                {{ t('userWorkspace.loadingAttempts') }}
              </div>
              <div v-else-if="sessionsError"
                class="rounded-[1.5rem] border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">
                {{ sessionsError }}
              </div>
              <div v-else-if="interviewSessions.length === 0"
                class="rounded-[1.5rem] border border-border/60 p-4 text-sm text-muted-foreground">
                {{ t('userWorkspace.noAttempts') }}
              </div>
              <template v-else>
                <div v-for="session in interviewSessions" :key="session.sessionId"
                  class="rounded-[1.5rem] border border-border/60 p-4">
                  <div class="flex items-start justify-between gap-4">
                    <div>
                      <p class="font-semibold text-foreground">{{ sessionTitle(session) }}</p>
                      <p class="mt-1 text-sm text-muted-foreground">{{ sessionDate(session) }}</p>
                      <div class="mt-2 flex flex-wrap gap-2">
                        <span class="rounded-full bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground">{{
                          statusLabel(session.status) }}</span>
                        <span class="rounded-full bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground">{{
                          session.questionsAsked }} {{ t('userWorkspace.questions') }}</span>
                      </div>
                    </div>
                    <div class="text-right">
                      <span class="font-bold text-primary">{{ session.sessionConfidence === null ? '—' :
                        Math.round(session.sessionConfidence * 100) }}</span>
                      <RouterLink :to="sessionActionTo(session)" class="mt-3 block text-sm font-semibold text-primary">
                        {{ sessionActionLabel(session) }}
                      </RouterLink>
                    </div>
                  </div>
                </div>
              </template>
            </div>
          </BaseCard>

          <BaseCard class="p-8">
            <h2 class="text-xl font-bold text-foreground">{{ t('userWorkspace.recommendedLearning') }}</h2>
            <div v-if="isLoadingRoadmap" class="mt-5 rounded-[1.5rem] bg-muted/50 p-5 text-sm text-muted-foreground">{{ t('learningRoadmap.loading') }}</div>
            <div v-else-if="roadmapError" class="mt-5 rounded-[1.5rem] bg-destructive/10 p-5 text-sm text-destructive">{{ roadmapError }}</div>
            <div v-else-if="roadmapPreview.length" class="mt-5 grid gap-4 sm:grid-cols-2">
              <div v-for="topic in roadmapPreview" :key="topic.topic" class="rounded-[1.5rem] bg-muted/50 p-5">
                <p class="text-xs font-semibold uppercase tracking-[0.16em] text-primary">{{ topic.topic }}</p>
                <h3 class="mt-2 font-bold text-foreground">{{ scoreLabel(topic.currentScore ?? topic.score) }}</h3>
                <p class="mt-2 text-sm leading-relaxed text-muted-foreground">{{ topic.reason }}</p>
              </div>
            </div>
            <p v-else class="mt-5 rounded-[1.5rem] bg-muted/50 p-5 text-sm leading-relaxed text-muted-foreground">{{ roadmap?.summary || t('userWorkspace.realRoadmapEmpty') }}</p>
            <RouterLink to="/user/roadmap" class="mt-5 inline-flex text-sm font-semibold text-primary">
              {{ t('learningRoadmap.openLatestRoadmap') }}
            </RouterLink>
          </BaseCard>
        </section>

        <section class="mt-6">
          <BaseCard class="p-8">
            <h2 class="text-xl font-bold text-foreground">{{ t('applications.myTitle') }}</h2>
            <div class="mt-5 max-h-[360px] space-y-4 overflow-y-auto pr-2">
              <div v-if="isLoadingApplications" class="rounded-[1.5rem] border border-border/60 p-4 text-sm text-muted-foreground">{{ t('applications.loading') }}</div>
              <div v-else-if="applicationsError" class="rounded-[1.5rem] border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">{{ applicationsError }}</div>
              <div v-else-if="applications.length === 0" class="rounded-[1.5rem] border border-border/60 p-4 text-sm text-muted-foreground">{{ t('applications.myEmpty') }}</div>
              <div v-else v-for="application in applications" :key="application.applicationId" class="rounded-[1.5rem] border border-border/60 p-4">
                <div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p class="font-semibold text-foreground">{{ t('applications.application') }} #{{ application.applicationId.slice(0, 8) }}</p>
                    <p class="mt-1 text-sm text-muted-foreground">{{ applicationStatusLabel(application.status) }} · {{ new Date(application.createdAt).toLocaleDateString() }}</p>
                  </div>
                  <RouterLink :to="`/results/${application.interviewSessionId}`" class="text-sm font-semibold text-primary">{{ t('applications.openStatus') }}</RouterLink>
                </div>
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
import { computed, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { Sparkles } from 'lucide-vue-next'
import AppFooter from '@/components/AppFooter.vue'
import AppHeader from '@/components/AppHeader.vue'
import BaseButton from '@/components/BaseButton.vue'
import BaseCard from '@/components/BaseCard.vue'
import { getMyInterviews, getUserLearningRoadmap } from '@/api/interview'
import { getMyApplications } from '@/api/organization'
import { useI18n } from '@/i18n'
import type { InterviewSessionStatus, InterviewSessionSummary, LearningRoadmapResponse, VacancyApplicationSummary } from '@/types/api'

const { locale, t } = useI18n()
const interviewSessions = ref<InterviewSessionSummary[]>([])
const applications = ref<VacancyApplicationSummary[]>([])
const roadmap = ref<LearningRoadmapResponse | null>(null)
const isLoadingSessions = ref(true)
const isLoadingApplications = ref(true)
const isLoadingRoadmap = ref(true)
const sessionsError = ref('')
const applicationsError = ref('')
const roadmapError = ref('')
const latestMockCompleted = computed(() => interviewSessions.value.find((session) => session.status === 'COMPLETED' && session.sessionType === 'MOCK') ?? null)
const latestScore = computed(() => latestMockCompleted.value?.sessionConfidence === null || !latestMockCompleted.value ? '—' : Math.round(latestMockCompleted.value.sessionConfidence * 100))
const roadmapPreview = computed(() => roadmap.value?.priorityTopics.slice(0, 2) ?? [])

onMounted(async () => {
  try {
    interviewSessions.value = await getMyInterviews()
  } catch (err) {
    sessionsError.value = err instanceof Error ? err.message : t('userWorkspace.loadAttemptsFailed')
  } finally {
    isLoadingSessions.value = false
  }

  try {
    applications.value = await getMyApplications()
  } catch (err) {
    applicationsError.value = err instanceof Error ? err.message : t('applications.loadFailed')
  } finally {
    isLoadingApplications.value = false
  }

  try {
    roadmap.value = await getUserLearningRoadmap(locale.value)
  } catch (err) {
    roadmapError.value = err instanceof Error ? err.message : t('learningRoadmap.loadFailed')
  } finally {
    isLoadingRoadmap.value = false
  }
})

function sessionTitle(session: InterviewSessionSummary) {
  return `${session.interviewLevel} · ${session.technologyKeys.join(', ') || 'Interview'}`
}

function sessionDate(session: InterviewSessionSummary) {
  const date = session.finishedAt ?? session.startedAt
  return date ? new Date(date).toLocaleDateString() : t('userWorkspace.notCompleted')
}

function statusLabel(status: InterviewSessionStatus) {
  if (status === 'CREATED') return t('userWorkspace.statusCreated')
  if (status === 'IN_PROGRESS') return t('userWorkspace.statusInProgress')
  if (status === 'COMPLETED') return t('userWorkspace.statusCompleted')
  return t('userWorkspace.statusCancelled')
}

function sessionActionTo(session: InterviewSessionSummary) {
  if (session.status === 'COMPLETED' && session.sessionType === 'MOCK') return `/results/${session.sessionId}`
  if (session.status === 'COMPLETED') return '/user'
  if (session.status === 'IN_PROGRESS') return `/candidate/interview/${session.sessionId}`
  if (session.status === 'CREATED') return `/candidate/interview/${session.sessionId}`
  return '/user'
}

function sessionActionLabel(session: InterviewSessionSummary) {
  if (session.status === 'COMPLETED' && session.sessionType === 'MOCK') return t('userWorkspace.viewResults')
  if (session.status === 'COMPLETED') return t('userWorkspace.statusCompleted')
  if (session.status === 'IN_PROGRESS') return t('userWorkspace.continueInterview')
  if (session.status === 'CREATED') return t('userWorkspace.startInterview')
  return t('userWorkspace.statusCancelled')
}

function applicationStatusLabel(status: string) {
  return t(`applications.status.${status}` as any)
}

function scoreLabel(score: number | null | undefined) {
  return typeof score === 'number' ? `${Math.round(score * 100)}%` : '—'
}
</script>
