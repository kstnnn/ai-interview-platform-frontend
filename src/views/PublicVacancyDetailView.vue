<template>
  <div v-if="vacancy" class="flex min-h-screen flex-col bg-background">
    <AppHeader />

    <main class="flex-1 px-4 py-10 sm:px-6 lg:px-8">
      <div class="mx-auto max-w-6xl">
        <RouterLink to="/vacancies" class="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft class="h-4 w-4" />
          {{ t('common.back') }}
        </RouterLink>

        <section class="mt-6 grid gap-6 lg:grid-cols-[1fr_0.42fr]">
          <BaseCard class="p-8">
            <p class="text-sm font-semibold text-primary">{{ vacancy.organizationName }} · {{ vacancy.location }}</p>
            <h1 class="mt-3 font-serif text-4xl font-bold text-foreground">{{ vacancy.title }}</h1>
            <p class="mt-4 text-lg leading-relaxed text-muted-foreground">{{ vacancy.description }}</p>

            <div class="mt-6 grid gap-3 sm:grid-cols-3">
              <div class="rounded-[1.5rem] bg-muted/50 p-4">
                <p class="text-xs text-muted-foreground">{{ t('common.level') }}</p>
                <p class="mt-1 font-bold text-foreground">{{ vacancy.level }}</p>
              </div>
              <div class="rounded-[1.5rem] bg-muted/50 p-4">
                <p class="text-xs text-muted-foreground">{{ t('common.duration') }}</p>
                <p class="mt-1 font-bold text-foreground">{{ vacancy.interviewDurationMinutes }} {{ t('common.minutes') }}</p>
              </div>
              <div class="rounded-[1.5rem] bg-muted/50 p-4">
                <p class="text-xs text-muted-foreground">Type</p>
                <p class="mt-1 font-bold text-foreground">{{ vacancy.employmentType }}</p>
              </div>
            </div>
          </BaseCard>

          <BaseCard class="p-8">
            <h2 class="text-xl font-bold text-foreground">{{ t('vacancyDetail.applyTitle') }}</h2>
            <p class="mt-3 text-sm leading-relaxed text-muted-foreground">{{ t('vacancyDetail.applyText') }}</p>
            <RouterLink :to="`/vacancies/${vacancy.id}/apply`" class="mt-6 inline-flex">
              <BaseButton size="lg">{{ t('vacancyDetail.startApply') }}</BaseButton>
            </RouterLink>
          </BaseCard>
        </section>

        <section class="mt-6 grid gap-6 lg:grid-cols-3">
          <BaseCard class="p-6 lg:col-span-2">
            <h2 class="text-xl font-bold text-foreground">{{ t('vacancyDetail.requirements') }}</h2>
            <div class="mt-5 space-y-5">
              <div>
                <p class="text-sm font-medium text-muted-foreground">{{ t('common.stack') }}</p>
                <div class="mt-2 flex flex-wrap gap-2">
                  <span v-for="item in vacancy.stack" :key="item" class="rounded-full border border-border px-3 py-1 text-xs font-semibold">{{ item }}</span>
                </div>
              </div>
              <div>
                <p class="text-sm font-medium text-muted-foreground">Skills</p>
                <div class="mt-2 flex flex-wrap gap-2">
                  <span v-for="item in vacancy.requiredSkills" :key="item" class="rounded-full bg-muted px-3 py-1 text-xs font-semibold">{{ item }}</span>
                </div>
              </div>
            </div>
          </BaseCard>

          <BaseCard class="p-6">
            <h2 class="text-xl font-bold text-foreground">{{ t('vacancyDetail.questions') }}</h2>
            <p class="mt-4 text-sm leading-relaxed text-muted-foreground">{{ questionStrategy }}</p>
          </BaseCard>
        </section>
      </div>
    </main>

    <AppFooter />
  </div>

  <div v-else class="flex min-h-screen items-center justify-center px-4 text-center">
    <BaseCard class="max-w-md p-8">
      <h1 class="text-2xl font-bold text-foreground">Vacancy not found</h1>
      <RouterLink to="/vacancies" class="mt-6 inline-block">
        <BaseButton>{{ t('common.back') }}</BaseButton>
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
import { getVacancyById } from '@/data/mock-data'
import { useI18n } from '@/i18n'

const route = useRoute()
const { locale, t } = useI18n()
const vacancy = computed(() => getVacancyById(String(route.params.vacancyId ?? '')))
const questionStrategy = computed(() => {
  if (!vacancy.value) return ''
  if (locale.value === 'ru') {
    return vacancy.value.customQuestions.length
      ? 'AI смешивает вопросы компании с релевантными вопросами из базы по стеку и уровню.'
      : 'AI использует только релевантные вопросы из базы по стеку и уровню.'
  }

  return vacancy.value.customQuestions.length
    ? 'AI mixes company-defined questions with matching database questions for this stack and level.'
    : 'AI uses only matching database questions for this stack and level.'
})
</script>
