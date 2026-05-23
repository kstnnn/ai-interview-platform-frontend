<template>
  <div v-if="!showReconnectModal" class="min-h-screen bg-background">
    <header class="sticky top-0 z-50 border-b border-border/30 bg-background/90 backdrop-blur-md">
      <div class="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <div>
          <h1 class="font-serif text-lg font-bold text-foreground">{{ t('interview.title') }}</h1>
          <p v-if="currentQuestion" class="text-sm text-muted-foreground">{{ t('interview.inProgress') }}</p>
          <p v-else-if="status === 'connecting'" class="text-sm text-muted-foreground">{{ t('interview.connecting') }}
          </p>
          <p v-else-if="status === 'reconnecting'" class="text-sm text-warning">{{ t('interview.reconnecting') }}</p>
        </div>

        <div class="flex items-center gap-3">
          <div v-if="secondsElapsed > 0"
            class="rounded-full border border-primary/20 bg-primary/10 px-4 py-2 font-mono text-sm font-semibold text-foreground">
            {{ timerLabel }}
          </div>
          <BaseButton variant="outline" size="sm" @click="leaveInterview">{{ t('interview.leave') }}</BaseButton>
        </div>
      </div>
    </header>

    <main class="mx-auto flex max-w-5xl flex-col px-4 py-6 sm:px-6 lg:px-8">
      <BaseCard class="flex h-[calc(100vh-12rem)] min-h-[520px] flex-col overflow-hidden">
        <div class="border-b border-border/40 p-6">
          <div class="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 class="font-serif text-2xl font-bold text-foreground">{{ t('interview.voiceTitle') }}</h2>
              <p class="mt-1 text-sm text-muted-foreground">{{ t('interview.voiceDesc') }}</p>
            </div>
            <div class="flex gap-3">
              <BaseButton variant="outline" size="sm" @click="toggleMute">
                <component :is="isMuted ? VolumeX : Volume2" class="h-4 w-4" />
                {{ isMuted ? t('interview.unmute') : t('interview.mute') }}
              </BaseButton>
              <BaseButton v-if="currentQuestion" variant="outline" size="sm" @click="speakText(currentQuestion.text)">
                <Play class="h-4 w-4" />
                {{ t('interview.replay') }}
              </BaseButton>
            </div>
          </div>
        </div>

        <div ref="messagesContainerRef" class="min-h-0 flex-1 space-y-4 overflow-y-auto p-6">
          <div v-for="message in displayMessages" :key="message.id" class="flex gap-3"
            :class="message.type === 'answer' ? 'justify-end' : 'justify-start'">
            <div v-if="message.type !== 'answer'"
              class="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-organic text-primary shadow-soft"
              :class="message.type === 'error' ? 'bg-destructive/10 text-destructive' : 'bg-primary/10'">
              <component :is="message.type === 'error' ? AlertCircle : message.type === 'system' ? Info : Bot"
                class="h-5 w-5" />
            </div>

            <div class="max-w-[75%] rounded-organic px-5 py-3 text-sm leading-relaxed shadow-soft" :class="{
              'bg-primary text-primary-foreground': message.type === 'answer',
              'bg-destructive/10 text-destructive': message.type === 'error',
              'bg-secondary text-secondary-foreground': message.type === 'system',
              'bg-muted/60 text-muted-foreground': message.type === 'evaluation' || message.type === 'feedback',
              'bg-background text-foreground': message.type === 'question',
            }">
              {{ message.text }}
            </div>

            <div v-if="message.type === 'answer'"
              class="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-organic bg-accent text-accent-foreground shadow-soft">
              <User class="h-5 w-5" />
            </div>
          </div>

          <div v-if="transcript || interimTranscript" class="flex justify-end gap-3">
            <div
              class="max-w-[75%] rounded-organic bg-primary px-5 py-3 text-sm leading-relaxed text-primary-foreground shadow-soft">
              {{ transcript }}
              <span v-if="interimTranscript" class="opacity-70"> {{ interimTranscript }}</span>
            </div>
            <div
              class="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-organic bg-accent text-accent-foreground shadow-soft">
              <User class="h-5 w-5" />
            </div>
          </div>
        </div>

        <div class="border-t border-border/30 bg-background/60 p-6">
          <div v-if="voiceError"
            class="mb-4 rounded-organic border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">
            {{ voiceError }}
          </div>
          <div v-if="!speechRecognitionSupported || !speechSynthesisSupported"
            class="mb-4 rounded-organic border border-warning/20 bg-warning/10 p-4 text-sm text-foreground">
            {{ t('interview.voiceUnsupported') }}
          </div>

          <textarea
            v-model="textInput"
            :placeholder="t('interview.typeAnswer')"
            :disabled="status === 'finished' || status === 'connected' || status === 'ready' || status === 'evaluating' || Boolean(rateLimitError)"
            rows="3"
            class="mb-4 w-full resize-none rounded-organic border border-border bg-input px-4 py-3 text-sm leading-relaxed outline-none transition focus:border-primary disabled:opacity-50"
          />

          <div v-if="rateLimitError" class="mb-4 rounded-organic border border-warning/20 bg-warning/10 p-4 text-sm text-foreground">
            <p class="font-semibold">{{ rateLimitError.message }}</p>
            <div class="mt-3 flex flex-wrap items-center gap-3">
              <BaseButton size="sm" :disabled="retryCountdown > 0" @click="retryLastAnswer">
                {{ retryCountdown > 0 ? t('interview.retryIn').replace('{seconds}', String(retryCountdown)) : t('interview.retryAnswer') }}
              </BaseButton>
            </div>
          </div>

          <div class="flex flex-wrap items-center justify-center gap-4">
            <BaseButton v-if="canSendReady" @click="startFirstQuestion">
              <Play class="h-4 w-4" />
              {{ t('interview.ready') }}
            </BaseButton>

            <BaseButton v-if="speechRecognitionSupported" :disabled="status === 'finished' || status === 'connected' || status === 'ready' || status === 'evaluating' || Boolean(rateLimitError)" :variant="isListening ? 'primary' : 'outline'" size="icon" @click="toggleListening">
              <component :is="isListening ? MicOff : Mic" class="h-5 w-5" />
            </BaseButton>

            <BaseButton :disabled="!canSubmitAnswer || status === 'finished'" @click="submitAnswer">
              <Send class="h-4 w-4" />
              {{ t('interview.submitAnswer') }}
            </BaseButton>
          </div>
        </div>
      </BaseCard>
    </main>

    <div v-if="status === 'finished'"
      class="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <BaseCard class="max-w-md p-8 text-center">
        <CircleCheck class="mx-auto h-12 w-12 text-success" />
        <h2 class="mt-4 text-2xl font-bold text-foreground">{{ t('interview.finishedTitle') }}</h2>
        <p class="mt-2 text-muted-foreground">{{ t('interview.finishedDesc') }}</p>
        <BaseButton class="mt-6" size="lg" @click="goToResults">
          {{ t('interview.viewResults') }}
        </BaseButton>
      </BaseCard>
    </div>
  </div>

  <div v-if="showReconnectModal"
    class="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
    <BaseCard class="max-w-md p-8 text-center">
      <AlertTriangle class="mx-auto h-12 w-12 text-warning" />
      <h2 class="mt-4 text-2xl font-bold text-foreground">{{ t('interview.connectionLost') }}</h2>
      <p class="mt-2 text-muted-foreground">{{ t('interview.connectionLostDesc') }}</p>
      <div class="mt-6 flex flex-col gap-3 sm:flex-row">
        <BaseButton class="flex-1" size="lg" @click="retryConnection">
          {{ t('interview.retry') }}
        </BaseButton>
        <BaseButton class="flex-1" variant="outline" size="lg" @click="leaveInterview">
          {{ t('interview.leave') }}
        </BaseButton>
      </div>
    </BaseCard>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { AlertCircle, AlertTriangle, Bot, CircleCheck, Info, Mic, MicOff, Play, Send, User, Volume2, VolumeX } from 'lucide-vue-next'
