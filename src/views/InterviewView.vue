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
              <BaseButton variant="outline" size="sm" @click="toggleAutoSpeak">
                <component :is="autoSpeakQuestions ? Volume2 : VolumeX" class="h-4 w-4" />
                {{ autoSpeakQuestions ? t('interview.autoSpeakOn') : t('interview.autoSpeakOff') }}
              </BaseButton>
              <BaseButton variant="outline" size="sm" @click="toggleViewMode">
                <Bot class="h-4 w-4" />
                {{ viewMode === 'chat' ? t('interview.avatarView') : t('interview.chatView') }}
              </BaseButton>
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

        <div ref="messagesContainerRef" class="min-h-0 flex-1 overflow-y-auto p-6" :class="viewMode === 'chat' ? 'space-y-4' : ''">
          <template v-if="viewMode === 'chat'">
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

          <div v-if="isListening || isTranscribing" class="flex justify-end gap-3">
            <div
              class="max-w-[75%] rounded-organic bg-primary px-5 py-3 text-sm leading-relaxed text-primary-foreground shadow-soft">
              {{ isTranscribing ? t('interview.transcribing') : t('interview.recording') }}
            </div>
            <div
              class="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-organic bg-accent text-accent-foreground shadow-soft">
              <User class="h-5 w-5" />
            </div>
          </div>
          </template>

          <div v-else class="flex h-full min-h-[360px] flex-col justify-between gap-6">
            <div class="flex flex-1 flex-col items-center justify-center text-center">
              <div class="relative">
                <div class="absolute inset-[-1.25rem] rounded-full bg-primary/10 blur-2xl" :class="isAvatarSpeaking || isSpeaking ? 'animate-pulse' : ''"></div>
                <div class="relative flex h-48 w-48 items-center justify-center rounded-full border border-primary/20 bg-gradient-to-br from-primary/20 via-secondary to-background shadow-soft transition-transform duration-500" :style="avatarStyle">
                  <div class="absolute top-12 flex w-24 justify-between">
                    <div class="h-4 w-4 rounded-full bg-foreground transition-transform duration-150" :class="blink ? 'scale-y-[0.12]' : ''"></div>
                    <div class="h-4 w-4 rounded-full bg-foreground transition-transform duration-150" :class="blink ? 'scale-y-[0.12]' : ''"></div>
                  </div>
                  <div class="absolute top-20 h-2 w-5 rounded-full bg-primary/40"></div>
                  <div class="absolute bottom-14 rounded-full bg-primary transition-all duration-75" :style="mouthStyle"></div>
                  <Bot class="absolute bottom-4 right-8 h-6 w-6 text-primary" />
                </div>
              </div>

              <p class="mt-6 text-sm font-semibold uppercase tracking-[0.2em] text-primary">{{ t('interview.aiInterviewer') }}</p>
              <h3 class="mt-2 text-2xl font-bold text-foreground">{{ avatarStateLabel }}</h3>
              <p class="mt-4 max-w-2xl text-lg leading-relaxed text-foreground">
                {{ currentQuestion?.text || greetingText || t('interview.statePreparing') }}
              </p>
            </div>

            <div class="grid gap-4 md:grid-cols-2">
              <div class="rounded-[1.5rem] border border-border/60 bg-background/80 p-4">
                <p class="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">{{ t('interview.lastQuestion') }}</p>
                <p class="mt-2 line-clamp-3 text-sm leading-relaxed text-foreground">{{ lastQuestionMessage?.text || t('interview.noQuestionYet') }}</p>
              </div>
              <div class="rounded-[1.5rem] border border-border/60 bg-background/80 p-4">
                <p class="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">{{ t('interview.lastAnswer') }}</p>
                <p class="mt-2 line-clamp-3 text-sm leading-relaxed text-foreground">{{ lastAnswerMessage?.text || t('interview.noAnswerYet') }}</p>
              </div>
            </div>
          </div>
        </div>

        <div class="border-t border-border/30 bg-background/60 p-6">
          <div v-if="voiceError"
            class="mb-4 rounded-organic border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">
            {{ voiceError }}
          </div>
          <div v-if="answerValidationError"
            class="mb-4 rounded-organic border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">
            {{ answerValidationError }}
          </div>
          <div v-if="!speechRecognitionSupported"
            class="mb-4 rounded-organic border border-warning/20 bg-warning/10 p-4 text-sm text-foreground">
            {{ t('interview.voiceUnsupported') }}
          </div>

          <textarea
            v-model="textInput"
            :placeholder="t('interview.typeAnswer')"
            :disabled="status === 'finished' || status === 'connected' || status === 'ready' || status === 'evaluating' || isListening || isTranscribing || Boolean(rateLimitError)"
            rows="3"
            class="mb-4 w-full resize-none rounded-organic border border-border bg-input px-4 py-3 text-sm leading-relaxed outline-none transition focus:border-primary disabled:opacity-50"
          />

          <div v-if="transcript" class="mb-4 rounded-organic border border-primary/20 bg-primary/5 p-4">
            <div class="mb-2 flex flex-wrap items-center justify-between gap-2">
              <p class="text-sm font-semibold text-foreground">{{ t('interview.editTranscript') }}</p>
              <p v-if="transcriptionLanguage" class="text-xs text-muted-foreground">
                {{ t('interview.transcriptLanguage').replace('{language}', transcriptionLanguage) }}
              </p>
            </div>
            <textarea
              v-model="transcript"
              :disabled="status === 'finished' || status === 'evaluating' || Boolean(rateLimitError)"
              rows="3"
              class="w-full resize-none rounded-organic border border-border bg-input px-4 py-3 text-sm leading-relaxed outline-none transition focus:border-primary disabled:opacity-50"
            />
          </div>

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

            <BaseButton v-if="speechRecognitionSupported" :disabled="status === 'finished' || status === 'connected' || status === 'ready' || status === 'evaluating' || isTranscribing || Boolean(rateLimitError)" :variant="isListening ? 'primary' : 'outline'" @click="toggleListening">
              <component :is="isListening ? MicOff : Mic" class="h-5 w-5" />
              {{ isListening ? t('interview.stopRecording') : t('interview.startRecording') }}
            </BaseButton>

            <BaseButton v-if="transcript && speechRecognitionSupported" variant="outline" :disabled="status === 'finished' || status === 'evaluating' || isListening || isTranscribing || Boolean(rateLimitError)" @click="rerecordAnswer">
              <Mic class="h-4 w-4" />
              {{ t('interview.rerecord') }}
            </BaseButton>

            <BaseButton :disabled="status === 'finished'" @click="submitAnswer">
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
import { useAudioAvatar } from '@/composables/useAudioAvatar'
import { useVoiceInterview } from '@/composables/useVoiceInterview'
import { useInterviewWebSocket } from '@/composables/useInterviewWebSocket'
import { useAppSession } from '@/composables/useAppSession'
import { getAccessToken } from '@/auth/zitadel'
import { getInterviewSession } from '@/api/interview'
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
const speechLocale = computed(() => (interviewLanguage.value === 'Russian' ? 'ru-RU' : 'en-US'))
const viewMode = ref<'chat' | 'avatar'>('chat')

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
  isAvatarSpeaking,
  blink,
  avatarStyle,
  mouthStyle,
  attachAudio,
} = useAudioAvatar()

