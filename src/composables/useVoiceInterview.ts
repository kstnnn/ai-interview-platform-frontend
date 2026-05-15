import { computed, onBeforeUnmount, ref } from 'vue'

interface SpeechRecognitionAlternative {
  transcript: string
}

interface SpeechRecognitionResultLike {
  isFinal: boolean
  0: SpeechRecognitionAlternative
}

interface SpeechRecognitionResultListLike {
  length: number
  [index: number]: SpeechRecognitionResultLike
}

interface SpeechRecognitionEventLike extends Event {
  resultIndex: number
  results: SpeechRecognitionResultListLike
}

interface SpeechRecognitionErrorEventLike extends Event {
  error: string
}

interface SpeechRecognitionLike {
  continuous: boolean
  interimResults: boolean
  lang: string
  onresult: ((event: SpeechRecognitionEventLike) => void) | null
  onerror: ((event: SpeechRecognitionErrorEventLike) => void) | null
  onend: (() => void) | null
  start: () => void
  stop: () => void
}

type SpeechRecognitionCtor = new () => SpeechRecognitionLike

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionCtor
    webkitSpeechRecognition?: SpeechRecognitionCtor
  }
}

export function useVoiceInterview() {
  const transcript = ref('')
  const interimTranscript = ref('')
  const isListening = ref(false)
  const isSpeaking = ref(false)
  const error = ref<string | null>(null)
  const recognition = ref<SpeechRecognitionLike | null>(null)

  const speechRecognitionSupported = computed(() => {
    return typeof window !== 'undefined' && !!(window.SpeechRecognition || window.webkitSpeechRecognition)
  })

  const speechSynthesisSupported = computed(() => {
    return typeof window !== 'undefined' && 'speechSynthesis' in window
  })

  function ensureRecognition() {
    if (!speechRecognitionSupported.value || recognition.value) {
      return
    }

    const Ctor = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!Ctor) {
      return
    }

    const instance = new Ctor()
    instance.continuous = true
    instance.interimResults = true
    instance.lang = 'en-US'

    instance.onresult = (event: SpeechRecognitionEventLike) => {
      let finalText = ''
      let interimText = ''

      for (let index = event.resultIndex; index < event.results.length; index += 1) {
        const result = event.results[index]
        if (result.isFinal) {
          finalText += result[0].transcript
        } else {
          interimText += result[0].transcript
        }
      }

      if (finalText) {
        transcript.value = `${transcript.value} ${finalText}`.trim()
      }

      interimTranscript.value = interimText
    }

    instance.onerror = (event: SpeechRecognitionErrorEventLike) => {
      if (event.error !== 'no-speech') {
        error.value = event.error
      }
      isListening.value = false
    }

    instance.onend = () => {
      isListening.value = false
    }

    recognition.value = instance
  }

  function startListening() {
    ensureRecognition()
    if (!recognition.value || isListening.value) {
      return
    }

    error.value = null
    transcript.value = ''
    interimTranscript.value = ''
    recognition.value.start()
    isListening.value = true
  }

  function stopListening() {
    if (!recognition.value || !isListening.value) {
      return
    }

    recognition.value.stop()
    isListening.value = false
  }

  function resetTranscript() {
    transcript.value = ''
    interimTranscript.value = ''
  }

  function speak(text: string) {
    if (!speechSynthesisSupported.value) {
      return
    }

    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = 1
    utterance.pitch = 1
    utterance.onstart = () => {
      isSpeaking.value = true
    }
    utterance.onend = () => {
      isSpeaking.value = false
    }
    utterance.onerror = () => {
      isSpeaking.value = false
    }
    window.speechSynthesis.speak(utterance)
  }

  function cancelSpeech() {
    if (!speechSynthesisSupported.value) {
      return
    }

    window.speechSynthesis.cancel()
    isSpeaking.value = false
  }

  onBeforeUnmount(() => {
    stopListening()
    cancelSpeech()
  })

  return {
    transcript,
    interimTranscript,
    isListening,
    isSpeaking,
    error,
    speechRecognitionSupported,
    speechSynthesisSupported,
    startListening,
    stopListening,
    resetTranscript,
    speak,
    cancelSpeech,
  }
}
