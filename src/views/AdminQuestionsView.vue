<template>
  <div class="flex min-h-screen flex-col bg-background">
    <AppHeader />
    <main class="flex-1 px-4 py-8 sm:px-6 lg:px-8">
      <div class="mx-auto max-w-7xl">
        <div class="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div><p class="text-sm font-semibold uppercase tracking-[0.2em] text-primary">{{ t('admin.title') }}</p><h1 class="mt-3 text-3xl font-bold text-foreground">{{ t('admin.questions.title') }}</h1><p class="mt-2 text-muted-foreground">{{ t('admin.questions.subtitle') }}</p></div>
          <RouterLink to="/admin/users"><BaseButton variant="outline">{{ t('admin.users.title') }}</BaseButton></RouterLink>
        </div>

        <div class="mt-6 grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
          <div class="space-y-6">
            <BaseCard class="p-6">
              <h2 class="text-xl font-bold text-foreground">{{ t('admin.questions.maintenanceTitle') }}</h2>
              <p class="mt-2 text-sm text-muted-foreground">{{ t('admin.questions.maintenanceDesc') }}</p>
              <div class="mt-5 grid gap-3">
                <BaseButton :disabled="Boolean(maintenanceAction)" @click="runMaintenance('sync')">
                  {{ maintenanceAction === 'sync' ? t('admin.questions.syncingVector') : t('admin.questions.syncVector') }}
                </BaseButton>
                <BaseButton variant="outline" :disabled="Boolean(maintenanceAction)" @click="runMaintenance('import')">
                  {{ maintenanceAction === 'import' ? t('admin.questions.importingBundled') : t('admin.questions.importBundled') }}
                </BaseButton>
                <BaseButton variant="ghost" :disabled="Boolean(maintenanceAction)" @click="runMaintenance('delete')">
                  {{ maintenanceAction === 'delete' ? t('admin.questions.deletingVector') : t('admin.questions.deleteVector') }}
                </BaseButton>
              </div>
              <p v-if="maintenanceMessage" class="mt-4 rounded-[1.25rem] bg-success/10 p-3 text-sm text-success">{{ maintenanceMessage }}</p>
              <p v-if="maintenanceError" class="mt-4 rounded-[1.25rem] bg-destructive/10 p-3 text-sm text-destructive">{{ maintenanceError }}</p>
            </BaseCard>

            <BaseCard class="p-6">
              <h2 class="text-xl font-bold text-foreground">{{ editingId ? t('admin.questions.edit') : t('admin.questions.create') }}</h2>
              <form class="mt-5 space-y-4" @submit.prevent="submitQuestion">
                <input v-if="!editingId" v-model.trim="form.externalId" class="h-11 w-full rounded-full border border-border bg-input px-4 text-sm outline-none focus:border-primary" :placeholder="t('admin.questions.externalId')" />
                <div class="grid gap-3 sm:grid-cols-2"><input v-model.trim="form.technologyKey" required class="h-11 rounded-full border border-border bg-input px-4 text-sm outline-none focus:border-primary" :placeholder="t('admin.questions.technologyKey')" /><select v-model="form.difficulty" class="h-11 rounded-full border border-border bg-input px-4 text-sm outline-none focus:border-primary"><option value="EASY">EASY</option><option value="MEDIUM">MEDIUM</option><option value="HARD">HARD</option></select></div>
                <div class="grid gap-3 sm:grid-cols-2"><input v-model.trim="form.topic" required class="h-11 rounded-full border border-border bg-input px-4 text-sm outline-none focus:border-primary" :placeholder="t('admin.questions.topic')" /><input v-model.trim="form.subtopic" class="h-11 rounded-full border border-border bg-input px-4 text-sm outline-none focus:border-primary" :placeholder="t('admin.questions.subtopic')" /></div>
                <textarea v-model.trim="form.questionText" required rows="4" class="w-full rounded-[1.25rem] border border-border bg-input px-4 py-3 text-sm outline-none focus:border-primary" :placeholder="t('admin.questions.questionText')"></textarea>
                <textarea v-model.trim="form.expectedAnswer" required rows="4" class="w-full rounded-[1.25rem] border border-border bg-input px-4 py-3 text-sm outline-none focus:border-primary" :placeholder="t('admin.questions.expectedAnswer')"></textarea>
                <label class="flex items-center gap-2 text-sm font-semibold"><input v-model="form.active" type="checkbox" /> {{ t('admin.questions.active') }}</label>
                <p v-if="formError" class="text-sm text-destructive">{{ formError }}</p>
                <div class="flex gap-2"><BaseButton :disabled="isSaving">{{ isSaving ? t('common.saving') : t('admin.questions.save') }}</BaseButton><BaseButton v-if="editingId" type="button" variant="outline" @click="resetForm">{{ t('vacancyQuestions.cancel') }}</BaseButton></div>
              </form>
            </BaseCard>
          </div>

          <div>
            <BaseCard class="p-5">
              <div class="grid gap-4 lg:grid-cols-[1fr_0.3fr_0.25fr_0.25fr_0.25fr]">
                <input v-model="filters.search" class="h-11 rounded-full border border-border bg-input px-4 text-sm outline-none focus:border-primary" :placeholder="t('admin.questions.search')" @keyup.enter="reload" />
                <input v-model.trim="filters.technologyKey" class="h-11 rounded-full border border-border bg-input px-4 text-sm outline-none focus:border-primary" :placeholder="t('admin.questions.technologyKey')" />
                <select v-model="filters.difficulty" class="h-11 rounded-full border border-border bg-input px-4 text-sm outline-none focus:border-primary"><option value="">{{ t('admin.allDifficulties') }}</option><option value="EASY">EASY</option><option value="MEDIUM">MEDIUM</option><option value="HARD">HARD</option></select>
                <select v-model="filters.active" class="h-11 rounded-full border border-border bg-input px-4 text-sm outline-none focus:border-primary"><option value="">{{ t('admin.allStatuses') }}</option><option :value="true">{{ t('admin.questions.active') }}</option><option :value="false">{{ t('admin.questions.inactive') }}</option></select>
                <BaseButton @click="reload">{{ t('admin.applyFilters') }}</BaseButton>
              </div>
            </BaseCard>

            <div v-if="isLoading" class="mt-6 rounded-organic bg-muted/40 p-10 text-center text-muted-foreground">{{ t('admin.loading') }}</div>
            <div v-else-if="error" class="mt-6 rounded-organic bg-destructive/10 p-10 text-center text-destructive">{{ error }}</div>
            <div v-else class="mt-6 space-y-4">
              <BaseCard v-for="question in questions" :key="question.id" class="p-5">
                <div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div><div class="flex flex-wrap gap-2 text-xs font-semibold text-muted-foreground"><span class="rounded-full bg-muted px-3 py-1">{{ question.technology.displayName || question.technology.key }}</span><span class="rounded-full bg-muted px-3 py-1">{{ question.difficulty }}</span><span :class="question.active ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'" class="rounded-full px-3 py-1">{{ question.active ? t('admin.questions.active') : t('admin.questions.inactive') }}</span></div><h3 class="mt-3 font-semibold text-foreground">{{ question.questionText }}</h3><p class="mt-1 text-xs text-muted-foreground">{{ question.topic }}<span v-if="question.subtopic"> · {{ question.subtopic }}</span></p><p class="mt-3 line-clamp-2 text-sm text-muted-foreground">{{ question.expectedAnswer }}</p></div>
                  <div class="flex flex-wrap gap-2 sm:justify-end"><BaseButton size="sm" variant="outline" @click="editQuestion(question)">{{ t('vacancyQuestions.edit') }}</BaseButton><BaseButton size="sm" variant="outline" @click="toggleActive(question)">{{ question.active ? t('admin.questions.deactivate') : t('admin.questions.activate') }}</BaseButton></div>
                </div>
              </BaseCard>
            </div>
            <div class="mt-5 flex items-center justify-between text-sm text-muted-foreground"><p>{{ t('admin.total') }}: {{ page.totalElements }}</p><div class="flex gap-2"><BaseButton size="sm" variant="outline" :disabled="page.number <= 0" @click="goPage(page.number - 1)">{{ t('admin.prev') }}</BaseButton><BaseButton size="sm" variant="outline" :disabled="page.number + 1 >= page.totalPages" @click="goPage(page.number + 1)">{{ t('admin.next') }}</BaseButton></div></div>
          </div>
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
import { activateAdminQuestion, createAdminQuestion, deactivateAdminQuestion, deleteQuestionVectorCollection, getAdminQuestions, importBundledQuestions, syncQuestionVectorStore, updateAdminQuestion } from '@/api/admin'
import { ApiError } from '@/api/client'
import { useI18n } from '@/i18n'
import type { AdminQuestionResponse, PageResponse } from '@/types/api'

