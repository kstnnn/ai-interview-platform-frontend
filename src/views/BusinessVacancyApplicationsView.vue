<template>
  <div class="flex min-h-screen flex-col bg-background">
    <AppHeader />

    <main class="flex-1 px-4 py-8 sm:px-6 lg:px-8">
      <div class="mx-auto max-w-7xl">
        <RouterLink :to="`/business/vacancies/${vacancyId}`" class="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft class="h-4 w-4" />
          {{ t('employerReport.backToVacancy') }}
        </RouterLink>

        <div class="mt-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p class="text-sm font-semibold uppercase tracking-[0.2em] text-primary">{{ t('applications.pageEyebrow') }}</p>
            <h1 class="mt-3 text-3xl font-bold text-foreground">{{ vacancy?.title || t('applications.pageTitle') }}</h1>
            <p class="mt-2 max-w-2xl text-muted-foreground">{{ t('applications.pageSubtitle') }}</p>
            <div class="mt-4 flex flex-wrap items-center gap-3">
              <BaseButton variant="outline" :disabled="isExporting" @click="exportApplicationsCsv">
                {{ isExporting ? t('applications.exportingCsv') : t('applications.exportCsv') }}
              </BaseButton>
              <p v-if="exportError" class="text-sm text-destructive">{{ exportError }}</p>
            </div>
          </div>
          <div class="grid grid-cols-3 gap-3 text-center">
            <BaseCard class="p-4">
              <p class="text-2xl font-bold text-foreground">{{ applications.length }}</p>
              <p class="text-xs text-muted-foreground">{{ t('applications.total') }}</p>
            </BaseCard>
            <BaseCard class="p-4">
              <p class="text-2xl font-bold text-success">{{ completedCount }}</p>
              <p class="text-xs text-muted-foreground">{{ t('applications.completed') }}</p>
            </BaseCard>
            <BaseCard class="p-4">
              <p class="text-2xl font-bold text-primary">{{ averageScore }}</p>
              <p class="text-xs text-muted-foreground">{{ t('applications.avgScore') }}</p>
            </BaseCard>
          </div>
        </div>

        <BaseCard class="mt-6 p-5">
          <div class="grid gap-4 lg:grid-cols-[1fr_0.35fr_0.35fr_0.35fr]">
            <label class="relative">
              <Search class="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input v-model="search" class="h-11 w-full rounded-full border border-border bg-input pl-11 pr-4 text-sm outline-none focus:border-primary" :placeholder="t('applications.searchPlaceholder')" />
            </label>
            <select v-model="statusFilter" class="h-11 rounded-full border border-border bg-input px-4 text-sm outline-none focus:border-primary">
              <option value="all">{{ t('applications.allStatuses') }}</option>
              <option value="INTERVIEW_CREATED">{{ t('applications.status.INTERVIEW_CREATED') }}</option>
              <option value="INTERVIEW_IN_PROGRESS">{{ t('applications.status.INTERVIEW_IN_PROGRESS') }}</option>
              <option value="INTERVIEW_COMPLETED">{{ t('applications.status.INTERVIEW_COMPLETED') }}</option>
              <option value="REJECTED">{{ t('applications.status.REJECTED') }}</option>
              <option value="WITHDRAWN">{{ t('applications.status.WITHDRAWN') }}</option>
            </select>
            <select v-model="recommendationFilter" class="h-11 rounded-full border border-border bg-input px-4 text-sm outline-none focus:border-primary">
              <option value="all">{{ t('applications.allRecommendations') }}</option>
              <option value="STRONG_YES">{{ t('applications.recommendation.STRONG_YES') }}</option>
              <option value="YES">{{ t('applications.recommendation.YES') }}</option>
              <option value="MAYBE">{{ t('applications.recommendation.MAYBE') }}</option>
              <option value="NO">{{ t('applications.recommendation.NO') }}</option>
              <option value="STRONG_NO">{{ t('applications.recommendation.STRONG_NO') }}</option>
            </select>
            <select v-model="sortBy" class="h-11 rounded-full border border-border bg-input px-4 text-sm outline-none focus:border-primary">
              <option value="newest">{{ t('applications.sortNewest') }}</option>
              <option value="completedLatest">{{ t('applications.sortCompleted') }}</option>
              <option value="scoreDesc">{{ t('applications.sortScoreDesc') }}</option>
              <option value="scoreAsc">{{ t('applications.sortScoreAsc') }}</option>
            </select>
          </div>
        </BaseCard>

        <div v-if="isLoading" class="mt-6 rounded-organic bg-muted/40 p-10 text-center text-muted-foreground">
          {{ t('applications.loading') }}
        </div>
        <div v-else-if="error" class="mt-6 rounded-organic bg-destructive/10 p-10 text-center text-destructive">
          {{ error }}
        </div>
        <div v-else-if="filteredApplications.length === 0" class="mt-6 rounded-organic bg-muted/40 p-10 text-center text-muted-foreground">
          {{ applications.length === 0 ? t('applications.empty') : t('applications.noResults') }}
        </div>
        <div v-else class="mt-6 grid gap-4 xl:grid-cols-2">
          <BaseCard v-for="application in filteredApplications" :key="application.applicationId" class="p-6">
            <div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2 class="text-lg font-bold text-foreground">{{ candidateLabel(application) }}</h2>
                <div class="mt-2 flex flex-wrap gap-2 text-xs font-semibold text-muted-foreground">
                  <span class="rounded-full bg-muted px-3 py-1">{{ applicationStatusLabel(application.status) }}</span>
                  <span class="rounded-full bg-muted px-3 py-1">{{ formatDate(application.createdAt) }}</span>
                  <span v-if="application.completedAt" class="rounded-full bg-muted px-3 py-1">{{ t('applications.completedAt') }}: {{ formatDate(application.completedAt) }}</span>
                </div>
              </div>
              <RouterLink v-if="applicationRoute(application)" :to="applicationRoute(application)!">
                <BaseButton size="sm" variant="outline">{{ application.status === 'INTERVIEW_COMPLETED' ? t('applications.openReport') : t('applications.openStatus') }}</BaseButton>
              </RouterLink>
              <BaseButton v-else size="sm" variant="outline" disabled>{{ t('applications.reportNotReady') }}</BaseButton>
            </div>

            <div class="mt-4 flex flex-wrap gap-2 text-xs font-semibold">
              <span v-if="application.sessionConfidence !== null && application.sessionConfidence !== undefined" class="rounded-full bg-primary/10 px-3 py-1 text-primary">
                {{ t('applications.score') }}: {{ scorePercent(application.sessionConfidence) }}
              </span>
              <span v-if="application.recommendation" :class="recommendationClass(application.recommendation)" class="rounded-full px-3 py-1">
                {{ recommendationLabel(application.recommendation) }}
              </span>
            </div>

            <div class="mt-4 flex flex-wrap gap-2 text-xs">
              <ContactLink v-for="contact in contactLinks(application)" :key="contact.label + contact.value" :contact="contact" />
              <span v-if="contactLinks(application).length === 0" class="text-sm text-muted-foreground">{{ t('applications.noContacts') }}</span>
            </div>

            <p v-if="application.coverLetter" class="mt-4 line-clamp-3 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
              {{ application.coverLetter }}
            </p>
          </BaseCard>
        </div>
      </div>
    </main>

    <AppFooter />
  </div>
