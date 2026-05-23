<template>
  <div class="flex min-h-screen flex-col bg-background">
    <AppHeader />

    <main class="flex-1 px-4 py-10 sm:px-6 lg:px-8">
      <div class="mx-auto max-w-6xl">
        <RouterLink to="/vacancies" class="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft class="h-4 w-4" />
          {{ t('common.back') }}
        </RouterLink>

        <BaseCard v-if="isLoading" class="mt-6 p-8 text-center text-muted-foreground">
          {{ t('publicVacancies.loadingDetail') }}
        </BaseCard>

        <BaseCard v-else-if="error" class="mt-6 p-8 text-center text-destructive">
          {{ error }}
        </BaseCard>

        <section v-else-if="vacancy" class="mt-6 grid gap-6 lg:grid-cols-[1fr_0.42fr]">
          <BaseCard class="p-8">
            <p class="text-sm font-semibold text-primary">{{ vacancy.organizationName }} · {{ vacancy.location || t('vacancies.noLocation') }}</p>
            <h1 class="mt-3 font-serif text-4xl font-bold text-foreground">{{ vacancy.title }}</h1>
            <p class="mt-4 text-lg leading-relaxed text-muted-foreground">{{ vacancy.description }}</p>

            <div class="mt-6 grid gap-3 sm:grid-cols-3">
              <div class="rounded-[1.5rem] bg-muted/50 p-4">
                <p class="text-xs text-muted-foreground">{{ t('common.level') }}</p>
                <p class="mt-1 font-bold text-foreground">{{ vacancyLevelLabel(vacancy.level, t) }}</p>
              </div>
              <div class="rounded-[1.5rem] bg-muted/50 p-4">
                <p class="text-xs text-muted-foreground">{{ t('vacancies.type') }}</p>
                <p class="mt-1 font-bold text-foreground">{{ employmentTypeLabel(vacancy.employmentType, t) }}</p>
              </div>
              <div class="rounded-[1.5rem] bg-muted/50 p-4">
                <p class="text-xs text-muted-foreground">{{ t('vacancyBuilder.workFormat') }}</p>
                <p class="mt-1 font-bold text-foreground">{{ workFormatLabel(vacancy.workFormat, t) }}</p>
              </div>
            </div>
          </BaseCard>

          <BaseCard class="p-8">
            <h2 class="text-xl font-bold text-foreground">{{ t('vacancyDetail.applyTitle') }}</h2>
            <p class="mt-3 text-sm leading-relaxed text-muted-foreground">{{ t('vacancyDetail.applyUnavailable') }}</p>
            <RouterLink :to="`/vacancies/${vacancy.id}/apply`" class="mt-6 inline-flex">
              <BaseButton size="lg">{{ t('vacancyDetail.startApply') }}</BaseButton>
            </RouterLink>
          </BaseCard>
        </section>

        <section v-if="vacancy" class="mt-6 grid gap-6 lg:grid-cols-3">
          <BaseCard class="p-6 lg:col-span-2">
            <h2 class="text-xl font-bold text-foreground">{{ t('vacancyDetail.requirements') }}</h2>
            <div class="mt-5 space-y-5">
              <div>
                <p class="text-sm font-medium text-muted-foreground">{{ t('common.stack') }}</p>
                <div class="mt-2 flex flex-wrap gap-2">
                  <span v-for="item in vacancy.technologyKeys" :key="item" class="rounded-full border border-border px-3 py-1 text-xs font-semibold">{{ item }}</span>
                </div>
              </div>
              <div>
                <p class="text-sm font-medium text-muted-foreground">{{ t('vacancyDetail.requirements') }}</p>
                <p class="mt-2 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">{{ vacancy.requirements || t('vacancyDetail.noRequirements') }}</p>
              </div>
            </div>
          </BaseCard>

          <BaseCard class="p-6">
            <h2 class="text-xl font-bold text-foreground">{{ t('vacancyDetail.questions') }}</h2>
            <p class="mt-4 text-sm leading-relaxed text-muted-foreground">{{ t('vacancyDetail.publicQuestions') }}</p>
          </BaseCard>
        </section>

        <BaseCard v-if="!isLoading && !error && !vacancy" class="mt-6 p-8 text-center">
          <h1 class="text-2xl font-bold text-foreground">{{ t('vacancyDetail.notFound') }}</h1>
          <RouterLink to="/vacancies" class="mt-6 inline-block">
            <BaseButton>{{ t('common.back') }}</BaseButton>
          </RouterLink>
        </BaseCard>
      </div>
    </main>

    <AppFooter />
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { ArrowLeft } from 'lucide-vue-next'
import AppFooter from '@/components/AppFooter.vue'
import AppHeader from '@/components/AppHeader.vue'
import BaseButton from '@/components/BaseButton.vue'
import BaseCard from '@/components/BaseCard.vue'
import { getPublicVacancy } from '@/api/organization'
import { useI18n } from '@/i18n'
import type { VacancyResponse } from '@/types/api'
import { employmentTypeLabel, vacancyLevelLabel, workFormatLabel } from '@/utils/vacancy-labels'

const route = useRoute()
const { t } = useI18n()
const vacancy = ref<VacancyResponse | null>(null)
const isLoading = ref(true)
const error = ref('')

onMounted(async () => {
  try {
    vacancy.value = await getPublicVacancy(String(route.params.vacancyId ?? ''))
  } catch (err: any) {
    if (err?.status === 404) {
      vacancy.value = null
      return
    }

    error.value = err instanceof Error ? err.message : t('publicVacancies.loadDetailFailed')
  } finally {
    isLoading.value = false
  }
})
</script>
