<template>
  <header class="sticky top-0 z-50 border-b border-border/30 bg-background/80 backdrop-blur-md">
    <div class="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
      <RouterLink to="/" class="flex items-center gap-3">
        <div class="flex h-10 w-10 items-center justify-center rounded-organic bg-primary text-primary-foreground shadow-soft">
          <ClipboardCheck class="h-5 w-5" />
        </div>
        <span class="hidden font-serif text-lg font-bold text-foreground sm:inline">TechScreen</span>
      </RouterLink>

      <nav class="hidden items-center gap-6 lg:flex">
        <a href="/#features" class="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">{{ t('nav.features') }}</a>
        <RouterLink to="/vacancies" class="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">{{ t('nav.vacancies') }}</RouterLink>
        <RouterLink to="/user" class="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">{{ t('nav.users') }}</RouterLink>
        <RouterLink to="/business" class="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">{{ t('nav.business') }}</RouterLink>
        <RouterLink to="/dashboard" class="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">{{ t('nav.sessions') }}</RouterLink>
        <RouterLink to="/candidate/join" class="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">{{ t('nav.join') }}</RouterLink>
      </nav>

      <div class="flex items-center gap-2">
        <LanguageSwitcher />
        <RouterLink to="/user">
          <BaseButton variant="outline" size="sm">{{ t('nav.practice') }}</BaseButton>
        </RouterLink>
        <RouterLink to="/business">
          <BaseButton size="sm">{{ t('nav.business') }}</BaseButton>
        </RouterLink>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { ClipboardCheck } from 'lucide-vue-next'
import BaseButton from '@/components/BaseButton.vue'
import LanguageSwitcher from '@/components/LanguageSwitcher.vue'
import { useI18n } from '@/i18n'

const { t } = useI18n()
</script>
