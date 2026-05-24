<template>
  <div v-if="vacancy" class="flex min-h-screen flex-col bg-background">
    <AppHeader />

    <main class="flex-1 px-4 py-8 sm:px-6 lg:px-8">
      <div class="mx-auto max-w-5xl">
        <div class="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <RouterLink to="/business/vacancies" class="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
              <ArrowLeft class="h-4 w-4" />
              {{ t('vacancyDetailVacancy.backToVacancies') }}
            </RouterLink>
            <h1 class="mt-3 text-3xl font-bold text-foreground">{{ vacancy.title }}</h1>
            <p class="mt-1 text-muted-foreground">{{ vacancy.organizationName }} · {{ vacancyLevelLabel(vacancy.level, t) }} · {{ vacancyStatusLabel(vacancy.status, t) }}</p>
          </div>
          <div class="flex gap-3">
            <BaseButton v-if="vacancy.status === 'DRAFT' || vacancy.status === 'CLOSED'" :disabled="isUpdating" @click="changeStatus('publish')">{{ t('vacancyDetailVacancy.publish') }}</BaseButton>
            <BaseButton v-if="vacancy.status === 'PUBLISHED'" variant="outline" :disabled="isUpdating" @click="changeStatus('draft')">{{ t('vacancyDetailVacancy.moveToDraft') }}</BaseButton>
            <BaseButton v-if="vacancy.status === 'PUBLISHED'" variant="outline" :disabled="isUpdating" @click="changeStatus('close')">{{ t('vacancyDetailVacancy.close') }}</BaseButton>
          </div>
        </div>

        <div class="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
          <div class="space-y-6">
            <BaseCard class="p-8">
              <h2 class="text-xl font-bold text-foreground">{{ t('vacancyDetailVacancy.interviewConfig') }}</h2>
              <div class="mt-5 space-y-5">
                <InfoItem :label="t('vacancyBuilder.level')" :value="vacancyLevelLabel(vacancy.level, t)" />
                <InfoItem :label="t('vacancyBuilder.employmentType')" :value="employmentTypeLabel(vacancy.employmentType, t)" />
                <InfoItem :label="t('vacancyBuilder.workFormat')" :value="workFormatLabel(vacancy.workFormat, t)" />
                <InfoItem :label="t('vacancyBuilder.location')" :value="vacancy.location || '—'" />
                <InfoItem :label="t('vacancyInterviewSettings.minPrimaryQuestions')" :value="String(vacancy.minPrimaryQuestions)" />
                <InfoItem :label="t('vacancyInterviewSettings.maxPrimaryQuestions')" :value="String(vacancy.maxPrimaryQuestions)" />
                <InfoItem :label="t('vacancyInterviewSettings.maxFollowUpsPerPrimary')" :value="String(vacancy.maxFollowUpsPerPrimary)" />
                <InfoItem :label="t('vacancyInterviewSettings.estimatedMaxTotalQuestions')" :value="String(vacancy.estimatedMaxTotalQuestions)" />
                <div>
                  <p class="text-sm font-medium text-muted-foreground">{{ t('common.stack') }}</p>
                  <div class="mt-2 flex flex-wrap gap-2">
                    <span v-for="item in vacancy.technologyKeys" :key="item" class="rounded-full border border-border px-3 py-1 text-xs font-semibold">{{ item }}</span>
                  </div>
                </div>
              </div>
              <form class="mt-6 space-y-4 rounded-[1.5rem] border border-border/60 p-5" @submit.prevent="submitInterviewSettings">
                <h3 class="font-semibold text-foreground">{{ t('vacancyInterviewSettings.editTitle') }}</h3>
                <div class="grid gap-4">
                  <label class="space-y-2">
                    <span class="block text-sm font-semibold text-foreground">{{ t('vacancyInterviewSettings.minPrimaryQuestions') }}</span>
                    <input v-model.number="settingsForm.minPrimaryQuestions" min="1" max="30" type="number" class="h-11 w-full rounded-full border border-border bg-input px-4 text-sm outline-none focus:border-primary" />
                  </label>
                  <label class="space-y-2">
                    <span class="block text-sm font-semibold text-foreground">{{ t('vacancyInterviewSettings.maxPrimaryQuestions') }}</span>
                    <input v-model.number="settingsForm.maxPrimaryQuestions" min="1" max="30" type="number" class="h-11 w-full rounded-full border border-border bg-input px-4 text-sm outline-none focus:border-primary" />
                  </label>
                  <label class="space-y-2">
                    <span class="block text-sm font-semibold text-foreground">{{ t('vacancyInterviewSettings.maxFollowUpsPerPrimary') }}</span>
                    <input v-model.number="settingsForm.maxFollowUpsPerPrimary" min="0" max="2" type="number" class="h-11 w-full rounded-full border border-border bg-input px-4 text-sm outline-none focus:border-primary" />
                  </label>
                </div>
                <p v-if="settingsMessage" class="text-sm text-muted-foreground">{{ settingsMessage }}</p>
                <p v-if="settingsError" class="text-sm text-destructive">{{ settingsError }}</p>
                <BaseButton tag="button" size="sm" :disabled="isSavingSettings">{{ isSavingSettings ? t('common.saving') : t('vacancyInterviewSettings.save') }}</BaseButton>
              </form>
            </BaseCard>
          </div>

          <div class="space-y-6">
            <BaseCard class="p-8">
              <h2 class="text-xl font-bold text-foreground">{{ t('vacancyDetailVacancy.description') }}</h2>
              <p class="mt-4 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">{{ vacancy.description }}</p>
            </BaseCard>
            <BaseCard class="p-8">
              <h2 class="text-xl font-bold text-foreground">{{ t('vacancyDetailVacancy.requiredSkills') }}</h2>
              <p class="mt-4 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">{{ vacancy.requirements || t('vacancyDetailVacancy.noRequirements') }}</p>
            </BaseCard>
            <BaseCard class="p-8">
              <div class="flex items-center justify-between gap-4">
                <h2 class="text-xl font-bold text-foreground">{{ t('vacancyQuestions.title') }}</h2>
                <BaseButton size="sm" variant="outline" @click="resetQuestionForm">{{ t('vacancyQuestions.new') }}</BaseButton>
              </div>

              <form class="mt-5 space-y-4 rounded-[1.5rem] border border-border/60 p-5" @submit.prevent="submitQuestion">
                <label class="block space-y-2">
                  <span class="text-sm font-semibold text-foreground">{{ t('vacancyQuestions.questionText') }}</span>
                  <textarea v-model="questionForm.questionText" required rows="3" class="w-full rounded-[1.25rem] border border-border bg-input px-4 py-3 text-sm outline-none focus:border-primary"></textarea>
                </label>
                <label class="block space-y-2">
                  <span class="text-sm font-semibold text-foreground">{{ t('vacancyQuestions.expectedAnswer') }}</span>
                  <textarea v-model="questionForm.expectedAnswer" rows="2" class="w-full rounded-[1.25rem] border border-border bg-input px-4 py-3 text-sm outline-none focus:border-primary"></textarea>
                </label>
                <label class="block space-y-2">
                  <span class="text-sm font-semibold text-foreground">{{ t('vacancyQuestions.evaluationRubric') }}</span>
                  <textarea v-model="questionForm.evaluationRubric" rows="2" class="w-full rounded-[1.25rem] border border-border bg-input px-4 py-3 text-sm outline-none focus:border-primary"></textarea>
                </label>
                <div class="grid gap-4 sm:grid-cols-[1fr_0.6fr]">
                  <label class="block space-y-2">
                    <span class="text-sm font-semibold text-foreground">{{ t('vacancyQuestions.topic') }}</span>
                    <input v-model="questionForm.topic" class="h-11 w-full rounded-full border border-border bg-input px-4 text-sm outline-none focus:border-primary" placeholder="spring" />
                  </label>
                  <label class="block space-y-2">
                    <span class="text-sm font-semibold text-foreground">{{ t('vacancyQuestions.displayOrder') }}</span>
                    <input v-model.number="questionForm.displayOrder" min="1" type="number" class="h-11 w-full rounded-full border border-border bg-input px-4 text-sm outline-none focus:border-primary" />
                  </label>
                </div>
                <label class="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <input v-model="questionForm.required" type="checkbox" class="h-4 w-4 rounded border-border" />
                  {{ t('vacancyQuestions.required') }}
                </label>
                <p v-if="questionError" class="text-sm text-destructive">{{ questionError }}</p>
                <div class="flex flex-wrap gap-3">
                  <BaseButton tag="button" size="sm" :disabled="isSavingQuestion">{{ editingQuestionId ? t('vacancyQuestions.save') : t('vacancyQuestions.add') }}</BaseButton>
                  <BaseButton v-if="editingQuestionId" tag="button" type="button" size="sm" variant="outline" @click="resetQuestionForm">{{ t('vacancyQuestions.cancel') }}</BaseButton>
                </div>
              </form>

              <div v-if="isLoadingQuestions" class="mt-5 rounded-[1.5rem] bg-muted/50 p-5 text-sm text-muted-foreground">{{ t('vacancyQuestions.loading') }}</div>
              <div v-else-if="questions.length === 0" class="mt-5 rounded-[1.5rem] bg-muted/50 p-5 text-sm text-muted-foreground">{{ t('vacancyQuestions.empty') }}</div>
              <div v-else class="mt-5 space-y-4">
                <div v-for="question in questions" :key="question.id" class="rounded-[1.5rem] border border-border/60 p-5">
                  <div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <div class="flex flex-wrap gap-2 text-xs font-semibold text-muted-foreground">
                        <span class="rounded-full bg-muted px-3 py-1">#{{ question.displayOrder }}</span>
                        <span v-if="question.topic" class="rounded-full bg-muted px-3 py-1">{{ question.topic }}</span>
                        <span v-if="question.required" class="rounded-full bg-primary/10 px-3 py-1 text-primary">{{ t('vacancyQuestions.required') }}</span>
                      </div>
                      <p class="mt-3 font-semibold text-foreground">{{ question.questionText }}</p>
                      <p v-if="question.expectedAnswer" class="mt-2 text-sm text-muted-foreground">{{ question.expectedAnswer }}</p>
                    </div>
                    <div class="flex gap-2">
                      <BaseButton size="sm" variant="ghost" @click="editQuestion(question)">{{ t('vacancyQuestions.edit') }}</BaseButton>
                      <BaseButton size="sm" variant="ghost" @click="removeQuestion(question.id)">{{ t('vacancyQuestions.delete') }}</BaseButton>
                    </div>
                  </div>
                </div>
              </div>
            </BaseCard>
            <BaseCard class="p-8">
              <div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h2 class="text-xl font-bold text-foreground">{{ t('vacancyDetailVacancy.applications') }}</h2>
                  <p class="mt-2 text-sm text-muted-foreground">{{ t('applications.summaryDesc') }}</p>
                </div>
                <RouterLink :to="`/business/vacancies/${vacancy.id}/applications`">
                  <BaseButton size="sm" variant="outline">{{ t('applications.viewAll') }}</BaseButton>
                </RouterLink>
              </div>
              <div v-if="isLoadingApplications" class="mt-4 rounded-[1.5rem] bg-muted/50 p-5 text-sm text-muted-foreground">{{ t('applications.loading') }}</div>
              <div v-else-if="applications.length === 0" class="mt-4 rounded-[1.5rem] bg-muted/50 p-5 text-sm text-muted-foreground">{{ t('applications.empty') }}</div>
              <div v-else class="mt-5 grid gap-3 sm:grid-cols-4">
                <div class="rounded-[1.5rem] bg-muted/40 p-4 text-center">
                  <p class="text-2xl font-bold text-foreground">{{ applications.length }}</p>
                  <p class="mt-1 text-xs text-muted-foreground">{{ t('applications.total') }}</p>
                </div>
                <div class="rounded-[1.5rem] bg-muted/40 p-4 text-center">
                  <p class="text-2xl font-bold text-success">{{ completedApplicationsCount }}</p>
                  <p class="mt-1 text-xs text-muted-foreground">{{ t('applications.completed') }}</p>
                </div>
                <div class="rounded-[1.5rem] bg-muted/40 p-4 text-center">
                  <p class="text-2xl font-bold text-primary">{{ inProgressApplicationsCount }}</p>
                  <p class="mt-1 text-xs text-muted-foreground">{{ t('applications.inProgress') }}</p>
                </div>
                <div class="rounded-[1.5rem] bg-muted/40 p-4 text-center">
                  <p class="text-2xl font-bold text-primary">{{ applicationsAverageScore }}</p>
                  <p class="mt-1 text-xs text-muted-foreground">{{ t('applications.avgScore') }}</p>
                </div>
              </div>
            </BaseCard>
          </div>
        </div>
      </div>
    </main>

    <AppFooter />
  </div>

  <div v-else class="flex min-h-screen items-center justify-center px-4 text-center">
    <BaseCard class="max-w-md p-8">
      <h1 class="text-2xl font-bold text-foreground">{{ isLoading ? t('businessWorkspace.loading') : t('vacancyDetailVacancy.notFound') }}</h1>
      <RouterLink to="/business/vacancies" class="mt-6 inline-block">
        <BaseButton>{{ t('vacancyDetailVacancy.backToVacanciesBtn') }}</BaseButton>
      </RouterLink>
    </BaseCard>
  </div>
