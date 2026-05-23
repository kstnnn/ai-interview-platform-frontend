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
            <div v-if="submitError" class="mt-6 rounded-[1.5rem] border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">{{ submitError }}</div>

            <form class="mt-8 space-y-6" @submit.prevent="submitApplication">
              <label class="space-y-2 block">
                <span class="block text-sm font-semibold text-foreground">{{ t('vacancyApply.coverLetter') }}</span>
                <textarea v-model="coverLetter" rows="6" class="w-full rounded-[1.5rem] border border-border bg-input px-4 py-3 outline-none focus:border-primary" :placeholder="t('vacancyApply.coverLetterPlaceholder')"></textarea>
              </label>

              <BaseButton size="lg" tag="button" :disabled="isSubmitting">
                {{ isSubmitting ? t('vacancyApply.submitting') : t('vacancyApply.submit') }}
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
                {{ t('vacancyApply.afterSubmitReady') }}
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
import { onMounted, ref } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { ArrowLeft, ArrowRight } from 'lucide-vue-next'
import AppFooter from '@/components/AppFooter.vue'
import AppHeader from '@/components/AppHeader.vue'
import BaseButton from '@/components/BaseButton.vue'
import BaseCard from '@/components/BaseCard.vue'
import { applyToVacancy, getPublicVacancy } from '@/api/organization'
import { useI18n } from '@/i18n'
import type { VacancyResponse } from '@/types/api'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const vacancy = ref<VacancyResponse | null>(null)
const isLoading = ref(true)
const isSubmitting = ref(false)
const error = ref('')
const submitError = ref('')
const coverLetter = ref('')

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

async function submitApplication() {
  if (!vacancy.value) return
  isSubmitting.value = true
  submitError.value = ''
  try {
    const application = await applyToVacancy(vacancy.value.id, { coverLetter: coverLetter.value.trim() || null })
    await router.push(`/candidate/interview/${application.interviewSessionId}`)
  } catch (err: any) {
    submitError.value = err?.status === 409
      ? t('vacancyApply.duplicate')
      : err instanceof Error
        ? err.message
        : t('vacancyApply.submitFailed')
  } finally {
    isSubmitting.value = false
  }
}
</script>
