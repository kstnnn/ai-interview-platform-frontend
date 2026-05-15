<template>
  <label class="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-2 text-xs font-semibold text-muted-foreground">
    <span class="sr-only">{{ t('nav.language') }}</span>
    <Globe2 class="h-4 w-4" />
    <select :value="locale" class="bg-transparent outline-none" @change="handleChange">
      <option value="en">EN</option>
      <option value="ru">RU</option>
    </select>
  </label>
</template>

<script setup lang="ts">
import { Globe2 } from 'lucide-vue-next'
import { useI18n, type Locale } from '@/i18n'

const { locale, setLocale, t } = useI18n()

function handleChange(event: Event) {
  const value = (event.target as HTMLSelectElement).value
  if (value === 'en' || value === 'ru') {
    setLocale(value as Locale)
  }
}
</script>