</template>

<script setup lang="ts">
import { computed, defineComponent, h, onMounted, reactive, ref } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { ArrowLeft } from 'lucide-vue-next'
import AppFooter from '@/components/AppFooter.vue'
import AppHeader from '@/components/AppHeader.vue'
import BaseButton from '@/components/BaseButton.vue'
import BaseCard from '@/components/BaseCard.vue'
import { closeVacancy, createVacancyQuestion, deleteVacancyQuestion, draftVacancy, getVacancy, getVacancyApplications, getVacancyQuestions, publishVacancy, updateVacancy, updateVacancyQuestion } from '@/api/organization'
import { useI18n } from '@/i18n'
import type { VacancyApplicationSummary, VacancyQuestionResponse, VacancyResponse } from '@/types/api'
import { employmentTypeLabel, vacancyLevelLabel, vacancyStatusLabel, workFormatLabel } from '@/utils/vacancy-labels'

const route = useRoute()
const { t } = useI18n()
const vacancy = ref<VacancyResponse | null>(null)
const questions = ref<VacancyQuestionResponse[]>([])
const applications = ref<VacancyApplicationSummary[]>([])
const isLoading = ref(true)
const isUpdating = ref(false)
const isLoadingQuestions = ref(false)
const isLoadingApplications = ref(false)
const isSavingQuestion = ref(false)
const isSavingSettings = ref(false)
const questionError = ref('')
const settingsError = ref('')
const settingsMessage = ref('')
const editingQuestionId = ref('')
const questionForm = reactive({ questionText: '', expectedAnswer: '', evaluationRubric: '', topic: '', required: true, displayOrder: 1 })
const settingsForm = reactive({ minPrimaryQuestions: 5, maxPrimaryQuestions: 8, maxFollowUpsPerPrimary: 1 })
const completedApplicationsCount = computed(() => applications.value.filter((application) => application.status === 'INTERVIEW_COMPLETED').length)
const inProgressApplicationsCount = computed(() => applications.value.filter((application) => application.status === 'INTERVIEW_CREATED' || application.status === 'INTERVIEW_IN_PROGRESS').length)
const applicationsAverageScore = computed(() => {
  const scores = applications.value.map((application) => application.sessionConfidence).filter((score): score is number => typeof score === 'number')
  if (!scores.length) return '—'
  return `${Math.round((scores.reduce((sum, score) => sum + score, 0) / scores.length) * 100)}%`
})

