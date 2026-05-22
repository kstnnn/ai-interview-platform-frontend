import { ref, readonly, onBeforeUnmount } from 'vue'
import { Client, IMessage } from '@stomp/stompjs'
import type { STOMPEvent, InterviewResult, InterviewTopicResult } from '@/types/api'

const WS_BASE_URL = import.meta.env.VITE_INTERVIEW_WS_URL ?? 'ws://localhost:8081/ws'

export type InterviewStatus = 'idle' | 'connecting' | 'connected' | 'started' | 'ready' | 'evaluating' | 'finished' | 'error' | 'reconnecting'

export type InterviewMessage = {
  id: string
  type: 'system' | 'question' | 'answer' | 'evaluation' | 'feedback' | 'error'
  text: string
  timestamp: Date
  metadata?: Record<string, unknown>
}

export type InterviewQuestion = {
  text: string
  index?: number
  total?: number
  roundNumber?: number
  remainingQuestions?: number
  questionType?: string
}

export type RateLimitError = {
  message: string
  retryAfterSeconds: number
  retryAvailableAt: number
}

const isConnected = ref(false)
const isConnecting = ref(false)
const isReconnecting = ref(false)
const status = ref<InterviewStatus>('idle')
const error = ref<string | null>(null)
const messages = ref<InterviewMessage[]>([])
const currentQuestion = ref<InterviewQuestion | null>(null)
const interviewResult = ref<InterviewResult | null>(null)
const reconnectAttempts = ref(0)
const hasReceivedGreeting = ref(false)
const latestAnswerScore = ref<number | null>(null)
const rateLimitError = ref<RateLimitError | null>(null)
const pendingAnswer = ref<{ sessionQuestionId: string; answerText: string } | null>(null)

let stompClient: Client | null = null
let currentSessionId = ''
let questionIndex = 0
let hasSentStart = false
const currentSessionQuestionId = ref('')

const MAX_RECONNECT_ATTEMPTS = 3
const RECONNECT_DELAY = 2000

function addMessage(msg: Omit<InterviewMessage, 'id' | 'timestamp'>) {
  const lastMessage = messages.value.at(-1)
  if (lastMessage?.type !== 'answer' && lastMessage?.text.trim() === msg.text.trim()) {
    return
  }

  messages.value.push({
    ...msg,
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    timestamp: new Date(),
  })
}

function parseEvent(raw: string): STOMPEvent | null {
  try {
    return JSON.parse(raw) as STOMPEvent
  } catch {
    return null
  }
}

