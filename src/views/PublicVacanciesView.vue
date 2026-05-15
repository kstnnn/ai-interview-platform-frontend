<template>
  <div class="flex min-h-screen flex-col bg-background">
    <AppHeader />

    <main class="flex-1 px-4 py-10 sm:px-6 lg:px-8">
      <div class="mx-auto max-w-7xl">
        <section class="mb-8 rounded-organic border border-border/50 bg-card p-8 shadow-soft">
          <p class="text-sm font-semibold uppercase tracking-[0.2em] text-primary">{{ t('nav.vacancies') }}</p>
          <h1 class="mt-3 font-serif text-4xl font-bold text-foreground sm:text-5xl">{{ t('publicVacancies.title') }}</h1>
          <p class="mt-4 max-w-3xl text-lg leading-relaxed text-muted-foreground">{{ t('publicVacancies.subtitle') }}</p>
        </section>

        <section class="mb-6 flex flex-col gap-4 md:flex-row">
          <label class="relative flex-1">
            <Search class="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              v-model="searchQuery"
              type="text"
              :placeholder="t('publicVacancies.search')"
              class="h-12 w-full rounded-full border border-border bg-input pl-11 pr-4 outline-none transition focus:border-primary"
            />
          </label>
          <select v-model="levelFilter" class="h-12 rounded-full border border-border bg-input px-4 outline-none transition focus:border-primary">
            <option value="all">{{ t('publicVacancies.allLevels') }}</option>
            <option value="Junior">Junior</option>
            <option value="Mid">Mid</option>
            <option value="Senior">Senior</option>
            <option value="Lead">Lead</option>
          </select>
        </section>

        <section class="grid gap-5 lg:grid-cols-2">
          <BaseCard v-for="vacancy in filteredVacancies" :key="vacancy.id" class="p-6">
            <div class="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div class="flex flex-wrap items-center gap-2">
                  <span class="rounded-full bg-success/10 px-3 py-1 text-xs font-semibold text-success">{{ t('publicVacancies.active') }}</span>
                  <span class="rounded-full bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground">{{ vacancy.employmentType }}</span>
                </div>
                <h2 class="mt-4 text-2xl font-bold text-foreground">{{ vacancy.title }}</h2>
                <p class="mt-1 text-sm text-muted-foreground">{{ vacancy.organizationName }} · {{ vacancy.location }}</p>
                <p class="mt-4 text-sm leading-relaxed text-muted-foreground">{{ vacancy.description }}</p>
              </div>
              <div class="shrink-0 text-left sm:text-right">
                <p class="text-sm text-muted-foreground">{{ t('common.level') }}</p>
                <p class="font-bold text-primary">{{ vacancy.level }}</p>
                <p v-if="vacancy.salaryRange" class="mt-3 text-sm font-semibold text-foreground">{{ vacancy.salaryRange }}</p>
              </div>
            </div>

            <div class="mt-5 flex flex-wrap gap-2">
              <span v-for="item in vacancy.stack" :key="item" class="rounded-full border border-border px-3 py-1 text-xs font-semibold">{{ item }}</span>
            </div>

            <div class="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p class="text-sm text-muted-foreground">{{ vacancy.interviewDurationMinutes }} {{ t('common.minutes') }} · {{ vacancy.candidateCount }} {{ t('common.candidates').toLowerCase() }}</p>
              <div class="flex gap-3">
                <RouterLink :to="`/vacancies/${vacancy.id}`">
                  <BaseButton variant="outline">{{ t('common.open') }}</BaseButton>
                </RouterLink>
                <RouterLink :to="`/vacancies/${vacancy.id}/apply`">
                  <BaseButton>{{ t('common.apply') }}</BaseButton>
                </RouterLink>
              </div>
            </div>
          </BaseCard>
        </section>

        <div v-if="filteredVacancies.length === 0" class="mt-8 rounded-organic bg-muted/40 p-8 text-center text-muted-foreground">
          {{ t('publicVacancies.noResults') }}
        </div>
      </div>
    </main>

    <AppFooter />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { Search } from 'lucide-vue-next'
import AppFooter from '@/components/AppFooter.vue'
import AppHeader from '@/components/AppHeader.vue'
import BaseButton from '@/components/BaseButton.vue'
import BaseCard from '@/components/BaseCard.vue'
import { getPublicVacancies } from '@/data/mock-data'
import { useI18n } from '@/i18n'

const { t } = useI18n()
const searchQuery = ref('')
const levelFilter = ref('all')
const publicVacancies = getPublicVacancies()

const filteredVacancies = computed(() => {
  const term = searchQuery.value.trim().toLowerCase()

  return publicVacancies.filter((vacancy) => {
    const matchesLevel = levelFilter.value === 'all' || vacancy.level === levelFilter.value
    const searchable = [
      vacancy.title,
      vacancy.organizationName,
      vacancy.description,
      vacancy.location,
      ...vacancy.stack,
      ...vacancy.requiredSkills,
    ]
      .join(' ')
      .toLowerCase()

    return matchesLevel && (term.length === 0 || searchable.includes(term))
  })
})
</script>
