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
        <RouterLink v-for="item in navItems" :key="item.to" :to="item.to" class="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
          {{ t(item.labelKey) }}
        </RouterLink>
      </nav>

      <div class="flex items-center gap-2">
        <LanguageSwitcher />
        <RouterLink v-if="!isAuthenticated" to="/sign-in">
          <BaseButton variant="outline" size="sm">Sign in</BaseButton>
        </RouterLink>
        <RouterLink v-if="!isAuthenticated" to="/sign-up">
          <BaseButton size="sm">Sign up</BaseButton>
        </RouterLink>
        <RouterLink v-if="isAuthenticated" :to="profileRoute" class="hidden text-sm font-semibold text-foreground sm:inline-flex">
          {{ displayName }}
        </RouterLink>
        <RouterLink v-if="isAuthenticated" to="/auth/logout">
          <BaseButton variant="outline" size="sm">Sign out</BaseButton>
        </RouterLink>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { ClipboardCheck } from 'lucide-vue-next'
import BaseButton from '@/components/BaseButton.vue'
import LanguageSwitcher from '@/components/LanguageSwitcher.vue'
import { useAuth } from '@/composables/useAuth'
import { getDefaultWorkspaceRoute, useAppSession } from '@/composables/useAppSession'
import { useI18n } from '@/i18n'

type NavLabelKey = 'nav.features' | 'nav.vacancies' | 'nav.practice' | 'nav.roadmap' | 'nav.workspace' | 'nav.business' | 'nav.publicVacancies' | 'nav.admin' | 'nav.adminUsers' | 'nav.adminQuestions'

type NavItem = {
  labelKey: NavLabelKey
  to: string
}

const { t } = useI18n()
const { displayName, initializeAuthState, isAuthenticated } = useAuth()
const { isAdmin, userStatus, userType } = useAppSession()

const isBlockedAccount = computed(() => userStatus.value === 'BLOCKED' || userStatus.value === 'DELETED')
const profileRoute = computed(() => {
  if (isBlockedAccount.value) return '/blocked'
  return isAdmin.value ? '/admin' : getDefaultWorkspaceRoute(userType.value)
})
const navItems = computed<NavItem[]>(() => {
  if (!isAuthenticated.value) {
    return [
      { labelKey: 'nav.features', to: '/#features' },
      { labelKey: 'nav.vacancies', to: '/vacancies' },
    ]
  }

  if (isBlockedAccount.value) {
    return []
  }

  if (isAdmin.value) {
    return [
      { labelKey: 'nav.adminUsers', to: '/admin/users' },
      { labelKey: 'nav.adminQuestions', to: '/admin/questions' },
      { labelKey: 'nav.publicVacancies', to: '/vacancies' },
    ]
  }

  if (userType.value === 'BUSINESS') {
    return [
      { labelKey: 'nav.business', to: '/business' },
      { labelKey: 'nav.vacancies', to: '/business/vacancies' },
      { labelKey: 'nav.publicVacancies', to: '/vacancies' },
    ]
  }

  return [
    { labelKey: 'nav.workspace', to: '/user' },
    { labelKey: 'nav.practice', to: '/user/mock-interview/new' },
    { labelKey: 'nav.roadmap', to: '/user/roadmap' },
    { labelKey: 'nav.vacancies', to: '/vacancies' },
  ]
})

void initializeAuthState()
</script>
