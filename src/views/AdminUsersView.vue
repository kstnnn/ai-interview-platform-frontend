<template>
  <div class="flex min-h-screen flex-col bg-background">
    <AppHeader />
    <main class="flex-1 px-4 py-8 sm:px-6 lg:px-8">
      <div class="mx-auto max-w-7xl">
        <div class="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p class="text-sm font-semibold uppercase tracking-[0.2em] text-primary">{{ t('admin.title') }}</p>
            <h1 class="mt-3 text-3xl font-bold text-foreground">{{ t('admin.users.title') }}</h1>
            <p class="mt-2 text-muted-foreground">{{ t('admin.users.subtitle') }}</p>
          </div>
          <RouterLink to="/admin/questions"><BaseButton variant="outline">{{ t('admin.questions.title') }}</BaseButton></RouterLink>
        </div>

        <BaseCard class="mt-6 p-5">
          <div class="grid gap-4 lg:grid-cols-[1fr_0.3fr_0.3fr_0.3fr_0.3fr]">
            <input v-model="filters.search" class="h-11 rounded-full border border-border bg-input px-4 text-sm outline-none focus:border-primary" :placeholder="t('admin.users.search')" @keyup.enter="reload" />
            <select v-model="filters.userType" class="h-11 rounded-full border border-border bg-input px-4 text-sm outline-none focus:border-primary"><option value="">{{ t('admin.allTypes') }}</option><option value="PERSONAL">PERSONAL</option><option value="BUSINESS">BUSINESS</option></select>
            <select v-model="filters.userStatus" class="h-11 rounded-full border border-border bg-input px-4 text-sm outline-none focus:border-primary"><option value="">{{ t('admin.allStatuses') }}</option><option value="ACTIVE">ACTIVE</option><option value="PENDING_ONBOARDING">PENDING</option><option value="BLOCKED">BLOCKED</option><option value="DELETED">DELETED</option></select>
            <select v-model="filters.role" class="h-11 rounded-full border border-border bg-input px-4 text-sm outline-none focus:border-primary"><option value="">{{ t('admin.allRoles') }}</option><option value="CANDIDATE">CANDIDATE</option><option value="MANAGER">MANAGER</option><option value="ADMIN">ADMIN</option></select>
            <BaseButton @click="reload">{{ t('admin.applyFilters') }}</BaseButton>
          </div>
        </BaseCard>

        <div v-if="isLoading" class="mt-6 rounded-organic bg-muted/40 p-10 text-center text-muted-foreground">{{ t('admin.loading') }}</div>
        <div v-else-if="error" class="mt-6 rounded-organic bg-destructive/10 p-10 text-center text-destructive">{{ error }}</div>
        <div v-else class="mt-6 overflow-hidden rounded-[1.5rem] border border-border bg-card">
          <table class="w-full min-w-[860px] text-left text-sm">
            <thead class="bg-muted/40 text-xs uppercase tracking-[0.12em] text-muted-foreground">
              <tr><th class="px-5 py-4">{{ t('admin.users.user') }}</th><th class="px-5 py-4">{{ t('common.status') }}</th><th class="px-5 py-4">{{ t('admin.roles') }}</th><th class="px-5 py-4">{{ t('admin.verified') }}</th><th class="px-5 py-4 text-right">{{ t('th.action') }}</th></tr>
            </thead>
            <tbody class="divide-y divide-border/60">
              <tr v-for="user in users" :key="user.id">
                <td class="px-5 py-4"><p class="font-semibold text-foreground">{{ displayName(user) }}</p><p class="text-muted-foreground">{{ user.email }}</p><p class="text-xs text-muted-foreground">{{ user.userType }} · {{ formatDate(user.createdAt) }}</p></td>
                <td class="px-5 py-4"><span class="rounded-full bg-muted px-3 py-1 text-xs font-semibold">{{ user.userStatus }}</span></td>
                <td class="px-5 py-4"><div class="flex flex-wrap gap-1"><span v-for="role in user.roles" :key="role" class="rounded-full bg-primary/10 px-2 py-1 text-xs font-semibold text-primary">{{ role }}</span></div></td>
                <td class="px-5 py-4">{{ user.emailVerified ? t('common.yes') : t('common.no') }}</td>
                <td class="px-5 py-4 text-right"><BaseButton size="sm" variant="outline" :disabled="actionUserId === user.id" @click="toggleBlock(user)">{{ user.userStatus === 'BLOCKED' ? t('admin.users.unblock') : t('admin.users.block') }}</BaseButton></td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="mt-5 flex items-center justify-between text-sm text-muted-foreground">
          <p>{{ t('admin.total') }}: {{ page.totalElements }}</p>
          <div class="flex gap-2"><BaseButton size="sm" variant="outline" :disabled="page.number <= 0" @click="goPage(page.number - 1)">{{ t('admin.prev') }}</BaseButton><BaseButton size="sm" variant="outline" :disabled="page.number + 1 >= page.totalPages" @click="goPage(page.number + 1)">{{ t('admin.next') }}</BaseButton></div>
        </div>
      </div>
    </main>
    <AppFooter />
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { RouterLink } from 'vue-router'
import AppFooter from '@/components/AppFooter.vue'
import AppHeader from '@/components/AppHeader.vue'
import BaseButton from '@/components/BaseButton.vue'
import BaseCard from '@/components/BaseCard.vue'
import { blockAdminUser, getAdminUsers, unblockAdminUser } from '@/api/admin'
import { useI18n } from '@/i18n'
import type { AdminUserQuery, AdminUserResponse, PageResponse } from '@/types/api'

const { t } = useI18n()
const users = ref<AdminUserResponse[]>([])
const isLoading = ref(false)
const error = ref('')
const actionUserId = ref('')
const filters = reactive<AdminUserQuery>({ search: '', userType: '', userStatus: '', role: '', page: 0, size: 20, sort: 'createdAt,desc' })
const page = reactive({ totalElements: 0, totalPages: 0, number: 0, size: 20 })

async function loadUsers() {
  isLoading.value = true
  error.value = ''
  try {
    const response = await getAdminUsers(filters) as PageResponse<AdminUserResponse>
    users.value = response.content
    Object.assign(page, { totalElements: response.totalElements, totalPages: response.totalPages, number: response.number, size: response.size })
  } catch (err) {
    error.value = err instanceof Error ? err.message : t('admin.users.loadFailed')
  } finally {
    isLoading.value = false
  }
}

function reload() { filters.page = 0; void loadUsers() }
function goPage(nextPage: number) { filters.page = nextPage; void loadUsers() }
function displayName(user: AdminUserResponse) { return [user.firstName, user.lastName].filter(Boolean).join(' ') || user.email }
function formatDate(value: string) { return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(new Date(value)) }

async function toggleBlock(user: AdminUserResponse) {
  actionUserId.value = user.id
  try {
    if (user.userStatus === 'BLOCKED') await unblockAdminUser(user.id)
    else await blockAdminUser(user.id)
    await loadUsers()
  } finally {
    actionUserId.value = ''
  }
}

onMounted(loadUsers)
</script>
