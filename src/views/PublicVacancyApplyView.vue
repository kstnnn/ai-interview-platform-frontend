<template>
  <div class="flex min-h-screen flex-col bg-background">
    <AppHeader />

    <main class="flex-1 px-4 py-10 sm:px-6 lg:px-8">
      <div class="mx-auto max-w-5xl">
        <RouterLink :to="vacancy ? `/vacancies/${vacancy.id}` : '/vacancies'" class="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft class="h-4 w-4" />
          {{ t('common.back') }}
        </RouterLink>

        <BaseCard v-if="isLoading" class="mt-6 p-8 text-center text-muted-foreground">
          {{ t('publicVacancies.loadingDetail') }}
        </BaseCard>

        <BaseCard v-else-if="error" class="mt-6 p-8 text-center text-destructive">
          {{ error }}
        </BaseCard>

        <div v-else-if="vacancy" class="mt-6 grid gap-8 lg:grid-cols-[1fr_0.7fr]">
          <BaseCard class="p-8">
            <h1 class="font-serif text-4xl font-bold text-foreground">{{ t('vacancyApply.title') }}</h1>
            <p class="mt-3 text-muted-foreground">{{ t('vacancyApply.subtitle') }}</p>
            <div class="mt-6 rounded-[1.5rem] border border-warning/30 bg-warning/10 p-4 text-sm leading-relaxed text-foreground">
              {{ t('vacancyApply.unavailable') }}
            </div>

            <form class="mt-8 space-y-6" @submit.prevent="submitApplication">
              <label class="space-y-2 block">
                <span class="block text-sm font-semibold text-foreground">{{ t('vacancyApply.name') }}</span>
                <input v-model="form.name" class="h-12 w-full rounded-full border border-border bg-input px-4 outline-none focus:border-primary" placeholder="Jane Doe" />
              </label>
              <label class="space-y-2 block">
                <span class="block text-sm font-semibold text-foreground">{{ t('vacancyApply.email') }}</span>
                <input v-model="form.email" type="email" class="h-12 w-full rounded-full border border-border bg-input px-4 outline-none focus:border-primary" placeholder="jane@example.com" />
              </label>
              <label class="space-y-2 block">
                <span class="block text-sm font-semibold text-foreground">{{ t('vacancyApply.profile') }}</span>
                <input v-model="form.profile" class="h-12 w-full rounded-full border border-border bg-input px-4 outline-none focus:border-primary" placeholder="https://linkedin.com/in/..." />
              </label>
              <label class="space-y-2 block">
                <span class="block text-sm font-semibold text-foreground">{{ t('vacancyApply.note') }}</span>
                <textarea v-model="form.note" rows="4" class="w-full rounded-[1.5rem] border border-border bg-input px-4 py-3 outline-none focus:border-primary"></textarea>
              </label>

              <BaseButton size="lg" tag="button" disabled>
                {{ t('vacancyApply.submit') }}
                <ArrowRight class="h-4 w-4" />
              </BaseButton>
            </form>
          </BaseCard>

          <div class="space-y-5">
            <BaseCard class="p-6">
              <h2 class="text-xl font-bold text-foreground">{{ vacancy.title }}</h2>
              <p class="mt-2 text-sm text-muted-foreground">{{ vacancy.organizationName }} · {{ vacancy.location || t('vacancies.noLocation') }}</p>
              <div class="mt-5 flex flex-wrap gap-2">
                <span v-for="item in vacancy.technologyKeys" :key="item" class="rounded-full border border-border px-3 py-1 text-xs font-semibold">{{ item }}</span>
              </div>
            </BaseCard>
            <BaseCard class="p-6">
              <h2 class="text-lg font-bold text-foreground">{{ t('vacancyApply.afterSubmit') }}</h2>
              <p class="mt-3 text-sm leading-relaxed text-muted-foreground">
                {{ t('vacancyApply.afterSubmitUnavailable') }}
              </p>
            </BaseCard>
          </div>
        </div>

        <BaseCard v-else class="mt-6 p-8 text-center">
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
import { onMounted, reactive, ref } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { ArrowLeft, ArrowRight } from 'lucide-vue-next'
import AppFooter from '@/components/AppFooter.vue'
import AppHeader from '@/components/AppHeader.vue'
import BaseButton from '@/components/BaseButton.vue'
import BaseCard from '@/components/BaseCard.vue'
import { getPublicVacancy } from '@/api/organization'
import { useI18n } from '@/i18n'
import type { VacancyResponse } from '@/types/api'

const route = useRoute()
const { t } = useI18n()
const vacancy = ref<VacancyResponse | null>(null)
const isLoading = ref(true)
const error = ref('')
const form = reactive({
  name: '',
  email: '',
  profile: '',
  note: '',
})

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

function submitApplication() {
  return
}
</script>