import BaseButton from '@/components/BaseButton.vue'
import BaseCard from '@/components/BaseCard.vue'
import { useVoiceInterview } from '@/composables/useVoiceInterview'
import { useInterviewWebSocket } from '@/composables/useInterviewWebSocket'
import { useAppSession } from '@/composables/useAppSession'
import { getAccessToken } from '@/auth/zitadel'
import { useI18n } from '@/i18n'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const sessionId = String(route.params.sessionId ?? '')
const technologyKeys = computed(() => {
  const raw = route.query.techs
  if (typeof raw === 'string' && raw.length > 0) {
    return raw.split(',').filter(Boolean)
  }
  return []
})
const interviewLevel = computed(() => (route.query.level as string) ?? 'MIDDLE')
const { displayName } = useAppSession()
const { locale } = useI18n()
const interviewLanguage = computed(() => {
  const lang = route.query.lang
  if (lang === 'Russian' || lang === 'English') return lang
  return locale.value === 'ru' ? 'Russian' : 'English'
})

const {
  isConnected,
  isConnecting,
  isReconnecting,
  status,
  error: wsError,
  messages,
  currentQuestion,
  interviewResult,
  reconnectAttempts,
  hasReceivedGreeting,
  rateLimitError,
  connect,
  disconnect,
  sendStart,
  sendReady,
  sendAnswer,
  retryLastAnswer,
  sendLeave,
  retryConnection,
} = useInterviewWebSocket()

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

