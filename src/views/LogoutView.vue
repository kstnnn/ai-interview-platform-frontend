<template>
  <div class="flex min-h-screen items-center justify-center bg-background px-4 text-center">
    <BaseCard class="max-w-md p-8">
      <LoaderCircle class="mx-auto h-8 w-8 animate-spin text-primary" />
      <h1 class="mt-5 text-2xl font-bold text-foreground">Signing out</h1>
      <p class="mt-3 text-sm leading-relaxed text-muted-foreground">Redirecting to secure logout.</p>
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
const { isZitadelConfigured, logout } = useAuth()

onMounted(async () => {
  if (!isZitadelConfigured) {
    await router.replace('/')
    return
  }

  await logout()
})
</script>