const {
  transcript,
  transcriptionLanguage,
  isListening,
  isTranscribing,
  isSpeaking,
  error: voiceError,
  isTranscriptionTimeout,
  canRetryTranscription,
  speechRecognitionSupported,
  startListening,
  stopListening,
  resetTranscript,
  retryTranscription,
  speak,
  cancelSpeech,
} = useVoiceInterview(sessionId, speechLocale, { onAudioElement: attachAudio })

const messagesContainerRef = ref<HTMLElement | null>(null)
const isMuted = ref(false)
const autoSpeakQuestions = ref(true)
const secondsElapsed = ref(0)
const timerId = ref<number | null>(null)
const textInput = ref('')
const hasSpokenGreeting = ref(false)
const answerValidationError = ref('')
let hasRequestedStart = false

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
  return hasContent && status.value === 'started' && !isListening.value && !isTranscribing.value && !rateLimitError.value
})

const canSendReady = computed(() => hasReceivedGreeting.value && status.value === 'connected' && !currentQuestion.value)

const greetingText = computed(() => {
  return messages.value.find((message) => message.type === 'system' && message.text.trim().length > 0)?.text ?? ''
})

const lastQuestionMessage = computed(() => displayMessages.value.filter((message) => message.type === 'question').at(-1))

const lastAnswerMessage = computed(() => displayMessages.value.filter((message) => message.type === 'answer').at(-1))