</template>

<script setup lang="ts">
import { computed, defineComponent, h, onMounted, ref } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { ArrowLeft, Search } from 'lucide-vue-next'
import AppFooter from '@/components/AppFooter.vue'
import AppHeader from '@/components/AppHeader.vue'
import BaseButton from '@/components/BaseButton.vue'
import BaseCard from '@/components/BaseCard.vue'
import { downloadAuthenticatedFile, organizationApiBaseUrl } from '@/api/download'
import { getVacancy, getVacancyApplications } from '@/api/organization'
import { useI18n } from '@/i18n'
import type { ApplicationRecommendation, CandidateContacts, VacancyApplicationSummary, VacancyResponse } from '@/types/api'

type ContactLinkItem = { label: string; value: string; href?: string }

const route = useRoute()
const { t } = useI18n()
const vacancyId = String(route.params.vacancyId ?? '')
const vacancy = ref<VacancyResponse | null>(null)
const applications = ref<VacancyApplicationSummary[]>([])
const isLoading = ref(true)
const isExporting = ref(false)
const error = ref('')
const exportError = ref('')
const search = ref('')
const statusFilter = ref('all')
const recommendationFilter = ref('all')
const sortBy = ref('newest')

onMounted(async () => {
  try {
    const [vacancyResponse, applicationsResponse] = await Promise.all([getVacancy(vacancyId), getVacancyApplications(vacancyId)])
    vacancy.value = vacancyResponse
    applications.value = applicationsResponse
  } catch (err) {
    error.value = err instanceof Error ? err.message : t('applications.loadFailed')
  } finally {
    isLoading.value = false
  }
})

