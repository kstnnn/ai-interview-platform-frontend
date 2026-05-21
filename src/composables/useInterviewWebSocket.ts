import { ref, readonly, onBeforeUnmount } from 'vue'
import { Client, IMessage } from '@stomp/stompjs'
import type { STOMPEvent, InterviewResult, InterviewTopicResult } from '@/types/api'

const WS_BASE_URL = import.meta.env.VITE_INTERVIEW_WS_URL ?? 'ws://localhost:8081/ws'

export type InterviewStatus = 'idle' | 'connecting' | 'connected' | 'started' | 'ready' | 'finished' | 'error' | 'reconnecting'

export type InterviewMessage = {
  id: string
  type: 'system' | 'question' | 'answer' | 'evaluation' | 'feedback' | 'error'
  text: string
  timestamp: Date
  metadata?: Record<string, unknown>
}

const isConnected = ref(false)
const isConnecting = ref(false)
const isReconnecting = ref(false)
const status = ref<InterviewStatus>('idle')
const error = ref<string | null>(null)
const messages = ref<InterviewMessage[]>([])
const currentQuestion = ref<{ text: string; index?: number; total?: number } | null>(null)
const interviewResult = ref<InterviewResult | null>(null)
const reconnectAttempts = ref(0)

let stompClient: Client | null = null
let currentSessionId = ''
let questionIndex = 0
let hasSentStart = false
const currentSessionQuestionId = ref('')

const MAX_RECONNECT_ATTEMPTS = 3
const RECONNECT_DELAY = 2000

function addMessage(msg: Omit<InterviewMessage, 'id' | 'timestamp'>) {
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

function sendReadyInternal() {
  if (!stompClient || !stompClient.connected) return
  stompClient.publish({
    destination: `/app/interviews/${currentSessionId}/ready`,
    body: JSON.stringify({}),
  })
}

function handleEvent(event: STOMPEvent) {
  switch (event.type) {
    case 'GREETING': {
      const text = (event.payload.text as string) || 'Welcome to the interview.'
      addMessage({ type: 'system', text })
      status.value = 'connected'
      console.log('[GREETING] Status set to:', status.value, '— sending /ready')
      sendReadyInternal()
      break
    }
    case 'QUESTION_ASKED': {
      console.log('[QUESTION_ASKED] Full payload:', JSON.stringify(event.payload))
      const text = (event.payload.question as string) || (event.payload.text as string) || ''
      const index = (event.payload.index as number) ?? ++questionIndex
      const total = (event.payload.total as number) ?? undefined
      currentSessionQuestionId.value = (event.payload.sessionQuestionId as string) ?? ''
      console.log('[QUESTION_ASKED] sessionQuestionId:', currentSessionQuestionId.value)
      currentQuestion.value = { text, index, total }
      addMessage({ type: 'question', text, metadata: { index, total } })
      status.value = 'started'
      console.log('[QUESTION_ASKED] Status set to:', status.value)
      break
    }
    case 'ANSWER_EVALUATED': {
      const text = (event.payload.evaluation as string) || (event.payload.feedback as string) || 'Answer received.'
      const score = event.payload.score as number | undefined
      addMessage({ type: 'evaluation', text, metadata: { score } })
      break
    }
    case 'FEEDBACK': {
      const text = (event.payload.text as string) || (event.payload.message as string) || ''
      if (text) {
        addMessage({ type: 'feedback', text })
      }
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
      status.value = 'finished'
      break
    }
    case 'ERROR': {
      const text = (event.payload.message as string) || (event.payload.error as string) || 'An error occurred.'
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
    hasSentStart = false
    currentSessionQuestionId.value = ''
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
    stompClient.publish({
      destination: `/app/interviews/${currentSessionId}/ready`,
      body: JSON.stringify({}),
    })
  }

  function sendAnswer(answer: string) {
    if (!stompClient || !stompClient.connected) return
    if (!currentSessionQuestionId.value) {
      console.warn('[useInterviewWebSocket] No sessionQuestionId available — answer may be rejected by backend.')
    }
    stompClient.publish({
      destination: `/app/interviews/${currentSessionId}/answers`,
      body: JSON.stringify({
        sessionQuestionId: currentSessionQuestionId.value,
        answerText: answer,
      }),
    })
    addMessage({ type: 'answer', text: answer })
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
    connect,
    disconnect,
    sendStart,
    sendAnswer,
    sendLeave,
    retryConnection,
  }
}
