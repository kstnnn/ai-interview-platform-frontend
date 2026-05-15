<template>
  <div v-if="vacancy" class="flex min-h-screen flex-col bg-background">
    <AppHeader />

    <main class="flex-1 px-4 py-10 sm:px-6 lg:px-8">
      <div class="mx-auto max-w-5xl">
        <RouterLink :to="`/vacancies/${vacancy.id}`" class="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft class="h-4 w-4" />
          {{ t('common.back') }}
        </RouterLink>

        <div class="mt-6 grid gap-8 lg:grid-cols-[1fr_0.7fr]">
          <BaseCard class="p-8">
            <h1 class="font-serif text-4xl font-bold text-foreground">{{ t('vacancyApply.title') }}</h1>
            <p class="mt-3 text-muted-foreground">{{ t('vacancyApply.subtitle') }}</p>

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

              <BaseButton size="lg" tag="button">
                {{ t('vacancyApply.submit') }}
                <ArrowRight class="h-4 w-4" />
              </BaseButton>
            </form>
          </BaseCard>

          <div class="space-y-5">
            <BaseCard class="p-6">
              <h2 class="text-xl font-bold text-foreground">{{ vacancy.title }}</h2>
              <p class="mt-2 text-sm text-muted-foreground">{{ vacancy.organizationName }} · {{ vacancy.location }}</p>
              <div class="mt-5 flex flex-wrap gap-2">
                <span v-for="item in vacancy.stack" :key="item" class="rounded-full border border-border px-3 py-1 text-xs font-semibold">{{ item }}</span>
              </div>
            </BaseCard>
            <BaseCard class="p-6">
              <h2 class="text-lg font-bold text-foreground">{{ t('vacancyApply.afterSubmit') }}</h2>
              <p class="mt-3 text-sm leading-relaxed text-muted-foreground">
                {{ locale === 'ru' ? 'После backend-интеграции здесь будет создаваться interview invite. Сейчас кнопка переводит в существующую демо-сессию.' : 'After backend integration this will create an interview invite. For now the form routes to an existing demo session.' }}
              </p>
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
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { ArrowLeft, ArrowRight } from 'lucide-vue-next'
import AppFooter from '@/components/AppFooter.vue'
import AppHeader from '@/components/AppHeader.vue'
import BaseButton from '@/components/BaseButton.vue'
import BaseCard from '@/components/BaseCard.vue'
import { getVacancyById } from '@/data/mock-data'
import { useI18n } from '@/i18n'

const route = useRoute()
const router = useRouter()
const { locale, t } = useI18n()
const vacancy = getVacancyById(String(route.params.vacancyId ?? ''))
const form = reactive({
  name: '',
  email: '',
  profile: '',
  note: '',
})

function submitApplication() {
  void router.push('/candidate/interview/session-004')
}
</script>