async function loadVacancy() {
  isLoading.value = true
  try {
    vacancy.value = await getVacancy(String(route.params.vacancyId ?? ''))
    syncSettingsForm()
    await Promise.all([loadQuestions(), loadApplications()])
  } finally {
    isLoading.value = false
  }
}

function syncSettingsForm() {
  if (!vacancy.value) return
  settingsForm.minPrimaryQuestions = vacancy.value.minPrimaryQuestions
  settingsForm.maxPrimaryQuestions = vacancy.value.maxPrimaryQuestions
  settingsForm.maxFollowUpsPerPrimary = vacancy.value.maxFollowUpsPerPrimary
}

async function loadQuestions() {
  if (!route.params.vacancyId) return
  isLoadingQuestions.value = true
  try {
    questions.value = await getVacancyQuestions(String(route.params.vacancyId))
  } finally {
    isLoadingQuestions.value = false
  }
}

async function loadApplications() {
  if (!route.params.vacancyId) return
  isLoadingApplications.value = true
  try {
    applications.value = await getVacancyApplications(String(route.params.vacancyId))
  } finally {
    isLoadingApplications.value = false
  }
}

async function changeStatus(action: 'draft' | 'publish' | 'close') {
  if (!vacancy.value) return
  isUpdating.value = true
  try {
    if (action === 'draft') {
      vacancy.value = await draftVacancy(vacancy.value.id)
    } else if (action === 'publish') {
      vacancy.value = await publishVacancy(vacancy.value.id)
    } else {
      vacancy.value = await closeVacancy(vacancy.value.id)
    }
  } finally {
    isUpdating.value = false
  }
}

