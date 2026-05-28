<template>
  <div class="flex min-h-screen flex-col bg-background">
    <AppHeader />

    <main class="flex-1 px-4 py-10 sm:px-6 lg:px-8">
      <div class="mx-auto max-w-6xl">
        <RouterLink to="/business/vacancies" class="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft class="h-4 w-4" />
          {{ t('vacancyBuilder.backToVacancies') }}
        </RouterLink>

        <BaseCard v-if="isLoading" class="mt-6 p-8 text-center text-muted-foreground">{{ t('businessWorkspace.loading') }}</BaseCard>
        <BaseCard v-else-if="!organization" class="mt-6 p-8 text-center text-muted-foreground">{{ t('businessWorkspace.createOrgTitle') }}</BaseCard>

        <div v-else class="mt-6">
          <BaseCard class="p-8">
            <h1 class="font-serif text-4xl font-bold text-foreground">{{ t('vacancyBuilder.title') }}</h1>
            <p class="mt-3 text-muted-foreground">{{ t('vacancyBuilder.description') }}</p>

            <form class="mt-8 space-y-6" @submit.prevent="submitVacancy">
              <label class="space-y-2 block">
                <span class="block text-sm font-semibold text-foreground">{{ t('vacancyBuilder.roleTitle') }}</span>
                <input v-model="form.title" class="h-12 w-full rounded-full border border-border bg-input px-4 outline-none focus:border-primary" />
              </label>

              <label class="space-y-2 block">
                <span class="block text-sm font-semibold text-foreground">{{ t('vacancyDetailVacancy.description') }}</span>
                <textarea v-model="form.description" rows="4" class="w-full rounded-[1.5rem] border border-border bg-input px-4 py-3 outline-none focus:border-primary" />
              </label>

              <label class="space-y-2 block">
                <span class="block text-sm font-semibold text-foreground">{{ t('vacancyBuilder.requiredSkills') }}</span>
                <textarea v-model="form.requirements" rows="3" class="w-full rounded-[1.5rem] border border-border bg-input px-4 py-3 outline-none focus:border-primary" />
              </label>

              <div class="grid gap-5 sm:grid-cols-2">
                <label class="space-y-2">
                  <span class="block text-sm font-semibold text-foreground">{{ t('vacancyBuilder.location') }}</span>
                  <input v-model="form.location" class="h-12 w-full rounded-full border border-border bg-input px-4 outline-none focus:border-primary" />
                </label>
                <label class="space-y-2">
                  <span class="block text-sm font-semibold text-foreground">{{ t('vacancyBuilder.level') }}</span>
                  <select v-model="form.level" class="h-12 w-full rounded-full border border-border bg-input px-4 outline-none focus:border-primary">
                    <option value="JUNIOR">{{ vacancyLevelLabel('JUNIOR', t) }}</option>
                    <option value="MIDDLE">{{ vacancyLevelLabel('MIDDLE', t) }}</option>
                    <option value="SENIOR">{{ vacancyLevelLabel('SENIOR', t) }}</option>
                  </select>
                </label>
              </div>

              <div class="grid gap-5 sm:grid-cols-2">
                <label class="space-y-2">
                  <span class="block text-sm font-semibold text-foreground">{{ t('vacancyBuilder.employmentType') }}</span>
                  <select v-model="form.employmentType" class="h-12 w-full rounded-full border border-border bg-input px-4 outline-none focus:border-primary">
                    <option value="FULL_TIME">{{ employmentTypeLabel('FULL_TIME', t) }}</option>
                    <option value="PART_TIME">{{ employmentTypeLabel('PART_TIME', t) }}</option>
                    <option value="CONTRACT">{{ employmentTypeLabel('CONTRACT', t) }}</option>
                    <option value="INTERNSHIP">{{ employmentTypeLabel('INTERNSHIP', t) }}</option>
                  </select>
                </label>
                <label class="space-y-2">
                  <span class="block text-sm font-semibold text-foreground">{{ t('vacancyBuilder.workFormat') }}</span>
                  <select v-model="form.workFormat" class="h-12 w-full rounded-full border border-border bg-input px-4 outline-none focus:border-primary">
                    <option value="REMOTE">{{ workFormatLabel('REMOTE', t) }}</option>
                    <option value="HYBRID">{{ workFormatLabel('HYBRID', t) }}</option>
                    <option value="ONSITE">{{ workFormatLabel('ONSITE', t) }}</option>
                  </select>
                </label>
              </div>

              <label class="space-y-2 block">
                <span class="block text-sm font-semibold text-foreground">{{ t('vacancyBuilder.stack') }}</span>
                <div class="space-y-4">
                  <div v-for="group in technologyGroups" :key="group.groupKey">
                    <p class="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">{{ group.groupName }}</p>
                    <div class="grid grid-cols-3 gap-2 sm:grid-cols-4">
                      <button
                        v-for="tech in group.items"
                        :key="tech.key"
                        type="button"
                        class="rounded-full border px-3 py-2 text-xs font-semibold transition"
                        :class="form.technologyKeys.includes(tech.key) ? 'border-primary/30 bg-primary/10 text-primary' : 'border-border bg-muted/40 text-muted-foreground hover:border-primary/30'"
                        @click="toggleTechnology(tech.key)"
                      >
                        {{ tech.displayName }}
                      </button>
                    </div>
                  </div>
                </div>
                <p v-if="technologiesError" class="mt-2 text-xs text-warning">{{ technologiesError }}</p>
              </label>

              <div class="rounded-[1.5rem] border border-border/60 p-5">
                <h2 class="text-lg font-bold text-foreground">{{ t('vacancyInterviewSettings.title') }}</h2>
                <div class="mt-4 grid gap-4 sm:grid-cols-3">
                  <label class="space-y-2">
                    <span class="block text-sm font-semibold text-foreground">{{ t('vacancyInterviewSettings.minPrimaryQuestions') }}</span>
                    <input v-model.number="form.minPrimaryQuestions" min="1" max="30" type="number" class="h-12 w-full rounded-full border border-border bg-input px-4 outline-none focus:border-primary" />
                  </label>
                  <label class="space-y-2">
                    <span class="block text-sm font-semibold text-foreground">{{ t('vacancyInterviewSettings.maxPrimaryQuestions') }}</span>
                    <input v-model.number="form.maxPrimaryQuestions" min="1" max="30" type="number" class="h-12 w-full rounded-full border border-border bg-input px-4 outline-none focus:border-primary" />
                  </label>
                  <label class="space-y-2">
                    <span class="block text-sm font-semibold text-foreground">{{ t('vacancyInterviewSettings.maxFollowUpsPerPrimary') }}</span>
                    <input v-model.number="form.maxFollowUpsPerPrimary" min="0" max="2" type="number" class="h-12 w-full rounded-full border border-border bg-input px-4 outline-none focus:border-primary" />
                  </label>
                </div>
              </div>

              <p v-if="apiError" class="rounded-[1.5rem] bg-destructive/10 p-4 text-sm text-destructive">{{ apiError }}</p>

              <div v-if="validationErrors.length" class="rounded-[1.5rem] border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">
                <p v-for="error in validationErrors" :key="error">{{ error }}</p>
              </div>

              <BaseButton tag="button" :disabled="isCreating">
                {{ isCreating ? t('common.saving') : t('common.saveDraft') }}
              </BaseButton>
            </form>
          </BaseCard>

        </div>
      </div>
    </main>

    <AppFooter />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { ArrowLeft } from 'lucide-vue-next'
