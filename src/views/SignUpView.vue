<template>
  <div class="flex min-h-screen flex-col bg-background">
    <AppHeader />

    <main class="flex flex-1 items-center px-4 py-12 sm:px-6 lg:px-8">
      <div class="mx-auto grid w-full max-w-6xl gap-8 lg:grid-cols-[0.8fr_1fr] lg:items-center">
        <BaseCard class="order-2 p-8 lg:order-1">
          <h2 class="text-2xl font-bold text-foreground">{{ t('signUp.cardTitle') }}</h2>
          <p class="mt-3 text-sm leading-relaxed text-muted-foreground">
            {{ t('signUp.cardDescription') }}
          </p>

          <div v-if="!isZitadelConfigured" class="mt-6 rounded-[1.5rem] border border-warning/30 bg-warning/10 p-4 text-sm text-foreground">
            {{ t('signUp.notConfigured') }}
          </div>

          <div v-if="error" class="mt-6 rounded-[1.5rem] border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">
            {{ error }}
          </div>

          <div class="mt-8 space-y-3">
            <BaseButton class="w-full" size="lg" :disabled="!isZitadelConfigured" @click="register">
              <UserPlus class="h-4 w-4" />
              {{ t('signUp.createAccount') }}
            </BaseButton>
            <RouterLink to="/sign-in" class="block">
              <BaseButton class="w-full" size="lg" variant="outline">{{ t('signUp.hasAccount') }}</BaseButton>
            </RouterLink>
          </div>
        </BaseCard>

        <section class="order-1 lg:order-2">
          <p class="text-sm font-semibold uppercase tracking-[0.2em] text-primary">{{ t('signUp.accountSetup') }}</p>
          <h1 class="mt-4 font-serif text-5xl font-bold tracking-tight text-foreground sm:text-6xl">{{ t('signUp.title') }}</h1>
          <p class="mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">
            {{ t('signUp.description') }}
          </p>
        </section>
      </div>
    </main>

    <AppFooter />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { UserPlus } from 'lucide-vue-next'
import AppFooter from '@/components/AppFooter.vue'
import AppHeader from '@/components/AppHeader.vue'
import BaseButton from '@/components/BaseButton.vue'
import BaseCard from '@/components/BaseCard.vue'
import { useAuth } from '@/composables/useAuth'
import { useI18n } from '@/i18n'

const { error, initialize, isZitadelConfigured, register } = useAuth()
const { t } = useI18n()

onMounted(() => {
  void initialize()
})
</script>
