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
                <div>
                  <p class="text-sm font-medium text-muted-foreground">{{ t('common.stack') }}</p>
                  <div class="mt-2 flex flex-wrap gap-2">
                    <span v-for="item in vacancy.technologyKeys" :key="item" class="rounded-full border border-border px-3 py-1 text-xs font-semibold">{{ item }}</span>
                  </div>
                </div>
              </div>
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
              <h2 class="text-xl font-bold text-foreground">{{ t('vacancyDetailVacancy.applications') }}</h2>
              <p class="mt-4 rounded-[1.5rem] bg-muted/50 p-5 text-sm text-muted-foreground">{{ t('businessWorkspace.pipelinePlaceholder') }}</p>
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
import { defineComponent, h, onMounted, ref } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { ArrowLeft } from 'lucide-vue-next'
import AppFooter from '@/components/AppFooter.vue'
import AppHeader from '@/components/AppHeader.vue'
import BaseButton from '@/components/BaseButton.vue'
import BaseCard from '@/components/BaseCard.vue'
import { closeVacancy, draftVacancy, getVacancy, publishVacancy } from '@/api/organization'
import { useI18n } from '@/i18n'
import type { VacancyResponse } from '@/types/api'
import { employmentTypeLabel, vacancyLevelLabel, vacancyStatusLabel, workFormatLabel } from '@/utils/vacancy-labels'

const route = useRoute()
const { t } = useI18n()
const vacancy = ref<VacancyResponse | null>(null)
const isLoading = ref(true)
const isUpdating = ref(false)

async function loadVacancy() {
  isLoading.value = true
  try {
    vacancy.value = await getVacancy(String(route.params.vacancyId ?? ''))
  } finally {
    isLoading.value = false
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