function handleEvent(event: STOMPEvent) {
  switch (event.type) {
    case 'GREETING': {
      const text = (event.payload.text as string) || 'Welcome to the interview.'
      addMessage({ type: 'system', text })
      hasReceivedGreeting.value = true
      status.value = 'connected'
      break
    }
    case 'QUESTION_ASKED': {
      const text = (event.payload.question as string) || (event.payload.text as string) || ''
      const roundNumber = (event.payload.roundNumber as number | undefined) ?? undefined
      const index = (event.payload.questionIndex as number | undefined) ?? roundNumber ?? (event.payload.index as number | undefined) ?? ++questionIndex
      const total = (event.payload.maxQuestions as number | undefined) ?? (event.payload.total as number | undefined) ?? undefined
      const remainingQuestions = event.payload.remainingQuestions as number | undefined
      const questionType = event.payload.questionType as string | undefined
      currentSessionQuestionId.value = (event.payload.sessionQuestionId as string) ?? ''
      pendingAnswer.value = null
      rateLimitError.value = null
      currentQuestion.value = { text, index, total, roundNumber, remainingQuestions, questionType }
      addMessage({ type: 'question', text, metadata: { index, total, roundNumber, remainingQuestions, questionType, sessionQuestionId: currentSessionQuestionId.value } })
      status.value = 'started'
      break
    }
    case 'ANSWER_EVALUATED': {
      latestAnswerScore.value = (event.payload.totalScore as number | undefined) ?? (event.payload.score as number | undefined) ?? null
      break
    }
    case 'FEEDBACK': {
      break
    }
    case 'SESSION_FINISHED': {
      const confidence = (event.payload.sessionConfidence as number) ?? 0
      const rawTopics = (event.payload.topics as Array<Record<string, unknown>>) ?? []
      const topics: InterviewTopicResult[] = rawTopics.map((t) => ({
        topic: (t.topic as string) ?? 'Unknown',
        questionsAsked: (t.questionsAsked as number) ?? 0,
        masteryScore: (t.masteryScore as number) ?? 0,
        confidenceScore: (t.confidenceScore as number) ?? 0,
        avgScore: (t.avgScore as number) ?? 0,
      }))

      interviewResult.value = {
        sessionId: currentSessionId,
        sessionConfidence: confidence,
        topics,
      }

      addMessage({ type: 'system', text: 'Interview finished. Redirecting to results...' })
      rateLimitError.value = null
      pendingAnswer.value = null
      currentSessionQuestionId.value = ''
      window.sessionStorage.removeItem(`interviewStarted_${currentSessionId}`)
      status.value = 'finished'
      break
    }
    case 'ERROR': {
      const text = (event.payload.message as string) || (event.payload.error as string) || 'An error occurred.'
      const code = event.payload.code as string | undefined
      if (code === 'AI_RATE_LIMIT') {
        const retryAfterSeconds = Number(event.payload.retryAfterSeconds ?? 0)
        rateLimitError.value = {
          message: text,
          retryAfterSeconds,
          retryAvailableAt: Date.now() + retryAfterSeconds * 1000,
        }
        if (pendingAnswer.value) {
          currentSessionQuestionId.value = pendingAnswer.value.sessionQuestionId
        }
        error.value = text
        status.value = 'started'
        break
      }
      addMessage({ type: 'error', text })
      error.value = text
      break
    }
  }
}

function createClient(sessionId: string, token: string): Client {
  const client = new Client({
    brokerURL: `${WS_BASE_URL}?token=${encodeURIComponent(token)}`,
    reconnectDelay: 0,
    heartbeatIncoming: 4000,
    heartbeatOutgoing: 4000,
    onConnect: () => {
      isConnected.value = true
      isConnecting.value = false
      isReconnecting.value = false
      reconnectAttempts.value = 0
      status.value = 'connected'
      error.value = null

      client.subscribe(`/topic/interviews/${sessionId}/events`, (message: IMessage) => {
        const event = parseEvent(message.body)
        if (event) {
          handleEvent(event)
        }
      })
    },
    onDisconnect: () => {
      isConnected.value = false
    },
    onStompError: (frame) => {
      const errorMsg = frame.headers?.message || 'STOMP protocol error.'
      error.value = errorMsg
      addMessage({ type: 'error', text: errorMsg })
      status.value = 'error'
    },
    onWebSocketError: () => {
      error.value = 'WebSocket connection failed.'
    },
  })

  return client
}

function attemptReconnect(sessionId: string, token: string) {
  if (reconnectAttempts.value >= MAX_RECONNECT_ATTEMPTS) {
    isReconnecting.value = false
    status.value = 'error'
    error.value = 'Connection lost. Unable to reconnect after multiple attempts.'
    addMessage({ type: 'error', text: 'Connection lost. Please refresh the page or leave the interview.' })
    return
  }

  isReconnecting.value = true
  status.value = 'reconnecting'
  reconnectAttempts.value += 1

  setTimeout(() => {
    if (!stompClient || !stompClient.connected) {
      stompClient?.deactivate()
      stompClient = createClient(sessionId, token)
      stompClient.activate()
    }
  }, RECONNECT_DELAY)
}

