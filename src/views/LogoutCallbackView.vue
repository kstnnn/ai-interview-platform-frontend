<template>
  <div class="flex min-h-screen items-center justify-center bg-background px-4 text-center">
    <BaseCard class="max-w-md p-8">
      <LoaderCircle v-if="isLoading" class="mx-auto h-8 w-8 animate-spin text-primary" />
      <h1 class="mt-5 text-2xl font-bold text-foreground">Signed out</h1>
      <p class="mt-3 text-sm leading-relaxed text-muted-foreground">Your Zitadel session has ended. Redirecting home.</p>

      <div v-if="error" class="mt-6 rounded-[1.5rem] border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">
        {{ error }}
      </div>
    </BaseCard>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { LoaderCircle } from 'lucide-vue-next'
import BaseCard from '@/components/BaseCard.vue'
import { useAuth } from '@/composables/useAuth'

const router = useRouter()
const { completeLogout, error, isLoading } = useAuth()

onMounted(async () => {
  try {
    await completeLogout()
  } finally {
    window.setTimeout(() => {
      void router.replace('/')
    }, 1000)
  }
})
</script>
