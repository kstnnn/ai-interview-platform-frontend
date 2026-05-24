<template>
  <footer class="border-t border-border/30 bg-muted/10">
    <div class="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div class="grid gap-10 sm:grid-cols-3">
        <div>
          <h3 class="font-serif text-lg font-bold text-foreground">TechScreen</h3>
          <p class="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
            {{ t('footer.description') }}
          </p>
        </div>

        <div>
          <h4 class="font-serif font-bold text-foreground">{{ t('footer.product') }}</h4>
          <ul class="mt-4 space-y-2 text-sm text-muted-foreground">
            <li>
              <RouterLink to="/vacancies">{{ t('nav.vacancies') }}</RouterLink>
            </li>
            <li>
              <RouterLink to="/user">{{ t('nav.workspace') }}</RouterLink>
            </li>
            <li>
              <RouterLink to="/user/mock-interview/new">{{ t('nav.practice') }}</RouterLink>
            </li>
            <li>
              <RouterLink to="/user/roadmap">{{ t('nav.roadmap') }}</RouterLink>
            </li>
            <li>
              <RouterLink to="/business">{{ t('nav.business') }}</RouterLink>
            </li>
          </ul>
        </div>

        <div>
          <h4 class="font-serif font-bold text-foreground">{{ t('footer.status') }}</h4>
          <p class="mt-4 text-sm leading-relaxed text-muted-foreground">
            {{ t('footer.statusText') }}
          </p>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { useI18n } from '@/i18n'

const { t } = useI18n()
</script>
