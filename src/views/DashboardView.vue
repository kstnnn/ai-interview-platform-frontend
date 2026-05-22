<template>
  <div class="flex min-h-screen flex-col bg-background">
    <AppHeader />

    <main class="flex-1 px-4 py-8 sm:px-6 lg:px-8">
      <div class="mx-auto max-w-7xl">
        <div class="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 class="text-3xl font-bold text-foreground">{{ t('dashboard.title') }}</h1>
            <p class="mt-1 text-muted-foreground">{{ t('dashboard.subtitle') }}</p>
          </div>
          <RouterLink to="/candidate/join">
            <BaseButton>
              <Plus class="h-4 w-4" />
              {{ t('dashboard.joinInterview') }}
            </BaseButton>
          </RouterLink>
        </div>

        <div class="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <BaseCard class="p-6">
            <div class="flex items-center justify-between">
              <span class="text-sm font-medium text-muted-foreground">{{ t('dashboard.totalInterviews') }}</span>
              <ClipboardCheck class="h-4 w-4 text-primary" />
            </div>
            <div class="mt-3 text-3xl font-bold">{{ stats.total }}</div>
          </BaseCard>
          <BaseCard class="p-6">
            <div class="flex items-center justify-between">
              <span class="text-sm font-medium text-muted-foreground">{{ t('dashboard.completed') }}</span>
              <TrendingUp class="h-4 w-4 text-success" />
            </div>
            <div class="mt-3 text-3xl font-bold">{{ stats.completed }}</div>
          </BaseCard>
          <BaseCard class="p-6">
            <div class="flex items-center justify-between">
              <span class="text-sm font-medium text-muted-foreground">{{ t('dashboard.inProgress') }}</span>
              <Users class="h-4 w-4 text-warning" />
            </div>
            <div class="mt-3 text-3xl font-bold">{{ stats.inProgress }}</div>
          </BaseCard>
          <BaseCard class="p-6">
            <div class="flex items-center justify-between">
              <span class="text-sm font-medium text-muted-foreground">{{ t('dashboard.pending') }}</span>
              <Clock3 class="h-4 w-4 text-muted-foreground" />
            </div>
            <div class="mt-3 text-3xl font-bold">{{ stats.pending }}</div>
          </BaseCard>
        </div>

        <BaseCard class="overflow-hidden">
          <div class="border-b border-border/60 p-6">
            <h2 class="text-xl font-bold text-foreground">{{ t('dashboard.tableTitle') }}</h2>
            <p class="mt-1 text-sm text-muted-foreground">{{ t('dashboard.tableSubtitle') }}</p>
          </div>

          <div class="space-y-4 p-6">
            <div class="flex flex-col gap-4 md:flex-row">
              <label class="relative flex-1">
                <Search class="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  v-model="searchQuery"
                  type="text"
                  :placeholder="t('dashboard.searchPlaceholder')"
                  class="h-11 w-full rounded-full border border-border bg-input pl-11 pr-4 outline-none ring-0 transition focus:border-primary"
                />
              </label>

              <select
                v-model="statusFilter"
                class="h-11 rounded-full border border-border bg-input px-4 outline-none transition focus:border-primary"
              >
                <option value="all">{{ t('dashboard.allStatuses') }}</option>
                <option value="completed">{{ t('dashboard.completed') }}</option>
                <option value="in-progress">{{ t('dashboard.inProgress') }}</option>
                <option value="pending">{{ t('dashboard.pending') }}</option>
              </select>
            </div>

            <div class="overflow-x-auto">
              <table class="min-w-full text-left">
                <thead>
                  <tr class="border-b border-border text-sm text-muted-foreground">
                    <th class="px-4 py-3 font-medium">{{ t('th.candidate') }}</th>
                    <th class="px-4 py-3 font-medium">{{ t('th.position') }}</th>
                    <th class="px-4 py-3 font-medium">{{ t('th.level') }}</th>
                    <th class="px-4 py-3 font-medium">{{ t('th.status') }}</th>
                    <th class="px-4 py-3 font-medium">{{ t('th.score') }}</th>
                    <th class="px-4 py-3 font-medium">{{ t('th.interviewer') }}</th>
                    <th class="px-4 py-3 text-right font-medium">{{ t('th.action') }}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="session in filteredSessions" :key="session.id" class="border-b border-border/60 text-sm last:border-b-0">
                    <td class="px-4 py-4 align-top">
                      <div>
                        <div class="font-semibold text-foreground">{{ session.candidateName }}</div>
                        <div class="text-xs text-muted-foreground">{{ session.candidateEmail }}</div>
                      </div>
                    </td>
                    <td class="px-4 py-4 align-top text-foreground">{{ session.position }}</td>
                    <td class="px-4 py-4 align-top">
                      <span class="rounded-full border border-border px-3 py-1 text-xs font-semibold">{{ session.level }}</span>
                    </td>
                    <td class="px-4 py-4 align-top">
                      <StatusBadge :status="session.status" />
                    </td>
                    <td class="px-4 py-4 align-top font-semibold" :class="scoreClass(session.score)">
                      {{ session.score ?? '—' }}
                    </td>
                    <td class="px-4 py-4 align-top text-foreground">{{ session.interviewerName ?? '—' }}</td>
                    <td class="px-4 py-4 text-right align-top">
                      <RouterLink v-if="session.status === 'completed'" :to="`/results/${session.id}`">
                        <BaseButton variant="ghost" size="sm">
                          <Eye class="h-4 w-4" />
                          {{ t('dashboard.view') }}
                        </BaseButton>
                      </RouterLink>
                      <RouterLink v-else :to="`/candidate/interview/${session.id}`">
                        <BaseButton variant="ghost" size="sm">
                          {{ session.status === 'in-progress' ? t('dashboard.continue') : t('dashboard.start') }}
                        </BaseButton>
                      </RouterLink>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div v-if="filteredSessions.length === 0" class="rounded-organic bg-muted/40 p-8 text-center text-muted-foreground">
              {{ t('dashboard.noResults') }}
            </div>
          </div>
        </BaseCard>
      </div>
    </main>

    <AppFooter />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { ClipboardCheck, Clock3, Eye, Plus, Search, TrendingUp, Users } from 'lucide-vue-next'