async function submitInterviewSettings() {
  if (!vacancy.value) return
  isSavingSettings.value = true
  settingsError.value = ''
  settingsMessage.value = ''
  try {
    vacancy.value = await updateVacancy(vacancy.value.id, {
      minPrimaryQuestions: settingsForm.minPrimaryQuestions,
      maxPrimaryQuestions: settingsForm.maxPrimaryQuestions,
      maxFollowUpsPerPrimary: settingsForm.maxFollowUpsPerPrimary,
    })
    syncSettingsForm()
    settingsMessage.value = t('vacancyInterviewSettings.saved')
  } catch (err) {
    settingsError.value = err instanceof Error ? err.message : t('vacancyInterviewSettings.saveFailed')
  } finally {
    isSavingSettings.value = false
  }
}

function resetQuestionForm() {
  editingQuestionId.value = ''
  questionError.value = ''
  questionForm.questionText = ''
  questionForm.expectedAnswer = ''
  questionForm.evaluationRubric = ''
  questionForm.topic = ''
  questionForm.required = true
  questionForm.displayOrder = questions.value.length + 1
}

function editQuestion(question: VacancyQuestionResponse) {
  editingQuestionId.value = question.id
  questionForm.questionText = question.questionText
  questionForm.expectedAnswer = question.expectedAnswer ?? ''
  questionForm.evaluationRubric = question.evaluationRubric ?? ''
  questionForm.topic = question.topic ?? ''
  questionForm.required = question.required
  questionForm.displayOrder = question.displayOrder
}