const { t } = useI18n()
const questions = ref<AdminQuestionResponse[]>([])
const isLoading = ref(false)
const isSaving = ref(false)
const error = ref('')
const formError = ref('')
const maintenanceAction = ref<'sync' | 'import' | 'delete' | ''>('')
const maintenanceMessage = ref('')
const maintenanceError = ref('')
const editingId = ref('')
const filters = reactive({ search: '', technologyKey: '', difficulty: '', active: '' as boolean | '', page: 0, size: 10, sort: 'createdAt,desc' })
const page = reactive({ totalElements: 0, totalPages: 0, number: 0, size: 10 })
const form = reactive({ externalId: '', technologyKey: '', topic: '', subtopic: '', difficulty: 'MEDIUM', questionText: '', expectedAnswer: '', active: true })

async function loadQuestions() {
  isLoading.value = true
  error.value = ''
  try {
    const response = await getAdminQuestions(filters) as PageResponse<AdminQuestionResponse>
    questions.value = response.content
    Object.assign(page, { totalElements: response.totalElements, totalPages: response.totalPages, number: response.number, size: response.size })
  } catch (err) {
    error.value = err instanceof Error ? err.message : t('admin.questions.loadFailed')
  } finally {
    isLoading.value = false
  }
}
function reload() { filters.page = 0; void loadQuestions() }
function goPage(nextPage: number) { filters.page = nextPage; void loadQuestions() }

