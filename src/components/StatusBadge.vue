<template>
  <span :class="badgeClass">
    {{ label }}
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { SessionStatus } from '@/types/interview'

const props = defineProps<{
  status: SessionStatus
}>()

const label = computed(() => {
  if (props.status === 'completed') return 'Completed'
  if (props.status === 'in-progress') return 'In Progress'
  return 'Pending'
})

const badgeClass = computed(() => {
  const base = 'inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold'

  if (props.status === 'completed') {
    return `${base} border-success/20 bg-success/10 text-success`
  }

  if (props.status === 'in-progress') {
    return `${base} border-warning/20 bg-warning/15 text-foreground`
  }

  return `${base} border-border bg-muted text-muted-foreground`
})
</script>
