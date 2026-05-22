<template>
  <div class="flex min-h-screen flex-col bg-background">
    <AppHeader />

    <main class="flex-1 px-4 py-10 sm:px-6 lg:px-8">
      <div class="mx-auto max-w-6xl">
        <RouterLink to="/business/vacancies" class="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft class="h-4 w-4" />
          {{ t('vacancyBuilder.backToVacancies') }}
        </RouterLink>

        <div class="mt-6 grid gap-8 lg:grid-cols-[1fr_0.7fr]">
          <BaseCard class="p-8">
            <h1 class="font-serif text-4xl font-bold text-foreground">{{ t('vacancyBuilder.title') }}</h1>
            <p class="mt-3 text-muted-foreground">
              {{ t('vacancyBuilder.description') }}
            </p>

            <form class="mt-8 space-y-6">
              <div class="grid gap-5 sm:grid-cols-2">
                <label class="space-y-2">
                  <span class="block text-sm font-semibold text-foreground">{{ t('vacancyBuilder.roleTitle') }}</span>
                  <input v-model="form.title" class="h-12 w-full rounded-full border border-border bg-input px-4 outline-none focus:border-primary" />
                </label>
                <label class="space-y-2">
                  <span class="block text-sm font-semibold text-foreground">{{ t('vacancyBuilder.department') }}</span>
                  <input v-model="form.department" class="h-12 w-full rounded-full border border-border bg-input px-4 outline-none focus:border-primary" />
                </label>
              </div>

              <div class="grid gap-5 sm:grid-cols-2">
                <label class="space-y-2">
                  <span class="block text-sm font-semibold text-foreground">{{ t('vacancyBuilder.level') }}</span>
                  <select v-model="form.level" class="h-12 w-full rounded-full border border-border bg-input px-4 outline-none focus:border-primary">
                    <option>Junior</option>
                    <option>Mid</option>
                    <option>Senior</option>
                    <option>Lead</option>
                  </select>
                </label>
                <label class="space-y-2">
                  <span class="block text-sm font-semibold text-foreground">{{ t('vacancyBuilder.interviewDuration') }}</span>
                  <select v-model="form.duration" class="h-12 w-full rounded-full border border-border bg-input px-4 outline-none focus:border-primary">
                    <option>45 {{ t('common.minutes') }}</option>
                    <option>60 {{ t('common.minutes') }}</option>
                    <option>75 {{ t('common.minutes') }}</option>
                    <option>90 {{ t('common.minutes') }}</option>
                  </select>
                </label>
              </div>

              <label class="space-y-2 block">
                <span class="block text-sm font-semibold text-foreground">{{ t('vacancyBuilder.stack') }}</span>
                <input v-model="form.stack" class="h-12 w-full rounded-full border border-border bg-input px-4 outline-none focus:border-primary" />
                <p class="text-xs text-muted-foreground">{{ t('vacancyBuilder.stackHint') }}</p>
              </label>

              <label class="space-y-2 block">
                <span class="block text-sm font-semibold text-foreground">{{ t('vacancyBuilder.requiredSkills') }}</span>
                <textarea v-model="form.skills" rows="3" class="w-full rounded-[1.5rem] border border-border bg-input px-4 py-3 outline-none focus:border-primary"></textarea>
              </label>

              <div class="rounded-[1.5rem] border border-border/60 p-5">
                <div class="flex items-start justify-between gap-4">
                  <div>
                    <h2 class="font-bold text-foreground">{{ t('vacancyBuilder.questionsTitle') }}</h2>
                    <p class="mt-1 text-sm text-muted-foreground">{{ t('vacancyBuilder.questionsDesc') }}</p>
                  </div>
                  <BaseButton type="button" variant="outline" size="sm">{{ t('vacancyBuilder.addQuestion') }}</BaseButton>
                </div>
                <div class="mt-4 space-y-3">
                  <textarea v-model="form.question" rows="3" class="w-full rounded-[1.5rem] border border-border bg-input px-4 py-3 outline-none focus:border-primary" :placeholder="t('vacancyBuilder.questionPlaceholder')"></textarea>
                </div>
              </div>

              <div class="flex flex-col gap-3 sm:flex-row">
                <BaseButton tag="button" type="button">{{ t('common.saveDraft') }}</BaseButton>
                <BaseButton tag="button" type="button" variant="outline">{{ t('common.publishLater') }}</BaseButton>
              </div>
            </form>
          </BaseCard>

          <div class="space-y-5">
            <BaseCard class="p-6">
              <h2 class="text-lg font-bold text-foreground">{{ t('vacancyBuilder.questionStrategyTitle') }}</h2>
              <div class="mt-4 space-y-4 text-sm text-muted-foreground">
                <p><strong class="text-foreground">{{ t('vacancyBuilder.questionStrategyWith') }}</strong></p>
                <p><strong class="text-foreground">{{ t('vacancyBuilder.questionStrategyWithout') }}</strong></p>
              </div>
            </BaseCard>

            <BaseCard class="p-6">
              <h2 class="text-lg font-bold text-foreground">{{ t('vacancyBuilder.payloadTitle') }}</h2>
              <div class="mt-4 rounded-[1.5rem] bg-muted/50 p-4 font-mono text-xs leading-relaxed text-muted-foreground">
                POST /organizations/:id/vacancies<br />
                title, stack, skills, questions, duration
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
import { reactive } from 'vue'
import { RouterLink } from 'vue-router'
import { ArrowLeft } from 'lucide-vue-next'
import AppFooter from '@/components/AppFooter.vue'
import AppHeader from '@/components/AppHeader.vue'
import BaseButton from '@/components/BaseButton.vue'
import BaseCard from '@/components/BaseCard.vue'
import { useI18n } from '@/i18n'

const { t } = useI18n()

const form = reactive({
  title: 'Senior Full-Stack Engineer',
  department: 'Core Platform',
  level: 'Senior',
  duration: '75 minutes',
  stack: 'Vue, Node.js, PostgreSQL, AWS',
  skills: 'System design, API architecture, frontend performance',
  question: '',
})
</script>
