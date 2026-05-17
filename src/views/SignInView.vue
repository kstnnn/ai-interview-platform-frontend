<template>
  <div class="flex min-h-screen flex-col bg-background">
    <AppHeader />

    <main class="flex flex-1 items-center px-4 py-12 sm:px-6 lg:px-8">
      <div class="mx-auto grid w-full max-w-6xl gap-8 lg:grid-cols-[1fr_0.8fr] lg:items-center">
        <section>
          <p class="text-sm font-semibold uppercase tracking-[0.2em] text-primary">Secure access</p>
          <h1 class="mt-4 font-serif text-5xl font-bold tracking-tight text-foreground sm:text-6xl">Sign in securely</h1>
          <p class="mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">
            Authentication is handled by secure hosted login. This frontend never handles user passwords directly.
          </p>
        </section>

        <BaseCard class="p-8">
          <h2 class="text-2xl font-bold text-foreground">Continue to your workspace</h2>
          <p class="mt-3 text-sm leading-relaxed text-muted-foreground">
            After login the app can later ask your backend `/me` endpoint which workspace to open: user, business, or candidate.
          </p>

          <div v-if="!isZitadelConfigured" class="mt-6 rounded-[1.5rem] border border-warning/30 bg-warning/10 p-4 text-sm text-foreground">
            Authentication is not configured yet. Add auth environment variables to `.env.local` before using real login.
          </div>

          <div v-if="error" class="mt-6 rounded-[1.5rem] border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">
            {{ error }}
          </div>

          <div class="mt-8 space-y-3">
            <BaseButton class="w-full" size="lg" :disabled="!isZitadelConfigured" @click="startLogin">
              <LogIn class="h-4 w-4" />
              Continue
            </BaseButton>
            <RouterLink to="/sign-up" class="block">
              <BaseButton class="w-full" size="lg" variant="outline">Create account</BaseButton>
            </RouterLink>
          </div>
        </BaseCard>
      </div>
    </main>

    <AppFooter />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { LogIn } from 'lucide-vue-next'
import AppFooter from '@/components/AppFooter.vue'
import AppHeader from '@/components/AppHeader.vue'
import BaseButton from '@/components/BaseButton.vue'
import BaseCard from '@/components/BaseCard.vue'
import { useAuth } from '@/composables/useAuth'

const route = useRoute()
const { error, initialize, isZitadelConfigured, login } = useAuth()

onMounted(() => {
  void initialize()
})

function startLogin() {
  const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : undefined
  void login(redirect)
}
</script>
