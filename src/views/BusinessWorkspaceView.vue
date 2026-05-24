<template>
  <div class="flex min-h-screen flex-col bg-background">
    <AppHeader />

    <main class="flex-1 px-4 py-8 sm:px-6 lg:px-8">
      <div class="mx-auto max-w-7xl">
        <BaseCard v-if="isLoading" class="p-8 text-center text-muted-foreground">{{ t('businessWorkspace.loading') }}</BaseCard>

        <BaseCard v-else-if="!organization" class="mx-auto max-w-2xl p-8">
          <h1 class="font-serif text-3xl font-bold text-foreground">{{ t('businessWorkspace.createOrgTitle') }}</h1>
          <p class="mt-3 text-muted-foreground">{{ t('businessWorkspace.createOrgDesc') }}</p>
          <form class="mt-6 space-y-4" @submit.prevent="submitOrganization">
            <input v-model="orgForm.name" required class="h-12 w-full rounded-full border border-border bg-input px-4 outline-none focus:border-primary" :placeholder="t('businessWorkspace.orgName')" />
            <textarea v-model="orgForm.description" rows="3" class="w-full rounded-[1.5rem] border border-border bg-input px-4 py-3 outline-none focus:border-primary" :placeholder="t('businessWorkspace.orgDescription')" />
            <input v-model="orgForm.websiteUrl" class="h-12 w-full rounded-full border border-border bg-input px-4 outline-none focus:border-primary" :placeholder="t('businessWorkspace.orgWebsite')" />
            <input v-model="orgForm.logoUrl" class="h-12 w-full rounded-full border border-border bg-input px-4 outline-none focus:border-primary" :placeholder="t('businessWorkspace.orgLogo')" />
            <p v-if="error" class="rounded-[1.5rem] bg-destructive/10 p-4 text-sm text-destructive">{{ error }}</p>
            <BaseButton tag="button" :disabled="isSavingOrg">{{ isSavingOrg ? t('common.saving') : t('businessWorkspace.createOrg') }}</BaseButton>
          </form>
        </BaseCard>

        <template v-else>
          <section class="mb-8 flex flex-col gap-5 rounded-organic border border-border/50 bg-card p-8 shadow-soft lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p class="text-sm font-semibold uppercase tracking-[0.2em] text-primary">{{ t('businessWorkspace.title') }}</p>
              <h1 class="mt-3 font-serif text-4xl font-bold text-foreground sm:text-5xl">{{ organization.name }}</h1>
              <p class="mt-3 max-w-3xl text-lg leading-relaxed text-muted-foreground">
                {{ organization.description || t('businessWorkspace.description') }}
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
              <p class="text-sm font-medium text-muted-foreground">{{ t('businessWorkspace.organizations') }}</p>
              <div class="mt-3 text-3xl font-bold text-primary">{{ organizations.length }}</div>
            </BaseCard>
            <BaseCard class="p-6">
              <p class="text-sm font-medium text-muted-foreground">{{ t('businessWorkspace.activeVacancies') }}</p>
              <div class="mt-3 text-3xl font-bold text-primary">{{ activeVacancies }}</div>
            </BaseCard>
            <BaseCard class="p-6">
              <p class="text-sm font-medium text-muted-foreground">{{ t('businessWorkspace.draftVacancies') }}</p>
              <div class="mt-3 text-3xl font-bold text-primary">{{ draftVacancies }}</div>
            </BaseCard>
            <BaseCard class="p-6">
              <p class="text-sm font-medium text-muted-foreground">{{ t('businessWorkspace.closedVacancies') }}</p>
              <div class="mt-3 text-3xl font-bold text-primary">{{ closedVacancies }}</div>
            </BaseCard>
          </section>

          <section class="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
            <BaseCard class="overflow-hidden">
              <div class="border-b border-border/60 p-6">
                <h2 class="text-xl font-bold text-foreground">{{ t('businessWorkspace.vacanciesTitle') }}</h2>
                <p class="mt-1 text-sm text-muted-foreground">{{ t('businessWorkspace.vacanciesDesc') }}</p>
              </div>
              <div v-if="vacancies.length === 0" class="p-6 text-sm text-muted-foreground">{{ t('businessWorkspace.noVacancies') }}</div>
              <div v-else class="divide-y divide-border/60">
                <RouterLink v-for="vacancy in vacancies" :key="vacancy.id" :to="`/business/vacancies/${vacancy.id}`" class="block p-6 transition hover:bg-muted/30">
                  <div class="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div>
                      <h3 class="text-lg font-bold text-foreground">{{ vacancy.title }}</h3>
                      <p class="mt-1 text-sm text-muted-foreground">{{ vacancyLevelLabel(vacancy.level, t) }} · {{ employmentTypeLabel(vacancy.employmentType, t) }} · {{ workFormatLabel(vacancy.workFormat, t) }}</p>
                      <div class="mt-3 flex flex-wrap gap-2">
                        <span v-for="item in vacancy.technologyKeys" :key="item" class="rounded-full border border-border px-3 py-1 text-xs font-semibold">{{ item }}</span>
                      </div>
                    </div>
                    <p class="text-left text-xs font-semibold text-muted-foreground md:text-right">{{ vacancyStatusLabel(vacancy.status, t) }}</p>
                  </div>
                </RouterLink>
              </div>
            </BaseCard>

            <BaseCard class="p-8">
              <h2 class="text-xl font-bold text-foreground">{{ t('businessWorkspace.pipelineTitle') }}</h2>
              <p class="mt-2 text-sm text-muted-foreground">{{ t('businessWorkspace.pipelineDesc') }}</p>
              <div v-if="vacancies.length === 0" class="mt-5 rounded-[1.5rem] bg-muted/45 p-5 text-sm text-muted-foreground">{{ t('businessWorkspace.noVacancies') }}</div>
              <div v-else class="mt-5 space-y-3">
                <RouterLink v-for="vacancy in vacancies" :key="vacancy.id" :to="`/business/vacancies/${vacancy.id}/applications`" class="block rounded-[1.5rem] border border-border/60 p-4 transition hover:border-primary/40 hover:bg-muted/30">
                  <div class="flex items-start justify-between gap-3">
                    <div>
                      <h3 class="font-semibold text-foreground">{{ vacancy.title }}</h3>
                      <p class="mt-1 text-xs text-muted-foreground">{{ vacancyStatusLabel(vacancy.status, t) }} · {{ vacancyLevelLabel(vacancy.level, t) }}</p>
                    </div>
                    <span class="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">{{ t('applications.viewAll') }}</span>
                  </div>
                </RouterLink>
              </div>
            </BaseCard>
          </section>
        </template>
      </div>
    </main>

    <AppFooter />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { Plus } from 'lucide-vue-next'
