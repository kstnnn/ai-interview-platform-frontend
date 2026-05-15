<template>
  <div class="flex min-h-screen flex-col bg-background">
    <AppHeader />

    <main class="flex-1 px-4 py-10 sm:px-6 lg:px-8">
      <div class="mx-auto max-w-6xl">
        <RouterLink to="/business/vacancies" class="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft class="h-4 w-4" />
          Back to vacancies
        </RouterLink>

        <div class="mt-6 grid gap-8 lg:grid-cols-[1fr_0.7fr]">
          <BaseCard class="p-8">
            <h1 class="font-serif text-4xl font-bold text-foreground">Create vacancy</h1>
            <p class="mt-3 text-muted-foreground">
              Define the role shape now. Backend integration can later persist this and generate candidate interview sessions from it.
            </p>

            <form class="mt-8 space-y-6">
              <div class="grid gap-5 sm:grid-cols-2">
                <label class="space-y-2">
                  <span class="block text-sm font-semibold text-foreground">Role title</span>
                  <input v-model="form.title" class="h-12 w-full rounded-full border border-border bg-input px-4 outline-none focus:border-primary" />
                </label>
                <label class="space-y-2">
                  <span class="block text-sm font-semibold text-foreground">Department</span>
                  <input v-model="form.department" class="h-12 w-full rounded-full border border-border bg-input px-4 outline-none focus:border-primary" />
                </label>
              </div>

              <div class="grid gap-5 sm:grid-cols-2">
                <label class="space-y-2">
                  <span class="block text-sm font-semibold text-foreground">Level</span>
                  <select v-model="form.level" class="h-12 w-full rounded-full border border-border bg-input px-4 outline-none focus:border-primary">
                    <option>Junior</option>
                    <option>Mid</option>
                    <option>Senior</option>
                    <option>Lead</option>
                  </select>
                </label>
                <label class="space-y-2">
                  <span class="block text-sm font-semibold text-foreground">Interview duration</span>
                  <select v-model="form.duration" class="h-12 w-full rounded-full border border-border bg-input px-4 outline-none focus:border-primary">
                    <option>45 minutes</option>
                    <option>60 minutes</option>
                    <option>75 minutes</option>
                    <option>90 minutes</option>
                  </select>
                </label>
              </div>

              <label class="space-y-2 block">
                <span class="block text-sm font-semibold text-foreground">Stack</span>
                <input v-model="form.stack" class="h-12 w-full rounded-full border border-border bg-input px-4 outline-none focus:border-primary" />
                <p class="text-xs text-muted-foreground">Comma-separated for now. Later this can become a normalized skill selector.</p>
              </label>

              <label class="space-y-2 block">
                <span class="block text-sm font-semibold text-foreground">Required skills</span>
                <textarea v-model="form.skills" rows="3" class="w-full rounded-[1.5rem] border border-border bg-input px-4 py-3 outline-none focus:border-primary"></textarea>
              </label>

              <div class="rounded-[1.5rem] border border-border/60 p-5">
                <div class="flex items-start justify-between gap-4">
                  <div>
                    <h2 class="font-bold text-foreground">Optional company questions</h2>
                    <p class="mt-1 text-sm text-muted-foreground">If empty, AI will use only questions from your database/question bank.</p>
                  </div>
                  <BaseButton type="button" variant="outline" size="sm">Add question</BaseButton>
                </div>
                <div class="mt-4 space-y-3">
                  <textarea v-model="form.question" rows="3" class="w-full rounded-[1.5rem] border border-border bg-input px-4 py-3 outline-none focus:border-primary" placeholder="Example: Ask candidate to design tenant isolation for our SaaS analytics module."></textarea>
                </div>
              </div>

              <div class="flex flex-col gap-3 sm:flex-row">
                <BaseButton tag="button" type="button">Save draft</BaseButton>
                <BaseButton tag="button" type="button" variant="outline">Publish later</BaseButton>
              </div>
            </form>
          </BaseCard>

          <div class="space-y-5">
            <BaseCard class="p-6">
              <h2 class="text-lg font-bold text-foreground">Question strategy</h2>
              <div class="mt-4 space-y-4 text-sm text-muted-foreground">
                <p><strong class="text-foreground">With custom questions:</strong> AI mixes company questions with bank questions matched to stack and level.</p>
                <p><strong class="text-foreground">Without custom questions:</strong> AI uses only your database question bank.</p>
              </div>
            </BaseCard>

            <BaseCard class="p-6">
              <h2 class="text-lg font-bold text-foreground">Future payload</h2>
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