import AppFooter from '@/components/AppFooter.vue'
import AppHeader from '@/components/AppHeader.vue'
import BaseButton from '@/components/BaseButton.vue'
import BaseCard from '@/components/BaseCard.vue'
import { getGroupedTechnologies } from '@/api/interview'
import { createVacancy, getMyOrganizations } from '@/api/organization'
import { useI18n } from '@/i18n'
import type { EmploymentType, OrganizationResponse, TechnologyGroupResponse, VacancyLevel, WorkFormat } from '@/types/api'
import { FALLBACK_TECHNOLOGY_GROUPS } from '@/utils/technologies'
import { employmentTypeLabel, vacancyLevelLabel, workFormatLabel } from '@/utils/vacancy-labels'

const router = useRouter()
const { t } = useI18n()
const organizations = ref<OrganizationResponse[]>([])
const isLoading = ref(true)
const isCreating = ref(false)
const apiError = ref('')
const technologyGroups = ref<TechnologyGroupResponse[]>(FALLBACK_TECHNOLOGY_GROUPS)
const technologiesError = ref('')
const validationErrors = ref<string[]>([])
const organization = computed(() => organizations.value[0] ?? null)

const form = reactive({
  title: '',
  description: '',
  requirements: '',
  location: '',
  employmentType: 'FULL_TIME' as EmploymentType,
  workFormat: 'REMOTE' as WorkFormat,
  level: 'MIDDLE' as VacancyLevel,
  technologyKeys: [] as string[],
  minPrimaryQuestions: 5,
  maxPrimaryQuestions: 8,
  maxFollowUpsPerPrimary: 1,
})