export function useInterviewWebSocket() {
  function connect(sessionId: string, token: string) {
    currentSessionId = sessionId
    questionIndex = 0
    hasSentStart = window.sessionStorage.getItem(`interviewStarted_${sessionId}`) === 'true'
    hasReceivedGreeting.value = false
    currentSessionQuestionId.value = ''
    latestAnswerScore.value = null
    rateLimitError.value = null
    pendingAnswer.value = null
    messages.value = []
    currentQuestion.value = null
    interviewResult.value = null
    error.value = null
    reconnectAttempts.value = 0
    status.value = 'connecting'
    isConnecting.value = true

    stompClient = createClient(sessionId, token)

    stompClient.onWebSocketClose = () => {
      if (status.value !== 'finished' && status.value !== 'idle') {
        attemptReconnect(sessionId, token)
      }
    }

    stompClient.activate()
  }

  function disconnect() {
    if (stompClient) {
      stompClient.deactivate()
      stompClient = null
    }
    isConnected.value = false
    isConnecting.value = false
    isReconnecting.value = false
    status.value = 'idle'
  }

  function sendStart(dto: { candidateName: string; technologies: string[]; interviewLevel: string; interviewLanguage: string }) {
    if (!stompClient || !stompClient.connected) return
    if (hasSentStart) return
    hasSentStart = true
    window.sessionStorage.setItem(`interviewStarted_${currentSessionId}`, 'true')
    stompClient.publish({
      destination: `/app/interviews/${currentSessionId}/start`,
      body: JSON.stringify({
        candidateName: dto.candidateName ?? '',
        technologies: dto.technologies ?? [],
        interviewLevel: dto.interviewLevel ?? 'MIDDLE',
        interviewLanguage: dto.interviewLanguage ?? 'en',
      }),
    })
  }

  function sendReady() {
    if (!stompClient || !stompClient.connected) return
    status.value = 'ready'
    stompClient.publish({
      destination: `/app/interviews/${currentSessionId}/ready`,
      body: JSON.stringify({}),
    })
  }

  function sendAnswer(answer: string) {
    if (!stompClient || !stompClient.connected) return
    if (!currentSessionQuestionId.value) {
      error.value = 'No active question is available yet.'
      addMessage({ type: 'error', text: 'Wait for the next question before submitting an answer.' })
      return
    }
    const answeredQuestionId = currentSessionQuestionId.value
    pendingAnswer.value = { sessionQuestionId: answeredQuestionId, answerText: answer }
    rateLimitError.value = null
    currentSessionQuestionId.value = ''
    status.value = 'evaluating'
    stompClient.publish({
      destination: `/app/interviews/${currentSessionId}/answers`,
      body: JSON.stringify({
        sessionQuestionId: answeredQuestionId,
        answerText: answer,
      }),
    })
    addMessage({ type: 'answer', text: answer })
  }

  function retryLastAnswer() {
    if (!pendingAnswer.value || !stompClient || !stompClient.connected) return
    if (rateLimitError.value && Date.now() < rateLimitError.value.retryAvailableAt) return

    rateLimitError.value = null
    currentSessionQuestionId.value = ''
    status.value = 'evaluating'
    stompClient.publish({
      destination: `/app/interviews/${currentSessionId}/answers`,
      body: JSON.stringify(pendingAnswer.value),
    })
  }

  function sendLeave() {
    if (!stompClient || !stompClient.connected) return
    stompClient.publish({
      destination: `/app/interviews/${currentSessionId}/leave`,
      body: JSON.stringify({}),
    })
  }

  function retryConnection() {
    if (currentSessionId) {
      const urlParams = new URLSearchParams(stompClient?.brokerURL?.split('?')[1] ?? '')
      const token = urlParams.get('token') ?? ''
      if (token) {
        reconnectAttempts.value = 0
        connect(currentSessionId, token)
      }
    }
  }

  onBeforeUnmount(() => {
    disconnect()
  })

  return {
    isConnected: readonly(isConnected),
    isConnecting: readonly(isConnecting),
    isReconnecting: readonly(isReconnecting),
    status: readonly(status),
    error: readonly(error),
    messages: readonly(messages),
    currentQuestion: readonly(currentQuestion),
    interviewResult: readonly(interviewResult),
    reconnectAttempts: readonly(reconnectAttempts),
    currentSessionQuestionId: readonly(currentSessionQuestionId),
    hasReceivedGreeting: readonly(hasReceivedGreeting),
    latestAnswerScore: readonly(latestAnswerScore),
    rateLimitError: readonly(rateLimitError),
    pendingAnswer: readonly(pendingAnswer),
    connect,
    disconnect,
    sendStart,
    sendReady,
    sendAnswer,
    retryLastAnswer,
    sendLeave,
    retryConnection,
  }
}
