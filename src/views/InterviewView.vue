<template>
  <div v-if="session" class="min-h-screen bg-background">
    <header class="sticky top-0 z-50 border-b border-border/30 bg-background/90 backdrop-blur-md">
      <div class="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <div>
          <h1 class="font-serif text-lg font-bold text-foreground">{{ session.position }} Interview</h1>
          <p class="text-sm text-muted-foreground">Question {{ currentQuestionIndex + 1 }} of {{ totalQuestions }}</p>
        </div>

        <div class="flex items-center gap-3">
          <div class="rounded-full border border-primary/20 bg-primary/10 px-4 py-2 font-mono text-sm font-semibold text-foreground">
            {{ timerLabel }}
          </div>
          <BaseButton variant="outline" size="sm" @click="finishInterview">End</BaseButton>
        </div>
      </div>
    </header>

    <div class="mx-auto max-w-5xl px-4 pt-4 sm:px-6 lg:px-8">
      <div class="mb-2 flex items-center justify-between text-sm">
        <span class="font-medium text-foreground">Interview Progress</span>
        <span class="text-muted-foreground">{{ Math.round(progress) }}%</span>
      </div>
      <div class="h-2 overflow-hidden rounded-full bg-muted">
        <div class="h-full rounded-full bg-primary transition-all duration-300" :style="{ width: `${progress}%` }"></div>
      </div>
    </div>

    <main class="mx-auto flex max-w-5xl flex-col px-4 py-6 sm:px-6 lg:px-8">
      <BaseCard class="flex min-h-[70vh] flex-col overflow-hidden">
        <div class="border-b border-border/40 p-6">
          <div class="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 class="font-serif text-2xl font-bold text-foreground">Voice Interview Demo</h2>
              <p class="mt-1 text-sm text-muted-foreground">
                This screen now runs locally in the browser with scripted interviewer prompts.
              </p>
            </div>
            <div class="flex gap-3">
              <BaseButton variant="outline" size="sm" @click="toggleMute">
                <component :is="isMuted ? VolumeX : Volume2" class="h-4 w-4" />
                {{ isMuted ? 'Unmute' : 'Mute' }}
              </BaseButton>
              <BaseButton variant="outline" size="sm" @click="speakCurrentQuestion">
                <Play class="h-4 w-4" />
                Replay prompt
              </BaseButton>
            </div>
          </div>
        </div>

        <div ref="messagesContainerRef" class="flex-1 space-y-4 overflow-y-auto p-6">
          <div
            v-for="message in messages"
            :key="message.id"
            class="flex gap-3"
            :class="message.role === 'user' ? 'justify-end' : 'justify-start'"
          >
            <div
              v-if="message.role === 'assistant'"
              class="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-organic bg-primary/10 text-primary shadow-soft"
            >
              <Bot class="h-5 w-5" />
            </div>
            <div
              class="max-w-[75%] rounded-organic px-5 py-3 text-sm leading-relaxed shadow-soft"
              :class="message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'"
            >
              {{ message.text }}
            </div>
            <div
              v-if="message.role === 'user'"
              class="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-organic bg-accent text-accent-foreground shadow-soft"
            >
              <User class="h-5 w-5" />
            </div>
          </div>

          <div v-if="transcript || interimTranscript" class="flex justify-end gap-3">
            <div class="max-w-[75%] rounded-organic bg-primary px-5 py-3 text-sm leading-relaxed text-primary-foreground shadow-soft">
              {{ transcript }}
              <span v-if="interimTranscript" class="opacity-70"> {{ interimTranscript }}</span>
            </div>
            <div class="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-organic bg-accent text-accent-foreground shadow-soft">
              <User class="h-5 w-5" />
            </div>
          </div>
        </div>

        <div class="border-t border-border/30 bg-background/60 p-6">
          <div v-if="voiceError" class="mb-4 rounded-organic border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">
            {{ voiceError }}
          </div>
          <div v-if="!speechRecognitionSupported || !speechSynthesisSupported" class="mb-4 rounded-organic border border-warning/20 bg-warning/10 p-4 text-sm text-foreground">
            Voice features depend on browser support. Text flow still works visually if your browser lacks some APIs.
          </div>

          <div class="flex flex-wrap items-center justify-center gap-4">
            <BaseButton :variant="isListening ? 'primary' : 'outline'" size="icon" @click="toggleListening">
              <component :is="isListening ? MicOff : Mic" class="h-5 w-5" />
            </BaseButton>

            <BaseButton :disabled="!canSubmitAnswer" @click="submitAnswer">
              <Send class="h-4 w-4" />
              Submit answer
            </BaseButton>
          </div>
        </div>
      </BaseCard>
    </main>
  </div>

  <div v-else class="flex min-h-screen items-center justify-center px-4 text-center">
    <BaseCard class="max-w-md p-8">
      <h1 class="text-2xl font-bold text-foreground">Session not found</h1>
      <p class="mt-3 text-muted-foreground">The current frontend demo only has a few local sessions configured.</p>
      <RouterLink to="/candidate/join" class="mt-6 inline-block">
        <BaseButton>Back to Join</BaseButton>
      </RouterLink>
    </BaseCard>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter, RouterLink } from 'vue-router'