import AppFooter from '@/components/AppFooter.vue'
import AppHeader from '@/components/AppHeader.vue'
import BaseButton from '@/components/BaseButton.vue'
import BaseCard from '@/components/BaseCard.vue'
import StatusBadge from '@/components/StatusBadge.vue'
import { getLocalizedSessions } from '@/data/mock-data'
import { useI18n } from '@/i18n'

const searchQuery = ref('')
const statusFilter = ref<'all' | 'pending' | 'in-progress' | 'completed'>('all')
const { t } = useI18n()

const sessions = computed(() => getLocalizedSessions())

const filteredSessions = computed(() => {
  return sessions.value.filter((session) => {
    const term = searchQuery.value.trim().toLowerCase()
    const matchesSearch =
      term.length === 0 ||
      session.candidateName.toLowerCase().includes(term) ||
      session.candidateEmail.toLowerCase().includes(term) ||
      session.position.toLowerCase().includes(term)

    const matchesStatus = statusFilter.value === 'all' || session.status === statusFilter.value

    return matchesSearch && matchesStatus
  })
})

const stats = computed(() => {
  const s = sessions.value
  return {
    total: s.length,
    completed: s.filter((session) => session.status === 'completed').length,
    inProgress: s.filter((session) => session.status === 'in-progress').length,
    pending: s.filter((session) => session.status === 'pending').length,
  }
})

function scoreClass(score?: number) {
  if (typeof score !== 'number') return 'text-muted-foreground'
  if (score >= 85) return 'text-success'
  if (score >= 70) return 'text-warning'
  return 'text-destructive'
}
</script>
