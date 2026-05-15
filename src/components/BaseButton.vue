<template>
  <component :is="tag" :class="classes">
    <slot />
  </component>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    variant?: 'primary' | 'outline' | 'ghost'
    size?: 'sm' | 'md' | 'lg' | 'icon'
    tag?: string
  }>(),
  {
    variant: 'primary',
    size: 'md',
    tag: 'button',
  },
)

const classes = computed(() => {
  const base = 'inline-flex items-center justify-center gap-2 rounded-full border text-sm font-semibold transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-60'

  const variants = {
    primary: 'border-primary bg-primary text-primary-foreground hover:bg-primary/90 shadow-soft hover:shadow-soft-hover',
    outline: 'border-primary/30 bg-transparent text-foreground hover:bg-primary/5',
    ghost: 'border-transparent bg-transparent text-foreground hover:bg-muted',
  }

  const sizes = {
    sm: 'h-9 px-4',
    md: 'h-11 px-5',
    lg: 'h-12 px-6 text-base',
    icon: 'h-12 w-12',
  }

  return [base, variants[props.variant], sizes[props.size]].join(' ')
})
</script>