async function submitQuestion() {
  if (!vacancy.value || !questionForm.questionText.trim()) return
  isSavingQuestion.value = true
  questionError.value = ''
  const payload = {
    questionText: questionForm.questionText.trim(),
    expectedAnswer: questionForm.expectedAnswer.trim() || null,
    evaluationRubric: questionForm.evaluationRubric.trim() || null,
    topic: questionForm.topic.trim() || null,
    required: questionForm.required,
    displayOrder: Number(questionForm.displayOrder) || 1,
  }
  try {
    if (editingQuestionId.value) {
      await updateVacancyQuestion(vacancy.value.id, editingQuestionId.value, payload)
    } else {
      await createVacancyQuestion(vacancy.value.id, payload)
    }
    await loadQuestions()
    resetQuestionForm()
  } catch (err) {
    questionError.value = err instanceof Error ? err.message : t('vacancyQuestions.saveFailed')
  } finally {
    isSavingQuestion.value = false
  }
}

async function removeQuestion(questionId: string) {
  if (!vacancy.value) return
  await deleteVacancyQuestion(vacancy.value.id, questionId)
  await loadQuestions()
  if (editingQuestionId.value === questionId) resetQuestionForm()
}

const InfoItem = defineComponent({
  name: 'InfoItem',
  props: {
    label: { type: String, required: true },
    value: { type: String, required: true },
  },
  setup(props) {
    return () => h('div', [h('p', { class: 'text-sm font-medium text-muted-foreground' }, props.label), h('p', { class: 'mt-1 font-semibold text-foreground' }, props.value)])
  },
})

onMounted(loadVacancy)
</script>
