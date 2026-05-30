import { computed, onBeforeUnmount, ref } from 'vue'

export function useAudioAvatar() {
  const mouthOpen = ref(0)
  const isAvatarSpeaking = ref(false)
  const blink = ref(false)
  const headTilt = ref(0)

  let audioContext: AudioContext | null = null
  let analyser: AnalyserNode | null = null
  let animationFrameId: number | null = null
  let blinkIntervalId: number | null = null
  let headIntervalId: number | null = null

  const avatarStyle = computed(() => ({
    transform: `rotate(${headTilt.value}deg)`,
  }))

  const mouthStyle = computed(() => ({
    height: `${Math.max(0.22, mouthOpen.value * 1.6)}rem`,
    width: `${1.5 + mouthOpen.value * 0.8}rem`,
  }))

  function ensureIdleMotion() {
    if (blinkIntervalId === null) {
      blinkIntervalId = window.setInterval(() => {
        blink.value = true
        window.setTimeout(() => {
          blink.value = false
        }, 160)
      }, 3600)
    }

    if (headIntervalId === null) {
      headIntervalId = window.setInterval(() => {
        headTilt.value = Math.random() * 3 - 1.5
      }, 1300)
    }
  }

  function stopAvatarAnimation() {
    if (animationFrameId !== null) {
      window.cancelAnimationFrame(animationFrameId)
      animationFrameId = null
    }
    mouthOpen.value = 0
    isAvatarSpeaking.value = false
  }

  async function attachAudio(audio: HTMLAudioElement) {
    stopAvatarAnimation()
    ensureIdleMotion()

    try {
      audioContext ??= new AudioContext()
      if (audioContext.state === 'suspended') {
        await audioContext.resume()
      }

      analyser = audioContext.createAnalyser()
      analyser.fftSize = 256
      analyser.smoothingTimeConstant = 0.65

      const source = audioContext.createMediaElementSource(audio)
      source.connect(analyser)
      analyser.connect(audioContext.destination)

      const data = new Uint8Array(analyser.frequencyBinCount)
      isAvatarSpeaking.value = true

      const update = () => {
        if (!analyser) return
        analyser.getByteTimeDomainData(data)
        let sum = 0
        for (const value of data) {
          const normalized = (value - 128) / 128
          sum += normalized * normalized
        }
        const rms = Math.sqrt(sum / data.length)
        mouthOpen.value = Math.min(1, Math.max(0, rms * 4.5))
        animationFrameId = window.requestAnimationFrame(update)
      }

      update()
      audio.addEventListener('ended', stopAvatarAnimation, { once: true })
      audio.addEventListener('pause', stopAvatarAnimation, { once: true })
      audio.addEventListener('error', stopAvatarAnimation, { once: true })
    } catch {
      stopAvatarAnimation()
    }
  }

  onBeforeUnmount(() => {
    stopAvatarAnimation()
    if (blinkIntervalId !== null) window.clearInterval(blinkIntervalId)
    if (headIntervalId !== null) window.clearInterval(headIntervalId)
    void audioContext?.close()
  })

  return {
    mouthOpen,
    isAvatarSpeaking,
    blink,
    headTilt,
    avatarStyle,
    mouthStyle,
    attachAudio,
    stopAvatarAnimation,
  }
}
