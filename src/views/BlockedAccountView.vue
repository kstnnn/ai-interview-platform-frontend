<template>
  <div class="flex min-h-screen flex-col bg-background">
    <AppHeader />

    <main class="flex flex-1 items-center justify-center px-4 py-12 text-center sm:px-6 lg:px-8">
      <BaseCard class="max-w-lg p-8">
        <div class="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <Ban class="h-7 w-7" />
        </div>
        <h1 class="mt-6 text-3xl font-bold text-foreground">{{ t('blocked.title') }}</h1>
        <p class="mt-4 leading-relaxed text-muted-foreground">{{ t('blocked.description') }}</p>
        <p v-if="message" class="mt-4 rounded-[1.5rem] bg-muted/50 p-4 text-sm text-muted-foreground">{{ message }}</p>
        <div class="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <BaseButton :disabled="isChecking" @click="checkAccess">
            {{ isChecking ? t('blocked.checking') : t('blocked.checkAgain') }}
          </BaseButton>
          <RouterLink to="/auth/logout">
            <BaseButton variant="outline">{{ t('blocked.signOut') }}</BaseButton>
          </RouterLink>
          <RouterLink to="/">
            <BaseButton variant="ghost">{{ t('blocked.home') }}</BaseButton>
          </RouterLink>
        </div>
      </BaseCard>
    </main>

    <AppFooter />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { Ban } from 'lucide-vue-next'
import { getCurrentUser } from '@/auth/zitadel'
import AppFooter from '@/components/AppFooter.vue'
import AppHeader from '@/components/AppHeader.vue'
import BaseButton from '@/components/BaseButton.vue'
import BaseCard from '@/components/BaseCard.vue'
import { getDefaultRouteForSession, loadAppSession, useAppSession } from '@/composables/useAppSession'
import { useI18n } from '@/i18n'

const { t } = useI18n()
const router = useRouter()
const { roles } = useAppSession()
const isChecking = ref(false)
const message = ref('')

async function checkAccess() {
  isChecking.value = true
  message.value = ''
  try {
    const zitadelUser = await getCurrentUser()
    const sub = zitadelUser?.profile.sub
    if (!sub) {
      message.value = t('blocked.checkFailed')
      return
    }

    const appUser = await loadAppSession(sub, true)
    if (!appUser) {
      message.value = t('blocked.checkFailed')
      return
    }

    if (appUser.userStatus === 'BLOCKED' || appUser.userStatus === 'DELETED') {
      message.value = t('blocked.stillBlocked')
      return
    }

    await router.replace(getDefaultRouteForSession(appUser.userType, roles.value))
  } catch {
    message.value = t('blocked.checkFailed')
  } finally {
    isChecking.value = false
  }
}
</script>
