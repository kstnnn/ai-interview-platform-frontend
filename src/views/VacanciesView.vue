<template>
  <div class="flex min-h-screen flex-col bg-background">
    <AppHeader />

    <main class="flex-1 px-4 py-8 sm:px-6 lg:px-8">
      <div class="mx-auto max-w-7xl">
        <div class="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <RouterLink to="/business" class="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
              <ArrowLeft class="h-4 w-4" />
              Back to business workspace
            </RouterLink>
            <h1 class="mt-3 text-3xl font-bold text-foreground">Vacancies</h1>
            <p class="mt-1 text-muted-foreground">Hiring roles configured for AI interview generation.</p>
          </div>
          <RouterLink to="/business/vacancies/new">
            <BaseButton>
              <Plus class="h-4 w-4" />
              New vacancy
            </BaseButton>
          </RouterLink>
        </div>

        <BaseCard class="overflow-hidden">
          <div class="overflow-x-auto">
            <table class="min-w-full text-left">
              <thead>
                <tr class="border-b border-border text-sm text-muted-foreground">
                  <th class="px-6 py-4 font-medium">Vacancy</th>
                  <th class="px-6 py-4 font-medium">Stack</th>
                  <th class="px-6 py-4 font-medium">Questions</th>
                  <th class="px-6 py-4 font-medium">Candidates</th>
                  <th class="px-6 py-4 font-medium">Status</th>
                  <th class="px-6 py-4 text-right font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="vacancy in mockVacancies" :key="vacancy.id" class="border-b border-border/60 text-sm last:border-b-0">
                  <td class="px-6 py-5 align-top">
                    <div class="font-semibold text-foreground">{{ vacancy.title }}</div>
                    <div class="text-xs text-muted-foreground">{{ vacancy.department }} · {{ vacancy.level }}</div>
                  </td>
                  <td class="px-6 py-5 align-top">
                    <div class="flex max-w-md flex-wrap gap-2">
                      <span v-for="item in vacancy.stack" :key="item" class="rounded-full bg-muted px-3 py-1 text-xs font-semibold">{{ item }}</span>
                    </div>
                  </td>
                  <td class="px-6 py-5 align-top text-muted-foreground">
                    {{ vacancy.customQuestions.length ? `${vacancy.customQuestions.length} custom + bank` : 'Question bank only' }}
                  </td>
                  <td class="px-6 py-5 align-top font-semibold text-foreground">{{ vacancy.candidateCount }}</td>
                  <td class="px-6 py-5 align-top capitalize text-muted-foreground">{{ vacancy.status }}</td>
                  <td class="px-6 py-5 text-right align-top">
                    <RouterLink :to="`/business/vacancies/${vacancy.id}`">
                      <BaseButton variant="ghost" size="sm">Open</BaseButton>
                    </RouterLink>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </BaseCard>
      </div>
    </main>

    <AppFooter />
  </div>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { ArrowLeft, Plus } from 'lucide-vue-next'
import AppFooter from '@/components/AppFooter.vue'
import AppHeader from '@/components/AppHeader.vue'
import BaseButton from '@/components/BaseButton.vue'
import BaseCard from '@/components/BaseCard.vue'
import { mockVacancies } from '@/data/mock-data'
</script>