import AppFooter from '@/components/AppFooter.vue'
import AppHeader from '@/components/AppHeader.vue'
import BaseButton from '@/components/BaseButton.vue'
import BaseCard from '@/components/BaseCard.vue'
import { createOrganization, getMyOrganizations, getOrganizationVacancies } from '@/api/organization'
import { useI18n } from '@/i18n'
import type { OrganizationResponse, VacancyResponse } from '@/types/api'
import { employmentTypeLabel, vacancyLevelLabel, vacancyStatusLabel, workFormatLabel } from '@/utils/vacancy-labels'

const { t } = useI18n()
const organizations = ref<OrganizationResponse[]>([])
const vacancies = ref<VacancyResponse[]>([])
const isLoading = ref(true)
const isSavingOrg = ref(false)
const error = ref('')
const orgForm = reactive({ name: '', description: '', websiteUrl: '', logoUrl: '' })

const organization = computed(() => organizations.value[0] ?? null)
const activeVacancies = computed(() => vacancies.value.filter((v) => v.status === 'PUBLISHED').length)
const draftVacancies = computed(() => vacancies.value.filter((v) => v.status === 'DRAFT').length)
const closedVacancies = computed(() => vacancies.value.filter((v) => v.status === 'CLOSED').length)

async function loadBusinessData() {
  isLoading.value = true
  error.value = ''
  try {
    organizations.value = await getMyOrganizations()
    vacancies.value = organization.value ? await getOrganizationVacancies(organization.value.id) : []
  } catch (err) {
    error.value = err instanceof Error ? err.message : t('businessWorkspace.loadFailed')
  } finally {
    isLoading.value = false
  }
}

async function submitOrganization() {
  if (!orgForm.name.trim()) return
  isSavingOrg.value = true
  error.value = ''
  try {
    const created = await createOrganization({
      name: orgForm.name.trim(),
      description: orgForm.description.trim() || null,
      websiteUrl: orgForm.websiteUrl.trim() || null,
      logoUrl: orgForm.logoUrl.trim() || null,
    })
    organizations.value = [created]
    vacancies.value = []
  } catch (err) {
    error.value = err instanceof Error ? err.message : t('businessWorkspace.createOrgFailed')
  } finally {
    isSavingOrg.value = false
  }
}

onMounted(loadBusinessData)
</script>