function toggleTechnology(tech: string) {
  const idx = form.technologyKeys.indexOf(tech)
  if (idx === -1) form.technologyKeys.push(tech)
  else form.technologyKeys.splice(idx, 1)
  validationErrors.value = validationErrors.value.filter((error) => error !== t('validation.selectTechnology'))
}

function validateVacancyForm() {
  const errors: string[] = []
  if (!form.title.trim()) {
    errors.push(t('validation.vacancyTitleRequired'))
  }
  if (!form.description.trim()) {
    errors.push(t('validation.vacancyDescriptionRequired'))
  }
  if (form.technologyKeys.length === 0) {
    errors.push(t('validation.selectTechnology'))
  }
  if (!Number.isFinite(form.minPrimaryQuestions) || form.minPrimaryQuestions < 1 || form.minPrimaryQuestions > 30) {
    errors.push(t('validation.minPrimaryQuestionsRange'))
  }
  if (!Number.isFinite(form.maxPrimaryQuestions) || form.maxPrimaryQuestions < 1 || form.maxPrimaryQuestions > 30) {
    errors.push(t('validation.maxPrimaryQuestionsRange'))
  }
  if (Number.isFinite(form.minPrimaryQuestions) && Number.isFinite(form.maxPrimaryQuestions) && form.maxPrimaryQuestions < form.minPrimaryQuestions) {
    errors.push(t('validation.maxPrimaryQuestionsLessThanMin'))
  }
  if (!Number.isFinite(form.maxFollowUpsPerPrimary) || form.maxFollowUpsPerPrimary < 0 || form.maxFollowUpsPerPrimary > 2) {
    errors.push(t('validation.followUpsRange'))
  }
  validationErrors.value = errors
  return errors.length === 0
}

async function submitVacancy() {
  if (!organization.value) return
  if (!validateVacancyForm()) return
  isCreating.value = true
  apiError.value = ''
  try {
    const created = await createVacancy(organization.value.id, {
      title: form.title.trim(),
      description: form.description.trim(),
      requirements: form.requirements.trim() || null,
      location: form.location.trim() || null,
      employmentType: form.employmentType,
      workFormat: form.workFormat,
      level: form.level,
      technologyKeys: form.technologyKeys,
      minPrimaryQuestions: form.minPrimaryQuestions,
      maxPrimaryQuestions: form.maxPrimaryQuestions,
      maxFollowUpsPerPrimary: form.maxFollowUpsPerPrimary,
    })
    await router.push(`/business/vacancies/${created.id}`)
  } catch (err) {
    apiError.value = err instanceof Error ? err.message : t('vacancyBuilder.createFailed')
  } finally {
    isCreating.value = false
  }
}

onMounted(async () => {
  try {
    const [organizationsResponse, technologiesResponse] = await Promise.allSettled([getMyOrganizations(), getGroupedTechnologies()])
    if (organizationsResponse.status === 'fulfilled') {
      organizations.value = organizationsResponse.value
    }
    if (technologiesResponse.status === 'fulfilled' && technologiesResponse.value.length) {
      technologyGroups.value = technologiesResponse.value
    } else {
      technologyGroups.value = FALLBACK_TECHNOLOGY_GROUPS
      technologiesError.value = t('technologies.loadFailed')
    }
  } finally {
    isLoading.value = false
  }
})
</script>
