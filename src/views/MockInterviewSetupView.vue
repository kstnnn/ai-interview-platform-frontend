<template>
  <div class="flex min-h-screen flex-col bg-background">
    <AppHeader />

    <main class="flex-1 px-4 py-10 sm:px-6 lg:px-8">
      <div class="mx-auto max-w-5xl">
        <RouterLink to="/user" class="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft class="h-4 w-4" />
          {{ t('mockInterview.backToUser') }}
        </RouterLink>

        <div class="mt-6 grid gap-8 lg:grid-cols-[1fr_0.75fr]">
          <BaseCard class="p-8">
            <h1 class="font-serif text-4xl font-bold text-foreground">{{ t('mockInterview.title') }}</h1>
            <p class="mt-3 text-muted-foreground">
              {{ t('mockInterview.description') }}
            </p>

            <form class="mt-8 space-y-6" @submit.prevent="createInterview">
              <label class="space-y-2 block">
                <span class="block text-sm font-semibold text-foreground">{{ t('mockInterview.technologies') }}</span>
                <div class="grid grid-cols-3 gap-2 sm:grid-cols-4">
                  <button
                    v-for="tech in AVAILABLE_TECHNOLOGIES"
                    :key="tech"
                    type="button"
                    class="rounded-full border px-3 py-2 text-xs font-semibold transition"
                    :class="form.technologies.includes(tech)
                      ? 'border-primary/30 bg-primary/10 text-primary'
                      : 'border-border bg-muted/40 text-muted-foreground hover:border-primary/30'"
                    @click="toggleTechnology(tech)"
                  >
                    {{ formatTechName(tech) }}
                  </button>
                </div>
              </label>

              <div class="grid gap-5 sm:grid-cols-3">
                <label class="space-y-2">
                  <span class="block text-sm font-semibold text-foreground">{{ t('mockInterview.level') }}</span>
                  <select v-model="form.interviewLevel" class="h-12 w-full rounded-full border border-border bg-input px-4 outline-none focus:border-primary">
                    <option value="JUNIOR">Junior</option>
                    <option value="MIDDLE">Middle</option>
                    <option value="SENIOR">Senior</option>
                  </select>
                </label>

                <label class="space-y-2">
                  <span class="block text-sm font-semibold text-foreground">{{ t('mockInterview.minQuestions') }}</span>
                  <input v-model.number="form.minQuestions" type="number" min="1" max="50" class="h-12 w-full rounded-full border border-border bg-input px-4 outline-none focus:border-primary" />
                </label>

                <label class="space-y-2">
                  <span class="block text-sm font-semibold text-foreground">{{ t('mockInterview.maxQuestions') }}</span>
                  <input v-model.number="form.maxQuestions" type="number" min="1" max="50" class="h-12 w-full rounded-full border border-border bg-input px-4 outline-none focus:border-primary" />
                </label>
              </div>

              <div v-if="apiError" class="rounded-[1.5rem] border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">
                {{ apiError }}
              </div>

              <BaseButton size="lg" tag="button" :disabled="isCreating || form.technologies.length === 0">
                {{ isCreating ? t('mockInterview.creating') : t('mockInterview.startInterview') }}
                <ArrowRight class="h-4 w-4" />
              </BaseButton>
            </form>
          </BaseCard>

          <div class="space-y-5">
            <BaseCard class="p-6">
              <h2 class="text-lg font-bold text-foreground">{{ t('mockInterview.whatHappens') }}</h2>
              <ul class="mt-4 space-y-3 text-sm text-muted-foreground">
                <li class="flex gap-2"><CheckCircle2 class="mt-0.5 h-4 w-4 text-success" />{{ t('mockInterview.aiChooses') }}</li>
                <li class="flex gap-2"><CheckCircle2 class="mt-0.5 h-4 w-4 text-success" />{{ t('mockInterview.candidateCompletes') }}</li>
                <li class="flex gap-2"><CheckCircle2 class="mt-0.5 h-4 w-4 text-success" />{{ t('mockInterview.resultsProduce') }}</li>
              </ul>
            </BaseCard>

            <BaseCard class="p-6">
              <h2 class="text-lg font-bold text-foreground">{{ t('mockInterview.tipTitle') }}</h2>
              <div class="mt-4 space-y-3 text-sm text-muted-foreground">
                <p>{{ t('mockInterview.tip1') }}</p>
                <p>{{ t('mockInterview.tip2') }}</p>
              </div>
            </BaseCard>
          </div>
        </div>
      </div>
    </main>

    <AppFooter />
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-vue-next'
import AppFooter from '@/components/AppFooter.vue'
import AppHeader from '@/components/AppHeader.vue'
import BaseButton from '@/components/BaseButton.vue'
import BaseCard from '@/components/BaseCard.vue'
import { createInterview as apiCreateInterview } from '@/api/interview'
import { useAppSession } from '@/composables/useAppSession'
import { useI18n } from '@/i18n'
import type { InterviewLevel } from '@/types/api'

const AVAILABLE_TECHNOLOGIES = [
  'java', 'spring', 'python', 'django', 'fastapi',
  'postgresql', 'hibernate', 'kafka', 'redis',
  'system_design', 'testing', 'devops',
] as const

const router = useRouter()
const { t } = useI18n()
const { userId } = useAppSession()

const isCreating = ref(false)
const apiError = ref('')

const form = reactive({
  technologies: [] as string[],
  interviewLevel: 'MIDDLE' as InterviewLevel,
  minQuestions: 8,
  maxQuestions: 16,
})

function toggleTechnology(tech: string) {
  const idx = form.technologies.indexOf(tech)
  if (idx === -1) {
    form.technologies.push(tech)
  } else {
    form.technologies.splice(idx, 1)
  }
}

function formatTechName(tech: string) {
  return tech.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

async function createInterview() {
  if (form.technologies.length === 0) return

  apiError.value = ''
  isCreating.value = true

  try {
    const response = await apiCreateInterview({
      userId: userId.value,
      minQuestions: form.minQuestions,
      maxQuestions: form.maxQuestions,
      interviewLevel: form.interviewLevel,
      technologyKeys: form.technologies,
    })

    await router.push({
      path: `/candidate/interview/${response.sessionId}`,
      query: { techs: form.technologies.join(','), level: form.interviewLevel },
    })
  } catch (err: any) {
    apiError.value = err?.message || 'Failed to create interview. Please try again.'
  } finally {
    isCreating.value = false
  }
}
</script>