const completedCount = computed(() => applications.value.filter((application) => application.status === 'INTERVIEW_COMPLETED').length)
const averageScore = computed(() => {
  const scores = applications.value.map((application) => application.sessionConfidence).filter((score): score is number => typeof score === 'number')
  if (!scores.length) return '—'
  return `${Math.round((scores.reduce((sum, score) => sum + score, 0) / scores.length) * 100)}%`
})

const filteredApplications = computed(() => {
  const term = search.value.trim().toLowerCase()
  return applications.value
    .filter((application) => {
      const matchesStatus = statusFilter.value === 'all' || application.status === statusFilter.value
      const matchesRecommendation = recommendationFilter.value === 'all' || application.recommendation === recommendationFilter.value
      const searchable = [
        application.candidateName,
        application.coverLetter,
        ...Object.values(application.candidateContacts ?? {}),
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
      const matchesSearch = term.length === 0 || searchable.includes(term)
      return matchesStatus && matchesRecommendation && matchesSearch
    })
    .sort((left, right) => {
      if (sortBy.value === 'scoreDesc') return scoreValue(right) - scoreValue(left)
      if (sortBy.value === 'scoreAsc') return scoreValue(left) - scoreValue(right)
      if (sortBy.value === 'completedLatest') return dateValue(right.completedAt) - dateValue(left.completedAt)
      return dateValue(right.createdAt) - dateValue(left.createdAt)
    })
})

function scoreValue(application: VacancyApplicationSummary) {
  return typeof application.sessionConfidence === 'number' ? application.sessionConfidence : -1
}

function dateValue(value?: string | null) {
  return value ? new Date(value).getTime() : 0
}

function candidateLabel(application: VacancyApplicationSummary) {
  return application.candidateName || application.candidateContacts?.email || t('applications.candidate')
}

function applicationStatusLabel(status: string) {
  return t(`applications.status.${status}` as any)
}

function scorePercent(score: number | null | undefined) {
  if (typeof score !== 'number') return t('results.notEvaluated')
  return `${Math.round(score * 100)}%`
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

function applicationRoute(application: VacancyApplicationSummary) {
  if (application.status === 'INTERVIEW_COMPLETED') {
    return `/business/vacancies/${vacancyId}/applications/${application.applicationId}/report`
  }
  return null
}

async function exportApplicationsCsv() {
  isExporting.value = true
  exportError.value = ''
  try {
    await downloadAuthenticatedFile(`${organizationApiBaseUrl}/vacancies/${encodeURIComponent(vacancyId)}/applications/export`, `vacancy-applications-${vacancyId}.csv`)
  } catch (err) {
    exportError.value = err instanceof Error ? err.message : t('common.downloadFailed')
  } finally {
    isExporting.value = false
  }
}

function contactLinks(application: VacancyApplicationSummary) {
  return contactLinkItems(application.candidateContacts)
}

function contactLinkItems(contacts: CandidateContacts): ContactLinkItem[] {
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

function formatDate(value: string) {
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value))
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
</script>
