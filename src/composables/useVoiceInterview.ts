import { computed, onBeforeUnmount, ref, toValue, type MaybeRefOrGetter } from 'vue'
import { synthesizeInterviewSpeech, transcribeInterviewAudio } from '@/api/interview'

const TRANSCRIPTION_TIMEOUT_MS = 120_000

export function useVoiceInterview(sessionId: MaybeRefOrGetter<string>, speechLocale: MaybeRefOrGetter<string> = 'en-US') {
  const transcript = ref('')
  const interimTranscript = ref('')
  const transcriptionLanguage = ref<string | null>(null)
  const isListening = ref(false)
  const isTranscribing = ref(false)
  const isSpeaking = ref(false)
  const error = ref<string | null>(null)
  const isTranscriptionTimeout = ref(false)

  let mediaRecorder: MediaRecorder | null = null
  let microphoneStream: MediaStream | null = null
  let audioChunks: Blob[] = []
  const lastAudioBlob = ref<Blob | null>(null)
  const lastAudioMimeType = ref('audio/webm')
  let currentAudio: HTMLAudioElement | null = null

  const canRetryTranscription = computed(() => !!lastAudioBlob.value && !isListening.value && !isTranscribing.value)

  const speechRecognitionSupported = computed(() => {
    return typeof navigator !== 'undefined' && !!navigator.mediaDevices?.getUserMedia && typeof MediaRecorder !== 'undefined'
  })

  const speechSynthesisSupported = computed(() => {
    return typeof window !== 'undefined' && 'speechSynthesis' in window
  })

  function stopMicrophone() {
    microphoneStream?.getTracks().forEach((track) => track.stop())
    microphoneStream = null
  }

  function getAudioMimeType() {
    if (typeof MediaRecorder === 'undefined') return 'audio/webm'
    if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) return 'audio/webm;codecs=opus'
    if (MediaRecorder.isTypeSupported('audio/webm')) return 'audio/webm'
    if (MediaRecorder.isTypeSupported('audio/mp4')) return 'audio/mp4'
    return 'audio/webm'
  }

  function getAudioExtension(mimeType: string) {
    if (mimeType.includes('mp4')) return 'm4a'
    if (mimeType.includes('mpeg')) return 'mp3'
    if (mimeType.includes('wav')) return 'wav'
    return 'webm'
  }

  async function transcribeRecordedAudio(blob: Blob, mimeType: string) {
    const activeSessionId = toValue(sessionId)
    if (!activeSessionId) {
      error.value = 'Interview session is not available.'
      return
    }

    const extension = getAudioExtension(mimeType)
    const audioFile = new File([blob], `answer.${extension}`, { type: mimeType })

    isTranscribing.value = true
    error.value = null
    isTranscriptionTimeout.value = false
    const abortController = new AbortController()
    const timeoutId = window.setTimeout(() => abortController.abort(), TRANSCRIPTION_TIMEOUT_MS)
    try {
      const response = await transcribeInterviewAudio(activeSessionId, audioFile, abortController.signal)
      transcript.value = response.text.trim()
      transcriptionLanguage.value = response.language
    } catch (err) {
      isTranscriptionTimeout.value = err instanceof Error && err.name === 'AbortError'
      error.value = isTranscriptionTimeout.value
        ? 'Transcription is taking longer than expected. The model may still be warming up. Try again.'
        : err instanceof Error ? err.message : 'Audio transcription failed.'
    } finally {
      window.clearTimeout(timeoutId)
      isTranscribing.value = false
    }
  }

  async function startListening() {
    if (!speechRecognitionSupported.value || isListening.value || isTranscribing.value) {
      return
    }

    error.value = null
    isTranscriptionTimeout.value = false
    transcript.value = ''
    interimTranscript.value = ''
    transcriptionLanguage.value = null
    audioChunks = []

    try {
      microphoneStream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mimeType = getAudioMimeType()
      mediaRecorder = new MediaRecorder(microphoneStream, { mimeType })

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunks.push(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        const recordedMimeType = mediaRecorder?.mimeType || mimeType
        const blob = new Blob(audioChunks, { type: recordedMimeType })
        isListening.value = false
        stopMicrophone()
        mediaRecorder = null

        if (blob.size === 0) {
          error.value = 'No audio was recorded.'
          return
        }

        lastAudioBlob.value = blob
        lastAudioMimeType.value = recordedMimeType
        void transcribeRecordedAudio(blob, recordedMimeType)
      }

      mediaRecorder.onerror = () => {
        error.value = 'Audio recording failed.'
        isListening.value = false
        stopMicrophone()
      }

      mediaRecorder.start()
      isListening.value = true
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Microphone access failed.'
      isListening.value = false
      stopMicrophone()
    }
  }

  function stopListening() {
    if (!mediaRecorder || mediaRecorder.state === 'inactive') {
      isListening.value = false
      stopMicrophone()
      return
    }

    mediaRecorder.stop()
  }

  function resetTranscript() {
    transcript.value = ''
    interimTranscript.value = ''
    transcriptionLanguage.value = null
    error.value = null
    isTranscriptionTimeout.value = false
  }

  function retryTranscription() {
    if (!lastAudioBlob.value || isTranscribing.value || isListening.value) {
      return
    }

    transcript.value = ''
    interimTranscript.value = ''
    transcriptionLanguage.value = null
    void transcribeRecordedAudio(lastAudioBlob.value, lastAudioMimeType.value)
  }

  function speakWithBrowser(text: string) {
    if (!speechSynthesisSupported.value) {
      return
    }

    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    const locale = toValue(speechLocale)
    utterance.lang = locale
    const voice = window.speechSynthesis.getVoices().find((candidate) => candidate.lang.toLowerCase().startsWith(locale.toLowerCase().slice(0, 2)))
    if (voice) {
      utterance.voice = voice
    }
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

  async function speak(text: string) {
    cancelSpeech()
    if (!text.trim()) return

    isSpeaking.value = true
    try {
      const audio = await synthesizeInterviewSpeech({ text, speaker: 'baya' })
      const objectUrl = URL.createObjectURL(audio)
      currentAudio = new Audio(objectUrl)
      currentAudio.onended = () => {
        URL.revokeObjectURL(objectUrl)
        isSpeaking.value = false
        currentAudio = null
      }
      currentAudio.onerror = () => {
        URL.revokeObjectURL(objectUrl)
        currentAudio = null
        speakWithBrowser(text)
      }
      await currentAudio.play()
    } catch {
      speakWithBrowser(text)
    }
  }

  function cancelSpeech() {
    if (currentAudio) {
      currentAudio.pause()
      currentAudio.currentTime = 0
      currentAudio = null
    }

    if (speechSynthesisSupported.value) {
      window.speechSynthesis.cancel()
    }
    isSpeaking.value = false
  }

  onBeforeUnmount(() => {
    stopListening()
    cancelSpeech()
  })

  return {
    transcript,
    interimTranscript,
    transcriptionLanguage,
    isListening,
    isTranscribing,
    isSpeaking,
    error,
    isTranscriptionTimeout,
    canRetryTranscription,
    speechRecognitionSupported,
    speechSynthesisSupported,
    startListening,
    stopListening,
    resetTranscript,
    retryTranscription,
    speak,
    cancelSpeech,
  }
}