const messagesContainerRef = ref<HTMLElement | null>(null)
const isMuted = ref(false)
const secondsElapsed = ref(0)
const timerId = ref<number | null>(null)
const textInput = ref('')

function stripThinkingTags(text: string) {
  const pattern = new RegExp('<think>[\\s\\S]*?</think>', 'g')
  return text.replace(pattern, '').trim()
}

const displayMessages = computed(() =>
  messages.value
    .filter((m) => m.type !== 'system' || m.text)
    .map((m) => ({ ...m, text: stripThinkingTags(m.text) }))
)

const canSubmitAnswer = computed(() => {
  const hasContent = transcript.value.trim().length > 0 || textInput.value.trim().length > 0
  return hasContent && status.value === 'started' && !rateLimitError.value
})

const canSendReady = computed(() => hasReceivedGreeting.value && status.value === 'connected' && !currentQuestion.value)

const showReconnectModal = computed(() => status.value === 'error' && reconnectAttempts.value >= 3)

const retryCountdown = computed(() => {
  secondsElapsed.value
  if (!rateLimitError.value) return 0
  return Math.max(0, Math.ceil((rateLimitError.value.retryAvailableAt - Date.now()) / 1000))
})

const timerLabel = computed(() => {
  const minutes = Math.floor(secondsElapsed.value / 60)
  const seconds = secondsElapsed.value % 60
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
})

function speakText(text: string) {
  cancelSpeech()
  if (!isMuted.value) {
    speak(text)
  }
}

function submitAnswer() {
  const answer = textInput.value.trim() || transcript.value.trim()
  if (!answer) return

  stopListening()
  resetTranscript()
  textInput.value = ''
  sendAnswer(answer)
}

function startFirstQuestion() {
  textInput.value = ''
  resetTranscript()
  sendReady()
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

function leaveInterview() {
  sendLeave()
  disconnect()
  void router.push('/user')
}

function goToResults() {
  if (interviewResult.value) {
    localStorage.setItem(`interviewResult_${sessionId}`, JSON.stringify(interviewResult.value))
  }
  void router.push(`/results/${sessionId}`)
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

watch(status, (newStatus) => {
  if (newStatus === 'finished') {
    if (timerId.value !== null) {
      window.clearInterval(timerId.value)
    }
    if (interviewResult.value) {
      localStorage.setItem(`interviewResult_${sessionId}`, JSON.stringify(interviewResult.value))
    }
  }
})

onMounted(async () => {
  const token = await getAccessToken()
  if (!token) {
    void router.push('/sign-in')
    return
  }

  connect(sessionId, token)

  timerId.value = window.setInterval(() => {
    secondsElapsed.value += 1
  }, 1000)

  const unwatch = watch(isConnected, (connected) => {
    if (connected) {
      unwatch()
      window.setTimeout(() => {
        sendStart({
          candidateName: displayName.value,
          technologies: technologyKeys.value,
          interviewLevel: interviewLevel.value,
          interviewLanguage: interviewLanguage.value,
        })
      }, 500)
    }
  })
})
</script>
