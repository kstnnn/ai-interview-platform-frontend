<template>
  <div class="flex min-h-screen flex-col bg-background">
    <AppHeader />

    <main class="flex-1 px-4 py-8 sm:px-6 lg:px-8">
      <div class="mx-auto max-w-7xl">
        <section class="mb-8 flex flex-col gap-5 rounded-organic border border-border/50 bg-card p-8 shadow-soft lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p class="text-sm font-semibold uppercase tracking-[0.2em] text-primary">{{ t('businessWorkspace.title') }}</p>
            <h1 class="mt-3 font-serif text-4xl font-bold text-foreground sm:text-5xl">{{ organization.name }}</h1>
            <p class="mt-3 max-w-3xl text-lg leading-relaxed text-muted-foreground">
              {{ t('businessWorkspace.description') }}
            </p>
          </div>
          <RouterLink to="/business/vacancies/new">
            <BaseButton size="lg">
              <Plus class="h-4 w-4" />
              {{ t('businessWorkspace.createVacancy') }}
            </BaseButton>
          </RouterLink>
        </section>

        <section class="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <BaseCard class="p-6">
            <p class="text-sm font-medium text-muted-foreground">{{ t('businessWorkspace.plan') }}</p>
            <div class="mt-3 text-3xl font-bold text-primary">{{ organization.plan }}</div>
          </BaseCard>
          <BaseCard class="p-6">
            <p class="text-sm font-medium text-muted-foreground">{{ t('businessWorkspace.activeVacancies') }}</p>
            <div class="mt-3 text-3xl font-bold text-primary">{{ organization.activeVacancies }}</div>
          </BaseCard>
          <BaseCard class="p-6">
            <p class="text-sm font-medium text-muted-foreground">{{ t('businessWorkspace.monthlyInterviews') }}</p>
            <div class="mt-3 text-3xl font-bold text-primary">{{ organization.monthlyInterviews }}</div>
          </BaseCard>
          <BaseCard class="p-6">
            <p class="text-sm font-medium text-muted-foreground">{{ t('businessWorkspace.candidatesPipeline') }}</p>
            <div class="mt-3 text-3xl font-bold text-primary">{{ mockApplications.length }}</div>
          </BaseCard>
        </section>

        <section class="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <BaseCard class="overflow-hidden">
            <div class="border-b border-border/60 p-6">
              <h2 class="text-xl font-bold text-foreground">{{ t('businessWorkspace.vacanciesTitle') }}</h2>
              <p class="mt-1 text-sm text-muted-foreground">{{ t('businessWorkspace.vacanciesDesc') }}</p>
            </div>
            <div class="divide-y divide-border/60">
              <RouterLink v-for="vacancy in vacancies" :key="vacancy.id" :to="`/business/vacancies/${vacancy.id}`" class="block p-6 transition hover:bg-muted/30">
                <div class="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div>
                    <h3 class="text-lg font-bold text-foreground">{{ vacancy.title }}</h3>
                    <p class="mt-1 text-sm text-muted-foreground">{{ vacancy.department }} · {{ vacancy.level }} · {{ vacancy.interviewDurationMinutes }} {{ t('common.minutes') }}</p>
                    <div class="mt-3 flex flex-wrap gap-2">
                      <span v-for="item in vacancy.stack" :key="item" class="rounded-full border border-border px-3 py-1 text-xs font-semibold">{{ item }}</span>
                    </div>
                  </div>
                  <div class="text-left md:text-right">
                    <p class="font-bold text-primary">{{ vacancy.candidateCount }} {{ t('common.candidates').toLowerCase() }}</p>
                    <p class="mt-1 text-xs capitalize text-muted-foreground">{{ vacancy.status }}</p>
                  </div>
                </div>
              </RouterLink>
            </div>
          </BaseCard>

          <BaseCard class="p-8">
            <h2 class="text-xl font-bold text-foreground">{{ t('businessWorkspace.pipelineTitle') }}</h2>
            <div class="mt-5 space-y-4">
              <div v-for="application in mockApplications" :key="application.id" class="rounded-[1.5rem] bg-muted/45 p-4">
                <div class="flex items-start justify-between gap-4">
                  <div>
                    <p class="font-semibold text-foreground">{{ application.candidateName }}</p>
                    <p class="mt-1 text-sm text-muted-foreground">{{ application.candidateEmail }}</p>
                  </div>
                  <span class="rounded-full bg-card px-3 py-1 text-xs font-semibold capitalize text-muted-foreground">{{ application.status }}</span>
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
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { Plus } from 'lucide-vue-next'
import AppFooter from '@/components/AppFooter.vue'
import AppHeader from '@/components/AppHeader.vue'
import BaseButton from '@/components/BaseButton.vue'
import BaseCard from '@/components/BaseCard.vue'
import { mockApplications, getLocalizedOrganizations, getLocalizedVacancies } from '@/data/mock-data'
import { useI18n } from '@/i18n'

const { t } = useI18n()
const organization = computed(() => getLocalizedOrganizations()[0])
const vacancies = computed(() => getLocalizedVacancies())
</script>
