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

            <form class="mt-8 space-y-6" @submit.prevent="startDemoInterview">
              <div class="grid gap-5 sm:grid-cols-2">
                <label class="space-y-2">
                  <span class="block text-sm font-semibold text-foreground">{{ t('mockInterview.primaryStack') }}</span>
                  <select v-model="form.stack" class="h-12 w-full rounded-full border border-border bg-input px-4 outline-none focus:border-primary">
                    <option>Vue + TypeScript</option>
                    <option>React + Node.js</option>
                    <option>Java + Spring Boot</option>
                    <option>Python + FastAPI</option>
                  </select>
                </label>

                <label class="space-y-2">
                  <span class="block text-sm font-semibold text-foreground">{{ t('mockInterview.level') }}</span>
                  <select v-model="form.level" class="h-12 w-full rounded-full border border-border bg-input px-4 outline-none focus:border-primary">
                    <option>Junior</option>
                    <option>Mid</option>
                    <option>Senior</option>
                    <option>Lead</option>
                  </select>
                </label>
              </div>

              <label class="space-y-2 block">
                <span class="block text-sm font-semibold text-foreground">{{ t('mockInterview.focus') }}</span>
                <textarea v-model="form.focus" rows="4" class="w-full rounded-[1.5rem] border border-border bg-input px-4 py-3 outline-none focus:border-primary" :placeholder="t('mockInterview.focusPlaceholder')"></textarea>
              </label>

              <div class="grid gap-5 sm:grid-cols-2">
                <label class="space-y-2">
                  <span class="block text-sm font-semibold text-foreground">{{ t('mockInterview.duration') }}</span>
                  <select v-model="form.duration" class="h-12 w-full rounded-full border border-border bg-input px-4 outline-none focus:border-primary">
                    <option>30 {{ t('common.minutes') }}</option>
                    <option>45 {{ t('common.minutes') }}</option>
                    <option>60 {{ t('common.minutes') }}</option>
                    <option>75 {{ t('common.minutes') }}</option>
                  </select>
                </label>

                <label class="space-y-2">
                  <span class="block text-sm font-semibold text-foreground">{{ t('mockInterview.mode') }}</span>
                  <select v-model="form.mode" class="h-12 w-full rounded-full border border-border bg-input px-4 outline-none focus:border-primary">
                    <option>Voice interview</option>
                    <option>Text interview</option>
                    <option>Mixed practice</option>
                  </select>
                </label>
              </div>

              <BaseButton size="lg" tag="button">
                {{ t('mockInterview.continue') }}
                <ArrowRight class="h-4 w-4" />
              </BaseButton>
            </form>
          </BaseCard>

          <div class="space-y-5">
            <BaseCard class="p-6">
              <h2 class="text-lg font-bold text-foreground">{{ t('mockInterview.backendPreview') }}</h2>
              <div class="mt-4 rounded-[1.5rem] bg-muted/50 p-4 font-mono text-xs leading-relaxed text-muted-foreground">
                POST /mock-interviews<br />
                stack, level, duration, focus, mode
              </div>
            </BaseCard>

            <BaseCard class="p-6">
              <h2 class="text-lg font-bold text-foreground">{{ t('mockInterview.whatHappens') }}</h2>
              <ul class="mt-4 space-y-3 text-sm text-muted-foreground">
                <li class="flex gap-2"><CheckCircle2 class="mt-0.5 h-4 w-4 text-success" />{{ t('mockInterview.aiChooses') }}</li>
                <li class="flex gap-2"><CheckCircle2 class="mt-0.5 h-4 w-4 text-success" />{{ t('mockInterview.candidateCompletes') }}</li>
                <li class="flex gap-2"><CheckCircle2 class="mt-0.5 h-4 w-4 text-success" />{{ t('mockInterview.resultsProduce') }}</li>
              </ul>
            </BaseCard>
          </div>
        </div>
      </div>
    </main>

    <AppFooter />
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-vue-next'
import AppFooter from '@/components/AppFooter.vue'
import AppHeader from '@/components/AppHeader.vue'
import BaseButton from '@/components/BaseButton.vue'
import BaseCard from '@/components/BaseCard.vue'
import { useI18n } from '@/i18n'

const router = useRouter()
const { t } = useI18n()
const form = reactive({
  stack: 'Vue + TypeScript',
  level: 'Mid',
  focus: 'Frontend architecture and practical debugging',
  duration: '45 minutes',
  mode: 'Voice interview',
})

function startDemoInterview() {
  void router.push('/candidate/interview/session-003')
}
</script>