const avatarStateLabel = computed(() => {
  if (isSpeaking.value || isAvatarSpeaking.value) return t('interview.stateSpeaking')
  if (isListening.value) return t('interview.stateListening')
  if (isTranscribing.value) return t('interview.stateRecognizing')
  if (status.value === 'evaluating') return t('interview.stateThinking')
  if (currentQuestion.value) return t('interview.stateWaiting')
  return t('interview.statePreparing')
})

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

const voiceErrorText = computed(() => {
  if (!voiceError.value) return ''
  return isTranscriptionTimeout.value ? t('interview.transcriptionTimeout') : t('interview.transcriptionFailed')
})

function speakText(text: string) {
  cancelSpeech()
  if (!isMuted.value) {
    speak(text)
  }
}

function submitAnswer() {
  answerValidationError.value = ''
  if (status.value === 'connected' || status.value === 'ready' || !currentQuestion.value) {
    answerValidationError.value = t('validation.waitForQuestion')
    return
  }
  if (isListening.value || isTranscribing.value) {
    answerValidationError.value = t('validation.waitForRecognition')
    return
  }

  const answer = transcript.value.trim() || textInput.value.trim()
  if (!answer) {
    answerValidationError.value = t('validation.answerRequired')
    return
  }

  stopListening()
  resetTranscript()
  textInput.value = ''
  sendAnswer(answer)
}

function startFirstQuestion() {
  textInput.value = ''
  answerValidationError.value = ''
  resetTranscript()
  sendReady()
}

function toggleListening() {
  if (isListening.value) {
    stopListening()
    return
  }

  cancelSpeech()
  answerValidationError.value = ''
  startListening()
}

function rerecordAnswer() {
  resetTranscript()
  textInput.value = ''
  cancelSpeech()
  startListening()
}

function toggleMute() {
  if (!isMuted.value) {
    cancelSpeech()
  }
  isMuted.value = !isMuted.value
}

function toggleAutoSpeak() {
  autoSpeakQuestions.value = !autoSpeakQuestions.value
}

function toggleViewMode() {
  viewMode.value = viewMode.value === 'chat' ? 'avatar' : 'chat'
}

function leaveInterview() {
  sendLeave()
  disconnect()
  void router.push('/user')
}

function goToResults() {
  void router.push(`/results/${sessionId}`)
}

function requestInterviewStart() {
  if (hasRequestedStart) return
  hasRequestedStart = true
  window.setTimeout(() => {
    sendStart({
      candidateName: displayName.value,
      technologies: technologyKeys.value,
      interviewLevel: interviewLevel.value,
      interviewLanguage: interviewLanguage.value,
    })
  }, 500)
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
  }
})

watch(
  () => currentQuestion.value?.text,
  (questionText) => {
    if (questionText && autoSpeakQuestions.value) {
      speakText(questionText)
    }
  },
)

watch(greetingText, (text) => {
  if (!text || hasSpokenGreeting.value || !autoSpeakQuestions.value) {
    return
  }

  hasSpokenGreeting.value = true
  speakText(text)
})

onMounted(async () => {
  const token = await getAccessToken()
  if (!token) {
    void router.push('/sign-in')
    return
  }

  const session = await getInterviewSession(sessionId)
  if (session.status === 'COMPLETED' || session.status === 'CANCELLED') {
    void router.replace(`/results/${sessionId}`)
    return
  }

  const unwatch = watch(isConnected, (connected) => {
    if (connected) {
      unwatch()
      requestInterviewStart()
    }
  })

  connect(sessionId, token)

  if (isConnected.value) {
    unwatch()
    requestInterviewStart()
  }

  timerId.value = window.setInterval(() => {
    secondsElapsed.value += 1
  }, 1000)
})
</script>
