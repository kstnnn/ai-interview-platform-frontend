<template>
  <div class="flex min-h-screen flex-col bg-background">
    <AppHeader />

    <main class="flex-1 px-4 py-8 sm:px-6 lg:px-8">
      <div class="mx-auto max-w-7xl">
        <div class="mb-8">
          <p class="text-sm font-semibold uppercase tracking-[0.2em] text-primary">{{ t('nav.vacancies') }}</p>
          <h1 class="mt-3 font-serif text-4xl font-bold text-foreground sm:text-5xl">{{ t('publicVacancies.title') }}</h1>
          <p class="mt-4 max-w-3xl text-lg leading-relaxed text-muted-foreground">{{ t('publicVacancies.subtitle') }}</p>
        </div>

        <div class="mb-6 flex flex-col gap-4 sm:flex-row">
          <label class="relative flex-1">
            <Search class="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              v-model="search"
              type="text"
              :placeholder="t('publicVacancies.search')"
              class="h-11 w-full rounded-full border border-border bg-input pl-11 pr-4 outline-none transition focus:border-primary"
            />
          </label>

          <select v-model="levelFilter" class="h-11 rounded-full border border-border bg-input px-4 outline-none transition focus:border-primary">
            <option value="all">{{ t('publicVacancies.allLevels') }}</option>
            <option value="Junior">Junior</option>
            <option value="Mid">Mid</option>
            <option value="Senior">Senior</option>
            <option value="Lead">Lead</option>
          </select>
        </div>

        <div v-if="filteredVacancies.length" class="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          <BaseCard v-for="vacancy in filteredVacancies" :key="vacancy.id" class="flex flex-col p-6">
            <div class="flex items-start justify-between gap-4">
              <div>
                <h3 class="text-lg font-bold text-foreground">{{ vacancy.title }}</h3>
                <p class="mt-1 text-sm text-muted-foreground">{{ vacancy.organizationName }} · {{ vacancy.location }}</p>
              </div>
              <span class="rounded-full bg-success/10 px-3 py-1 text-xs font-semibold text-success">{{ t('publicVacancies.active') }}</span>
            </div>

            <div class="mt-4 flex flex-wrap gap-2">
              <span v-for="item in vacancy.stack" :key="item" class="rounded-full border border-border px-3 py-1 text-xs font-semibold">{{ item }}</span>
            </div>

            <div class="mt-4 flex items-center justify-between text-sm text-muted-foreground">
              <p>{{ t('common.level') }}: {{ vacancy.level }}</p>
              <p>{{ vacancy.interviewDurationMinutes }} {{ t('common.minutes') }} · {{ vacancy.candidateCount }} {{ t('common.candidates').toLowerCase() }}</p>
            </div>

            <div class="mt-5 flex gap-3">
              <RouterLink :to="`/vacancies/${vacancy.id}`" class="flex-1">
                <BaseButton class="w-full" variant="outline">{{ t('common.open') }}</BaseButton>
              </RouterLink>
              <RouterLink :to="`/vacancies/${vacancy.id}/apply`" class="flex-1">
                <BaseButton class="w-full">{{ t('common.apply') }}</BaseButton>
              </RouterLink>
            </div>
          </BaseCard>
        </div>

        <div v-else class="rounded-organic bg-muted/40 p-10 text-center text-muted-foreground">
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

const search = ref('')
const levelFilter = ref('all')
const { t } = useI18n()

const vacancies = computed(() => getPublicVacancies())

const filteredVacancies = computed(() => {
  return vacancies.value.filter((vacancy) => {
    const term = search.value.trim().toLowerCase()
    const matchesSearch =
      term.length === 0 ||
      vacancy.title.toLowerCase().includes(term) ||
      vacancy.organizationName.toLowerCase().includes(term) ||
      vacancy.stack.some((s) => s.toLowerCase().includes(term)) ||
      vacancy.requiredSkills.some((s) => s.toLowerCase().includes(term))

    const matchesLevel = levelFilter.value === 'all' || vacancy.level === levelFilter.value

    return matchesSearch && matchesLevel
  })
})
</script>
