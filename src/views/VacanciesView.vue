<template>
  <div class="flex min-h-screen flex-col bg-background">
    <AppHeader />

    <main class="flex-1 px-4 py-8 sm:px-6 lg:px-8">
      <div class="mx-auto max-w-7xl">
        <div class="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <RouterLink to="/business" class="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
              <ArrowLeft class="h-4 w-4" />
              {{ t('vacancies.backToBusiness') }}
            </RouterLink>
            <h1 class="mt-3 text-3xl font-bold text-foreground">{{ t('vacancies.title') }}</h1>
            <p class="mt-1 text-muted-foreground">{{ t('vacancies.subtitle') }}</p>
          </div>
          <RouterLink to="/business/vacancies/new">
            <BaseButton>
              <Plus class="h-4 w-4" />
              {{ t('vacancies.new') }}
            </BaseButton>
          </RouterLink>
        </div>

        <BaseCard v-if="isLoading" class="p-8 text-center text-muted-foreground">{{ t('businessWorkspace.loading') }}</BaseCard>
        <BaseCard v-else-if="error" class="p-8 text-center text-destructive">{{ error }}</BaseCard>
        <BaseCard v-else-if="!organization" class="p-8 text-center text-muted-foreground">{{ t('businessWorkspace.createOrgTitle') }}</BaseCard>

        <BaseCard v-else class="overflow-hidden">
          <div v-if="vacancies.length === 0" class="p-8 text-center text-muted-foreground">{{ t('businessWorkspace.noVacancies') }}</div>
          <div v-else class="overflow-x-auto">
            <table class="min-w-full text-left">
              <thead>
                <tr class="border-b border-border text-sm text-muted-foreground">
                  <th class="px-6 py-4 font-medium">{{ t('th.vacancy') }}</th>
                  <th class="px-6 py-4 font-medium">{{ t('th.stack') }}</th>
                  <th class="px-6 py-4 font-medium">{{ t('vacancies.type') }}</th>
                  <th class="px-6 py-4 font-medium">{{ t('th.status') }}</th>
                  <th class="px-6 py-4 text-right font-medium">{{ t('th.action') }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="vacancy in vacancies" :key="vacancy.id" class="border-b border-border/60 text-sm last:border-b-0">
                  <td class="px-6 py-5 align-top">
                    <div class="font-semibold text-foreground">{{ vacancy.title }}</div>
                    <div class="text-xs text-muted-foreground">{{ vacancyLevelLabel(vacancy.level, t) }} · {{ vacancy.location || t('vacancies.noLocation') }}</div>
                  </td>
                  <td class="px-6 py-5 align-top">
                    <div class="flex max-w-md flex-wrap gap-2">
                      <span v-for="item in vacancy.technologyKeys" :key="item" class="rounded-full bg-muted px-3 py-1 text-xs font-semibold">{{ item }}</span>
                    </div>
                  </td>
                  <td class="px-6 py-5 align-top text-muted-foreground">{{ employmentTypeLabel(vacancy.employmentType, t) }} · {{ workFormatLabel(vacancy.workFormat, t) }}</td>
                  <td class="px-6 py-5 align-top text-muted-foreground">{{ vacancyStatusLabel(vacancy.status, t) }}</td>
                  <td class="px-6 py-5 text-right align-top">
                    <RouterLink :to="`/business/vacancies/${vacancy.id}`">
                      <BaseButton variant="ghost" size="sm">{{ t('vacancies.open') }}</BaseButton>
                    </RouterLink>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </BaseCard>
      </div>
    </main>

    <AppFooter />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { ArrowLeft, Plus } from 'lucide-vue-next'
import AppFooter from '@/components/AppFooter.vue'
import AppHeader from '@/components/AppHeader.vue'
import BaseButton from '@/components/BaseButton.vue'
import BaseCard from '@/components/BaseCard.vue'
import { getMyOrganizations, getOrganizationVacancies } from '@/api/organization'
import { useI18n } from '@/i18n'
import type { OrganizationResponse, VacancyResponse } from '@/types/api'
import { employmentTypeLabel, vacancyLevelLabel, vacancyStatusLabel, workFormatLabel } from '@/utils/vacancy-labels'

const { t } = useI18n()
const organizations = ref<OrganizationResponse[]>([])
const vacancies = ref<VacancyResponse[]>([])
const isLoading = ref(true)
const error = ref('')
const organization = computed(() => organizations.value[0] ?? null)

onMounted(async () => {
  try {
    organizations.value = await getMyOrganizations()
    vacancies.value = organization.value ? await getOrganizationVacancies(organization.value.id) : []
  } catch (err) {
    error.value = err instanceof Error ? err.message : t('businessWorkspace.loadFailed')
  } finally {
    isLoading.value = false
  }
})
</script>