import { Bot, Mic, MicOff, Play, Send, User, Volume2, VolumeX } from 'lucide-vue-next'
import BaseButton from '@/components/BaseButton.vue'
import BaseCard from '@/components/BaseCard.vue'
import { useVoiceInterview } from '@/composables/useVoiceInterview'
import { getSessionById, scriptedInterviewQuestions } from '@/data/mock-data'
import type { ChatMessage } from '@/types/interview'

const route = useRoute()
const router = useRouter()
const session = computed(() => getSessionById(String(route.params.sessionId ?? '')))
const totalQuestions = scriptedInterviewQuestions.length

const messages = ref<ChatMessage[]>([])
const currentQuestionIndex = ref(0)
const secondsElapsed = ref(0)
const timerId = ref<number | null>(null)
const isMuted = ref(false)
const messagesContainerRef = ref<HTMLElement | null>(null)

const {
  transcript,
  interimTranscript,
  isListening,
  error: voiceError,
  speechRecognitionSupported,
  speechSynthesisSupported,
  startListening,
  stopListening,
  resetTranscript,
  speak,
  cancelSpeech,
} = useVoiceInterview()

const progress = computed(() => ((currentQuestionIndex.value + 1) / totalQuestions) * 100)
const canSubmitAnswer = computed(() => transcript.value.trim().length > 0)
const timerLabel = computed(() => {
  const minutes = Math.floor(secondsElapsed.value / 60)
  const seconds = secondsElapsed.value % 60
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
})

function addAssistantMessage(text: string) {
  messages.value.push({
    id: `assistant-${Date.now()}-${messages.value.length}`,
    role: 'assistant',
    text,
  })

  if (!isMuted.value) {
    speak(text)
  }
}

function addUserMessage(text: string) {
  messages.value.push({
    id: `user-${Date.now()}-${messages.value.length}`,
    role: 'user',
    text,
  })
}

function askCurrentQuestion() {
  addAssistantMessage(scriptedInterviewQuestions[currentQuestionIndex.value])
}

function submitAnswer() {
  const answer = transcript.value.trim()
  if (!answer) {
    return
  }

  stopListening()
  addUserMessage(answer)
  resetTranscript()

  if (currentQuestionIndex.value === totalQuestions - 1) {
    finishInterview()
    return
  }

  currentQuestionIndex.value += 1
  window.setTimeout(() => {
    askCurrentQuestion()
  }, 350)
}

function toggleListening() {
  if (isListening.value) {
    stopListening()
    return
  }

  cancelSpeech()
  startListening()
}

function toggleMute() {
  if (!isMuted.value) {
    cancelSpeech()
  }

  isMuted.value = !isMuted.value
}

function speakCurrentQuestion() {
  cancelSpeech()
  if (!isMuted.value) {
    speak(scriptedInterviewQuestions[currentQuestionIndex.value])
  }
}

function finishInterview() {
  stopListening()
  cancelSpeech()
  if (timerId.value !== null) {
    window.clearInterval(timerId.value)
  }
  void router.push(`/results/${route.params.sessionId}`)
}

watch(
  messages,
  async () => {
    await nextTick()
    messagesContainerRef.value?.scrollTo({
      top: messagesContainerRef.value.scrollHeight,
      behavior: 'smooth',
    })
  },
  { deep: true },
)

onMounted(() => {
  if (!session.value) {
    return
  }

  timerId.value = window.setInterval(() => {
    secondsElapsed.value += 1
  }, 1000)

  addAssistantMessage(`Hello ${session.value.candidateName}. Welcome to your ${session.value.position} interview.`)
  window.setTimeout(() => {
    askCurrentQuestion()
  }, 700)
})

onBeforeUnmount(() => {
  if (timerId.value !== null) {
    window.clearInterval(timerId.value)
  }
})
</script>