async function submitQuestion() {
  isSaving.value = true
  formError.value = ''
  const payload = { technologyKey: form.technologyKey, topic: form.topic, subtopic: form.subtopic || null, difficulty: form.difficulty, questionText: form.questionText, expectedAnswer: form.expectedAnswer, active: form.active }
  try {
    if (editingId.value) await updateAdminQuestion(editingId.value, payload)
    else await createAdminQuestion({ ...payload, externalId: form.externalId || null })
    resetForm()
    await loadQuestions()
  } catch (err) {
    formError.value = err instanceof Error ? err.message : t('admin.questions.saveFailed')
  } finally {
    isSaving.value = false
  }
}
async function runMaintenance(action: 'sync' | 'import' | 'delete') {
  if (action === 'delete' && !window.confirm(t('admin.questions.deleteVectorConfirm'))) return
  maintenanceAction.value = action
  maintenanceMessage.value = ''
  maintenanceError.value = ''
  try {
    if (action === 'sync') {
      await syncQuestionVectorStore()
      maintenanceMessage.value = t('admin.questions.vectorSynced')
    } else if (action === 'import') {
      await importBundledQuestions()
      maintenanceMessage.value = t('admin.questions.importedBundled')
      await loadQuestions()
    } else {
      await deleteQuestionVectorCollection()
      maintenanceMessage.value = t('admin.questions.vectorDeleted')
    }
  } catch (err) {
    if (err instanceof ApiError && err.status === 403) {
      maintenanceError.value = t('admin.questions.adminRequired')
    } else {
      maintenanceError.value = err instanceof Error ? err.message : t('admin.questions.maintenanceFailed')
    }
  } finally {
    maintenanceAction.value = ''
  }
}
function editQuestion(question: AdminQuestionResponse) { editingId.value = question.id; form.externalId = question.externalId; form.technologyKey = question.technology.key; form.topic = question.topic; form.subtopic = question.subtopic ?? ''; form.difficulty = question.difficulty; form.questionText = question.questionText; form.expectedAnswer = question.expectedAnswer; form.active = question.active }
function resetForm() { editingId.value = ''; form.externalId = ''; form.technologyKey = ''; form.topic = ''; form.subtopic = ''; form.difficulty = 'MEDIUM'; form.questionText = ''; form.expectedAnswer = ''; form.active = true; formError.value = '' }
async function toggleActive(question: AdminQuestionResponse) { if (question.active) await deactivateAdminQuestion(question.id); else await activateAdminQuestion(question.id); await loadQuestions() }
onMounted(loadQuestions)
</script>
