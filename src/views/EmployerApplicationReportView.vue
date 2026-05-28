<template>
  <div class="flex min-h-screen flex-col bg-background">
    <AppHeader />

    <main class="flex-1 px-4 py-10 sm:px-6 lg:px-8">
      <div class="mx-auto max-w-5xl">
        <RouterLink :to="`/business/vacancies/${vacancyId}`" class="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft class="h-4 w-4" />
          {{ t('employerReport.backToVacancy') }}
        </RouterLink>

        <BaseCard v-if="isLoading" class="mt-8 p-8 text-center text-muted-foreground">
          {{ t('employerReport.loading') }}
        </BaseCard>

        <BaseCard v-else-if="error" class="mt-8 border border-destructive/20 bg-destructive/10 p-8 text-center text-destructive">
          {{ error }}
        </BaseCard>

        <template v-else-if="report">
          <section class="mt-8 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <BaseCard class="p-8">
              <p class="text-sm font-semibold uppercase tracking-[0.2em] text-primary">{{ t('employerReport.eyebrow') }}</p>
              <h1 class="mt-3 text-3xl font-bold text-foreground">{{ candidateName }}</h1>
              <p v-if="report.candidate.email" class="mt-2 text-muted-foreground">{{ report.candidate.email }}</p>
              <div class="mt-4 flex flex-wrap gap-2 text-xs">
                <ContactLink v-for="contact in contactLinks(report.candidate.contacts)" :key="contact.label + contact.value" :contact="contact" />
                <span v-if="contactLinks(report.candidate.contacts).length === 0" class="text-sm text-muted-foreground">{{ t('applications.noContacts') }}</span>
              </div>
              <div class="mt-5 flex flex-wrap gap-2 text-xs font-semibold text-muted-foreground">
                <span class="rounded-full bg-muted px-3 py-1">{{ applicationStatusLabel(report.status) }}</span>
                <span v-if="report.completedAt" class="rounded-full bg-muted px-3 py-1">{{ t('applications.completedAt') }}: {{ formatDate(report.completedAt) }}</span>
              </div>
              <div class="mt-6 flex flex-wrap items-center gap-3">
                <BaseButton variant="outline" :disabled="isDownloadingPdf" @click="downloadReportPdf">
                  {{ isDownloadingPdf ? t('employerReport.downloadingPdf') : t('employerReport.downloadPdf') }}
                </BaseButton>
                <p v-if="downloadError" class="text-sm text-destructive">{{ downloadError }}</p>
              </div>
            </BaseCard>

            <BaseCard class="p-8">
              <div class="flex items-end justify-between gap-4">
                <div>
                  <p class="text-sm font-semibold text-muted-foreground">{{ t('employerReport.overallScore') }}</p>
                  <p class="mt-2 text-5xl font-bold text-primary">{{ scorePercent(report.sessionConfidence) }}</p>
                </div>
                <span :class="recommendationClass(report.recommendation)" class="rounded-full px-4 py-2 text-sm font-semibold">
                  {{ recommendationLabel(report.recommendation) }}
                </span>
              </div>
              <div class="mt-6 h-3 overflow-hidden rounded-full bg-muted">
                <div class="h-full rounded-full bg-primary" :style="{ width: scoreWidth(report.sessionConfidence) }"></div>
              </div>
            </BaseCard>
          </section>

          <BaseCard class="mt-6 p-8">
            <h2 class="text-xl font-bold text-foreground">{{ t('results.topicBreakdown') }}</h2>
            <div v-if="!report.topics.length" class="mt-6 rounded-[1.5rem] bg-muted/40 p-6 text-sm text-muted-foreground">
              {{ t('employerReport.noTopics') }}
            </div>
            <div v-else class="mt-6 space-y-4">
              <div v-for="topic in report.topics" :key="topic.topic" class="rounded-[1.5rem] bg-muted/40 p-4">
                <div class="flex items-center justify-between gap-4">
                  <h3 class="font-semibold text-foreground">{{ topicLabel(topic.topic) }}</h3>
                  <span class="text-sm font-bold text-primary">{{ scorePercent(topic.masteryScore) }}</span>
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
                    <p class="font-semibold text-foreground">{{ scorePercent(topic.confidenceScore) }}</p>
                    <p>{{ t('results.confidence') }}</p>
                  </div>
                </div>
              </div>
            </div>
          </BaseCard>

          <BaseCard class="mt-6 p-8">
            <h2 class="text-xl font-bold text-foreground">{{ t('results.questionReview') }}</h2>
            <div v-if="!report.questions.length" class="mt-6 rounded-[1.5rem] bg-muted/40 p-6 text-sm text-muted-foreground">
              {{ t('results.noQuestionReview') }}
            </div>
            <div v-else class="mt-6 space-y-4">
              <details v-for="question in report.questions" :key="question.sessionQuestionId" class="rounded-[1.5rem] bg-muted/40 p-5">
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
                      <p class="text-sm font-bold text-primary">{{ scorePercent(question.totalScore) }}</p>
                      <p class="text-xs text-muted-foreground">{{ t('results.totalScore') }}</p>
                    </div>
                  </div>
                </summary>

                <div class="mt-5 grid gap-4">
                  <div>
                    <h4 class="text-sm font-semibold text-foreground">{{ t('employerReport.candidateAnswer') }}</h4>
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
        </template>
      </div>
    </main>

    <AppFooter />
  </div>
</template>

