<template>
  <div class="flex min-h-screen flex-col bg-background">
    <AppHeader />

    <main class="flex flex-1 items-center px-4 py-12 sm:px-6 lg:px-8">
      <div class="mx-auto max-w-2xl text-center">
        <h1 class="text-4xl font-bold text-foreground sm:text-5xl">{{ t('candidateJoin.title') }}</h1>
        <p class="mt-4 text-lg text-muted-foreground">{{ t('candidateJoin.description') }}</p>

        <div class="mt-8">
          <RouterLink to="/user/mock-interview/new">
            <BaseButton size="lg">
              <Play class="h-5 w-5" />
              {{ t('candidateJoin.startInterview') }}
            </BaseButton>
          </RouterLink>
        </div>

        <BaseCard class="mt-12 p-8 text-left">
          <h2 class="font-semibold text-foreground">{{ t('candidateJoin.beforeStart') }}</h2>
          <ul class="mt-4 space-y-3 text-sm text-muted-foreground">
            <li class="flex gap-2"><CheckCircle2 class="mt-0.5 h-4 w-4 text-success" />{{ t('candidateJoin.tipBrowser') }}</li>
            <li class="flex gap-2"><CheckCircle2 class="mt-0.5 h-4 w-4 text-success" />{{ t('candidateJoin.tipQuiet') }}</li>
            <li class="flex gap-2"><CheckCircle2 class="mt-0.5 h-4 w-4 text-success" />{{ t('candidateJoin.tipTech') }}</li>
          </ul>
        </BaseCard>
      </div>
    </main>

    <AppFooter />
  </div>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { CheckCircle2, Play } from 'lucide-vue-next'
import AppFooter from '@/components/AppFooter.vue'
import AppHeader from '@/components/AppHeader.vue'
import BaseButton from '@/components/BaseButton.vue'
import BaseCard from '@/components/BaseCard.vue'
import { useI18n } from '@/i18n'

const { t } = useI18n()
</script>
