<template>
  <div v-if="vacancy" class="flex min-h-screen flex-col bg-background">
    <AppHeader />

    <main class="flex-1 px-4 py-8 sm:px-6 lg:px-8">
      <div class="mx-auto max-w-7xl">
        <div class="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <RouterLink to="/business/vacancies" class="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
              <ArrowLeft class="h-4 w-4" />
              {{ t('vacancyDetailVacancy.backToVacancies') }}
            </RouterLink>
            <h1 class="mt-3 text-3xl font-bold text-foreground">{{ vacancy.title }}</h1>
            <p class="mt-1 text-muted-foreground">{{ vacancy.department }} · {{ vacancy.level }} · {{ vacancy.status }}</p>
          </div>
          <RouterLink to="/candidate/join">
            <BaseButton>{{ t('vacancyDetailVacancy.previewCandidate') }}</BaseButton>
          </RouterLink>
        </div>

        <div class="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
          <div class="space-y-6">
            <BaseCard class="p-8">
              <h2 class="text-xl font-bold text-foreground">{{ t('vacancyDetailVacancy.interviewConfig') }}</h2>
              <div class="mt-5 space-y-5">
                <div>
                  <p class="text-sm font-medium text-muted-foreground">{{ t('common.stack') }}</p>
                  <div class="mt-2 flex flex-wrap gap-2">
                    <span v-for="item in vacancy.stack" :key="item" class="rounded-full border border-border px-3 py-1 text-xs font-semibold">{{ item }}</span>
                  </div>
                </div>
                <div>
                  <p class="text-sm font-medium text-muted-foreground">{{ t('vacancyDetailVacancy.requiredSkills') }}</p>
                  <div class="mt-2 flex flex-wrap gap-2">
                    <span v-for="item in vacancy.requiredSkills" :key="item" class="rounded-full bg-muted px-3 py-1 text-xs font-semibold">{{ item }}</span>
                  </div>
                </div>
                <div class="rounded-[1.5rem] bg-primary/10 p-5">
                  <p class="font-semibold text-foreground">{{ t('vacancyDetailVacancy.questionSource') }}</p>
                  <p class="mt-2 text-sm text-muted-foreground">{{ questionStrategy }}</p>
                </div>
              </div>
            </BaseCard>

            <BaseCard class="p-8">
              <h2 class="text-xl font-bold text-foreground">{{ t('vacancyDetailVacancy.customQuestions') }}</h2>
              <div v-if="vacancy.customQuestions.length" class="mt-5 space-y-4">
                <div v-for="question in vacancy.customQuestions" :key="question.id" class="rounded-[1.5rem] border border-border/60 p-4">
                  <p class="font-semibold text-foreground">{{ question.title }}</p>
                  <p class="mt-2 text-xs capitalize text-muted-foreground">{{ question.category }} · {{ question.difficulty }} · {{ question.source }}</p>
                </div>
              </div>
              <p v-else class="mt-4 rounded-[1.5rem] bg-muted/50 p-5 text-sm text-muted-foreground">
                {{ t('vacancyDetailVacancy.noCustomQuestions') }}
              </p>
            </BaseCard>
          </div>

          <BaseCard class="overflow-hidden">
            <div class="border-b border-border/60 p-6">
              <h2 class="text-xl font-bold text-foreground">{{ t('vacancyDetailVacancy.applications') }}</h2>
              <p class="mt-1 text-sm text-muted-foreground">{{ t('vacancyDetailVacancy.applicationsDesc') }}</p>
            </div>
            <div class="overflow-x-auto">
              <table class="min-w-full text-left">
                <thead>
                  <tr class="border-b border-border text-sm text-muted-foreground">
                    <th class="px-6 py-4 font-medium">{{ t('th.candidate') }}</th>
                    <th class="px-6 py-4 font-medium">{{ t('th.status') }}</th>
                    <th class="px-6 py-4 font-medium">{{ t('th.score') }}</th>
                    <th class="px-6 py-4 text-right font-medium">{{ t('th.action') }}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="application in applications" :key="application.id" class="border-b border-border/60 text-sm last:border-b-0">
                    <td class="px-6 py-5 align-top">
                      <div class="font-semibold text-foreground">{{ application.candidateName }}</div>
                      <div class="text-xs text-muted-foreground">{{ application.candidateEmail }}</div>
                    </td>
                    <td class="px-6 py-5 align-top capitalize text-muted-foreground">{{ application.status }}</td>
                    <td class="px-6 py-5 align-top font-semibold text-primary">{{ application.score ?? '—' }}</td>
                    <td class="px-6 py-5 text-right align-top">
                      <RouterLink v-if="application.sessionId" :to="application.score ? `/results/${application.sessionId}` : `/candidate/interview/${application.sessionId}`">
                        <BaseButton variant="ghost" size="sm">{{ application.score ? t('vacancyDetailVacancy.review') : t('vacancyDetailVacancy.open') }}</BaseButton>
                      </RouterLink>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </BaseCard>
        </div>
      </div>
    </main>

    <AppFooter />
  </div>

  <div v-else class="flex min-h-screen items-center justify-center px-4 text-center">
    <BaseCard class="max-w-md p-8">
      <h1 class="text-2xl font-bold text-foreground">{{ t('vacancyDetailVacancy.notFound') }}</h1>
      <RouterLink to="/business/vacancies" class="mt-6 inline-block">
        <BaseButton>{{ t('vacancyDetailVacancy.backToVacanciesBtn') }}</BaseButton>
      </RouterLink>
    </BaseCard>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { ArrowLeft } from 'lucide-vue-next'
import AppFooter from '@/components/AppFooter.vue'
import AppHeader from '@/components/AppHeader.vue'
import BaseButton from '@/components/BaseButton.vue'
import BaseCard from '@/components/BaseCard.vue'
import { getApplicationsForVacancy, getVacancyById } from '@/data/mock-data'
import { useI18n } from '@/i18n'

const route = useRoute()
const { t } = useI18n()
const vacancy = computed(() => getVacancyById(String(route.params.vacancyId ?? '')))
const applications = computed(() => (vacancy.value ? getApplicationsForVacancy(vacancy.value.id) : []))
const questionStrategy = computed(() => {
  if (!vacancy.value) return ''
  return vacancy.value.customQuestions.length
    ? t('vacancyDetailVacancy.questionSourceMixed')
    : t('vacancyDetailVacancy.questionSourceBank')
})
</script>
