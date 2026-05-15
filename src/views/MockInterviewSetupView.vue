<template>
  <div class="flex min-h-screen flex-col bg-background">
    <AppHeader />

    <main class="flex-1 px-4 py-10 sm:px-6 lg:px-8">
      <div class="mx-auto max-w-5xl">
        <RouterLink to="/user" class="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft class="h-4 w-4" />
          Back to user workspace
        </RouterLink>

        <div class="mt-6 grid gap-8 lg:grid-cols-[1fr_0.75fr]">
          <BaseCard class="p-8">
            <h1 class="font-serif text-4xl font-bold text-foreground">Create a mock interview</h1>
            <p class="mt-3 text-muted-foreground">
              This is a frontend-only setup screen. Later it can submit stack, level, focus, and duration to your backend before opening an interview session.
            </p>

            <form class="mt-8 space-y-6" @submit.prevent="startDemoInterview">
              <div class="grid gap-5 sm:grid-cols-2">
                <label class="space-y-2">
                  <span class="block text-sm font-semibold text-foreground">Primary stack</span>
                  <select v-model="form.stack" class="h-12 w-full rounded-full border border-border bg-input px-4 outline-none focus:border-primary">
                    <option>Vue + TypeScript</option>
                    <option>React + Node.js</option>
                    <option>Java + Spring Boot</option>
                    <option>Python + FastAPI</option>
                  </select>
                </label>

                <label class="space-y-2">
                  <span class="block text-sm font-semibold text-foreground">Level</span>
                  <select v-model="form.level" class="h-12 w-full rounded-full border border-border bg-input px-4 outline-none focus:border-primary">
                    <option>Junior</option>
                    <option>Mid</option>
                    <option>Senior</option>
                    <option>Lead</option>
                  </select>
                </label>
              </div>

              <label class="space-y-2 block">
                <span class="block text-sm font-semibold text-foreground">Interview focus</span>
                <textarea v-model="form.focus" rows="4" class="w-full rounded-[1.5rem] border border-border bg-input px-4 py-3 outline-none focus:border-primary" placeholder="Example: frontend architecture, system design, async communication"></textarea>
              </label>

              <div class="grid gap-5 sm:grid-cols-2">
                <label class="space-y-2">
                  <span class="block text-sm font-semibold text-foreground">Duration</span>
                  <select v-model="form.duration" class="h-12 w-full rounded-full border border-border bg-input px-4 outline-none focus:border-primary">
                    <option>30 minutes</option>
                    <option>45 minutes</option>
                    <option>60 minutes</option>
                    <option>75 minutes</option>
                  </select>
                </label>

                <label class="space-y-2">
                  <span class="block text-sm font-semibold text-foreground">Mode</span>
                  <select v-model="form.mode" class="h-12 w-full rounded-full border border-border bg-input px-4 outline-none focus:border-primary">
                    <option>Voice interview</option>
                    <option>Text interview</option>
                    <option>Mixed practice</option>
                  </select>
                </label>
              </div>

              <BaseButton size="lg" tag="button">
                Continue to interview demo
                <ArrowRight class="h-4 w-4" />
              </BaseButton>
            </form>
          </BaseCard>

          <div class="space-y-5">
            <BaseCard class="p-6">
              <h2 class="text-lg font-bold text-foreground">Backend shape preview</h2>
              <div class="mt-4 rounded-[1.5rem] bg-muted/50 p-4 font-mono text-xs leading-relaxed text-muted-foreground">
                POST /mock-interviews<br />
                stack, level, duration, focus, mode
              </div>
            </BaseCard>

            <BaseCard class="p-6">
              <h2 class="text-lg font-bold text-foreground">What happens after</h2>
              <ul class="mt-4 space-y-3 text-sm text-muted-foreground">
                <li class="flex gap-2"><CheckCircle2 class="mt-0.5 h-4 w-4 text-success" />AI chooses questions from the question bank.</li>
                <li class="flex gap-2"><CheckCircle2 class="mt-0.5 h-4 w-4 text-success" />Candidate completes the interview flow.</li>
                <li class="flex gap-2"><CheckCircle2 class="mt-0.5 h-4 w-4 text-success" />Results produce feedback, resources, and a roadmap.</li>
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

const router = useRouter()
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
