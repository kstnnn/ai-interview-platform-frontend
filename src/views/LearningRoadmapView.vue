<template>
  <div class="flex min-h-screen flex-col bg-background">
    <AppHeader />

    <main class="flex-1 px-4 py-10 sm:px-6 lg:px-8">
      <div class="mx-auto max-w-6xl">
        <RouterLink to="/user" class="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft class="h-4 w-4" />
          Back to user workspace
        </RouterLink>

        <div class="mt-6 grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
          <BaseCard class="p-8">
            <p class="text-sm font-semibold uppercase tracking-[0.2em] text-primary">AI feedback plan</p>
            <h1 class="mt-3 font-serif text-4xl font-bold text-foreground">Roadmap after your mock interview</h1>
            <p class="mt-4 leading-relaxed text-muted-foreground">
              This page shows how interview results can become articles, practice tasks, and a week-by-week improvement plan.
            </p>
            <div class="mt-6 grid grid-cols-3 gap-3 text-center">
              <div class="rounded-[1.25rem] bg-muted/50 p-4">
                <div class="text-2xl font-bold text-primary">3</div>
                <p class="mt-1 text-xs text-muted-foreground">weeks</p>
              </div>
              <div class="rounded-[1.25rem] bg-muted/50 p-4">
                <div class="text-2xl font-bold text-primary">6</div>
                <p class="mt-1 text-xs text-muted-foreground">goals</p>
              </div>
              <div class="rounded-[1.25rem] bg-muted/50 p-4">
                <div class="text-2xl font-bold text-primary">177</div>
                <p class="mt-1 text-xs text-muted-foreground">minutes</p>
              </div>
            </div>
          </BaseCard>

          <BaseCard class="p-8">
            <h2 class="text-xl font-bold text-foreground">Recommended resources</h2>
            <div class="mt-5 grid gap-4 md:grid-cols-3">
              <div v-for="item in mockRecommendations" :key="item.id" class="rounded-[1.5rem] border border-border/60 p-5">
                <p class="text-xs font-semibold uppercase tracking-[0.16em] text-primary">{{ item.type }} · {{ item.estimatedMinutes }} min</p>
                <h3 class="mt-2 font-bold text-foreground">{{ item.title }}</h3>
                <p class="mt-2 text-sm leading-relaxed text-muted-foreground">{{ item.reason }}</p>
              </div>
            </div>
          </BaseCard>
        </div>

        <section class="mt-6 space-y-5">
          <BaseCard v-for="step in mockRoadmap" :key="step.id" class="p-6">
            <div class="grid gap-5 md:grid-cols-[160px_1fr]">
              <div>
                <span class="rounded-full bg-primary/10 px-4 py-2 text-sm font-semibold text-primary">{{ step.week }}</span>
              </div>
              <div>
                <h2 class="text-xl font-bold text-foreground">{{ step.title }}</h2>
                <p class="mt-2 leading-relaxed text-muted-foreground">{{ step.description }}</p>
                <div class="mt-4 flex flex-wrap gap-2">
                  <span v-for="goal in step.goals" :key="goal" class="rounded-full border border-border px-3 py-1 text-xs font-semibold text-muted-foreground">
                    {{ goal }}
                  </span>
                </div>
              </div>
            </div>
          </BaseCard>
        </section>
      </div>
    </main>

    <AppFooter />
  </div>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { ArrowLeft } from 'lucide-vue-next'
import AppFooter from '@/components/AppFooter.vue'
import AppHeader from '@/components/AppHeader.vue'
import BaseCard from '@/components/BaseCard.vue'
import { mockRecommendations, mockRoadmap } from '@/data/mock-data'
</script>