<script setup lang="ts">
import { computed, defineComponent, h, onMounted, ref } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { ArrowLeft } from 'lucide-vue-next'
import AppFooter from '@/components/AppFooter.vue'
import AppHeader from '@/components/AppHeader.vue'
import BaseButton from '@/components/BaseButton.vue'
import BaseCard from '@/components/BaseCard.vue'
import { downloadAuthenticatedFile, organizationApiBaseUrl } from '@/api/download'
import { getVacancyApplicationReport } from '@/api/organization'
import { useI18n } from '@/i18n'
import type { ApplicationRecommendation, CandidateContacts, EmployerApplicationReport } from '@/types/api'

type ContactLinkItem = { label: string; value: string; href?: string }

const route = useRoute()
const { locale, t } = useI18n()
const vacancyId = String(route.params.vacancyId ?? '')
const applicationId = String(route.params.applicationId ?? '')
const report = ref<EmployerApplicationReport | null>(null)
const isLoading = ref(true)
const isDownloadingPdf = ref(false)
const error = ref('')
const downloadError = ref('')

const candidateName = computed(() => {
  const candidate = report.value?.candidate
  if (!candidate) return '—'
  return [candidate.firstName, candidate.lastName].filter(Boolean).join(' ') || candidate.email || candidate.userId
})

onMounted(async () => {
  try {
    report.value = await getVacancyApplicationReport(vacancyId, applicationId)
  } catch (err) {
    error.value = err instanceof Error ? err.message : t('employerReport.loadFailed')
  } finally {
    isLoading.value = false
  }
})

async function downloadReportPdf() {
  isDownloadingPdf.value = true
  downloadError.value = ''
  const language = locale.value === 'ru' ? 'ru' : 'en'
  try {
    await downloadAuthenticatedFile(
      `${organizationApiBaseUrl}/vacancies/${encodeURIComponent(vacancyId)}/applications/${encodeURIComponent(applicationId)}/report/export?language=${language}`,
      `application-report-${applicationId}.pdf`,
    )
  } catch (err) {
    downloadError.value = err instanceof Error ? err.message : t('common.downloadFailed')
  } finally {
    isDownloadingPdf.value = false
  }
}

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
  const normalized = topic.trim().toLowerCase().replace(/\s+/g, '_')
  const mapped = topicLabels[normalized]
  if (mapped) return mapped[locale.value]
  return topic
    .split(/[_\s]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

function normalizedPercent(score: number | null | undefined) {
  if (typeof score !== 'number') return null
  return Math.round(score * 100)
}

function scorePercent(score: number | null | undefined) {
  const percent = normalizedPercent(score)
  return percent === null ? t('results.notEvaluated') : `${percent}%`
}

function scoreWidth(score: number | null | undefined) {
  const percent = normalizedPercent(score)
  return percent === null ? '0%' : `${percent}%`
}

function formatScore10(score: number | null | undefined) {
  if (typeof score !== 'number') return '—'
  return (score * 10).toFixed(1)
}

function questionSourceLabel(sourceType: string) {
  return t(`results.sourceType.${sourceType}` as any)
}

function applicationStatusLabel(status: string) {
  return t(`applications.status.${status}` as any)
}

function recommendationLabel(recommendation: ApplicationRecommendation | null | undefined) {
  if (!recommendation) return t('results.notEvaluated')
  return t(`applications.recommendation.${recommendation}` as any)
}

function recommendationClass(recommendation: ApplicationRecommendation | null | undefined) {
  if (recommendation === 'STRONG_YES' || recommendation === 'YES') return 'bg-success/10 text-success'
  if (recommendation === 'MAYBE') return 'bg-warning/10 text-foreground'
  if (recommendation === 'NO' || recommendation === 'STRONG_NO') return 'bg-destructive/10 text-destructive'
  return 'bg-muted text-muted-foreground'
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value))
}

function contactLinks(contacts: CandidateContacts) {
  const items: ContactLinkItem[] = []
  if (contacts.email) items.push({ label: t('contacts.email'), value: contacts.email, href: `mailto:${contacts.email}` })
  if (contacts.phone) items.push({ label: t('contacts.phone'), value: contacts.phone, href: `tel:${contacts.phone}` })
  if (contacts.telegram) items.push({ label: t('contacts.telegram'), value: contacts.telegram, href: telegramHref(contacts.telegram) })
  if (contacts.linkedIn) items.push({ label: t('contacts.linkedIn'), value: contacts.linkedIn, href: contacts.linkedIn })
  if (contacts.portfolioUrl) items.push({ label: t('contacts.portfolioUrl'), value: contacts.portfolioUrl, href: contacts.portfolioUrl })
  if (contacts.hhResumeUrl) items.push({ label: t('contacts.hhResumeUrl'), value: contacts.hhResumeUrl, href: contacts.hhResumeUrl })
  return items
}

function telegramHref(value: string) {
  if (value.startsWith('http://') || value.startsWith('https://')) return value
  return `https://t.me/${value.replace(/^@/, '')}`
}

const ContactLink = defineComponent({
  name: 'ContactLink',
  props: {
    contact: { type: Object as () => ContactLinkItem, required: true },
  },
  setup(props) {
    return () => {
      const children = `${props.contact.label}: ${props.contact.value}`
      const baseClass = 'rounded-full border border-border px-3 py-1 font-semibold text-muted-foreground hover:text-foreground'
      if (props.contact.href) {
        return h('a', { class: baseClass, href: props.contact.href, target: '_blank', rel: 'noreferrer' }, children)
      }
      return h('span', { class: baseClass }, children)
    }
  },
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
        h('p', { class: 'text-lg font-bold text-primary' }, scorePercent(props.score)),
        h('p', { class: 'mt-1 text-xs text-muted-foreground' }, props.label),
      ])
  },
})
</script>
