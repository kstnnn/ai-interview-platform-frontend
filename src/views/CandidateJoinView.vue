<template>
  <div class="flex min-h-screen flex-col bg-background">
    <AppHeader />

    <main class="flex-1 px-4 py-12 sm:px-6 lg:px-8">
      <div class="mx-auto max-w-2xl">
        <div class="mb-8 text-center">
          <h1 class="text-3xl font-bold text-foreground sm:text-4xl">Join Your Interview</h1>
          <p class="mt-2 text-muted-foreground">This page now does frontend validation only and no longer pretends there is a server session verification flow.</p>
        </div>

        <BaseCard class="p-8">
          <form class="space-y-6" @submit.prevent="handleSubmit">
            <div class="space-y-2">
              <label for="sessionCode" class="block text-sm font-semibold text-foreground">Session Code</label>
              <input
                id="sessionCode"
                v-model="form.sessionCode"
                type="text"
                placeholder="e.g. ABC123XYZ"
                class="h-12 w-full rounded-full border border-border bg-input px-4 font-mono uppercase outline-none transition focus:border-primary"
              />
              <p class="text-xs text-muted-foreground">Available demo code: `ABC123XYZ`</p>
            </div>

            <div class="space-y-2">
              <label for="name" class="block text-sm font-semibold text-foreground">Full Name</label>
              <input
                id="name"
                v-model="form.name"
                type="text"
                placeholder="John Doe"
                class="h-12 w-full rounded-full border border-border bg-input px-4 outline-none transition focus:border-primary"
              />
            </div>

            <div class="space-y-2">
              <label for="email" class="block text-sm font-semibold text-foreground">Email Address</label>
              <input
                id="email"
                v-model="form.email"
                type="email"
                placeholder="john@example.com"
                class="h-12 w-full rounded-full border border-border bg-input px-4 outline-none transition focus:border-primary"
              />
            </div>

            <div v-if="error" class="rounded-organic border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">
              {{ error }}
            </div>

            <BaseButton size="lg" tag="button" class="w-full">
              Start Interview
              <ArrowRight class="h-4 w-4" />
            </BaseButton>
          </form>

          <div class="mt-8 border-t border-border pt-8">
            <h2 class="font-semibold text-foreground">Before you start</h2>
            <ul class="mt-4 space-y-3 text-sm text-muted-foreground">
              <li class="flex gap-2"><CheckCircle2 class="mt-0.5 h-4 w-4 text-success" />Use Chrome or Edge if you want speech recognition.</li>
              <li class="flex gap-2"><CheckCircle2 class="mt-0.5 h-4 w-4 text-success" />Pick a quiet room because the interview page listens through the browser microphone.</li>
              <li class="flex gap-2"><CheckCircle2 class="mt-0.5 h-4 w-4 text-success" />This is a frontend-only demo until your real backend endpoints are ready.</li>
            </ul>
          </div>
        </BaseCard>
      </div>
    </main>

    <AppFooter />
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowRight, CheckCircle2 } from 'lucide-vue-next'
import AppFooter from '@/components/AppFooter.vue'
import AppHeader from '@/components/AppHeader.vue'
import BaseButton from '@/components/BaseButton.vue'
import BaseCard from '@/components/BaseCard.vue'
import { getSessionByCode } from '@/data/mock-data'

const router = useRouter()
const error = ref('')
const form = reactive({
  sessionCode: '',
  name: '',
  email: '',
})

function handleSubmit() {
  error.value = ''

  if (!form.sessionCode || !form.name || !form.email) {
    error.value = 'Fill in session code, name, and email before continuing.'
    return
  }

  const session = getSessionByCode(form.sessionCode.toUpperCase())
  if (!session) {
    error.value = 'Unknown session code. For the current demo use ABC123XYZ.'
    return
  }

  void router.push(`/candidate/interview/${session.id}`)
}
</script>
