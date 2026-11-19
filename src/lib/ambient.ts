/**
 * RETRO COMPUTING SOUL — "QUIET NIGHT ROOM" + LO-FI
 *
 * Calm within seconds; always optional, never intrusive.
 *
 * MAIN LAYER — chill lo-fi hip hop playlist (src/lib/playlist.ts):
 *   - Generative tracks are synthesized live (self-generated audio: no
 *     downloads, no licensing, never audibly loops). 70–85 BPM, warm FM
 *     Rhodes-style keys, soft dusty drums, mellow bass, light vinyl crackle.
 *   - 'file' tracks stream through an HTML <audio> element routed via
 *     MediaElementSource so the same filter/gain chain applies.
 *   - Gentle playlist with shuffle and ~5 s crossfades. No vocals, no drops.
 *
 * SUPPORT LAYERS (10–15 dB under the music, via a ducked support bus):
 *   warm pad drone (D Dorian, gliding chords, never loops), faint CRT hum
 *   + soft air, soft distant rain, rare muffled keystroke (20–40 s).
 *
 * INTERACTION:
 *   - Scroll gently opens a low-pass on the MUSIC (brighter when moving,
 *     warmer when still). Tiny and slow. Lazy Mode: steady.
 *   - 99% stall: the music muffles through the low-pass (from another room),
 *     the beat softens; only vinyl crackle and rain remain for a heartbeat.
 *   - 100%: the filter opens, the track swells back + a warm resolving chord
 *     and soft bell. Relief, not a fanfare.
 *   - Project hover/click: one soft low rounded tone. Gauge ticks barely
 *     audible. No notification beeps anywhere.
 *
 * MIXING: master ≈ 27% with a limiter, gentle HF roll-off on the whole mix,
 * 3 s fade-in, 1.5 s fade-out, auto-pause when the tab is hidden, lazy
 * graph creation after the first click, fully functional with sound off.
 * 100% self-generated audio unless 'file' tracks are configured.
 */

import { PLAYLIST, type PlaylistTrack, type GeneratedPreset } from './playlist'

type AmbientState = 'off' | 'stalled' | 'running'

/* D Dorian, open low-mid voicings (Hz) — support pad + resolve chord. */
const CHORDS: number[][] = [
  [146.83, 174.61, 220.0, 261.63, 329.63], // Dm9
  [98.0, 123.47, 146.83, 196.0, 220.0],   // Gadd9
  [130.81, 164.81, 196.0, 246.94, 293.66],// Cmaj9
  [110.0, 130.81, 164.81, 196.0, 246.94], // Am9
]
const HOLD_VOICING: number[] = [146.83, 164.81, 220.0, 293.66, 293.66]   // suspended, unresolved
const RESOLVE_VOICING: number[] = [146.83, 220.0, 261.63, 329.63, 392.0] // warm open resolution

/* ---------------------------------------------------------------------- */
/*  GENERATIVE LO-FI PRESETS (70–85 BPM, 16-step bars, swung)              */
/* ---------------------------------------------------------------------- */

type LoFiPreset = {
  bpm: number
  /** Chord progression: index into CHORDS, 2 bars each. */
  progression: number[]
  /** Rhodes voicing offsets above the pad chord (semitones). */
  keysOctave: number
  keysLevel: number
  kick: number[]       // 16-step velocities 0..1
  rim: number[]
  hat: number[]
  bassPattern: number[] // step -> scale degree offset (or -1 = rest)
  bassLevel: number
  crackle: number
  warm: number          // extra low-pass warmth (Hz offset, negative = warmer)
}

const PRESETS: Record<GeneratedPreset, LoFiPreset> = {
  midnight: {
    bpm: 76,
    progression: [0, 3, 1, 2], // Dm9, Am9, Gadd9, Cmaj9
    keysOctave: 0,
    keysLevel: 0.85,
    kick: [1, 0, 0, 0, 0, 0, 0.8, 0, 0, 0, 1, 0, 0, 0, 0, 0],
    rim: [0, 0, 0.55, 0, 0, 0, 0, 0.45, 0, 0, 0.55, 0, 0, 0, 0.35, 0],
    hat: [0, 0.2, 0, 0.3, 0, 0.2, 0, 0.25, 0, 0.2, 0, 0.3, 0, 0.2, 0, 0.28],
    bassPattern: [0, -1, -1, -1, -1, -1, 0, -1, -1, -1, 7, -1, -1, -1, -1, -1],
    bassLevel: 0.8,
    crackle: 1,
    warm: 0,
  },
  rainfall: {
    bpm: 72,
    progression: [0, 2, 3, 2],
    keysOctave: 1,
    keysLevel: 0.7,
    kick: [1, 0, 0, 0, 0, 0, 0, 0, 0.85, 0, 0, 0, 0, 0, 0, 0],
    rim: [0, 0, 0.4, 0, 0, 0, 0.3, 0, 0, 0, 0.45, 0, 0, 0, 0, 0],
    hat: [0, 0.15, 0, 0.22, 0, 0.15, 0, 0.2, 0, 0.15, 0, 0.22, 0, 0.15, 0, 0.2],
    bassPattern: [0, -1, -1, -1, -1, -1, -1, -1, 5, -1, -1, -1, -1, -1, 3, -1],
    bassLevel: 0.72,
    crackle: 1.35,
    warm: -250,
  },
  study: {
    bpm: 82,
    progression: [2, 0, 3, 1],
    keysOctave: 1,
    keysLevel: 0.95,
    kick: [1, 0, 0, 0, 0, 0, 0.75, 0, 0, 0, 0.9, 0, 0, 0, 0.4, 0],
    rim: [0, 0, 0.6, 0, 0, 0, 0, 0.5, 0, 0, 0.6, 0, 0, 0, 0.5, 0],
    hat: [0, 0.28, 0, 0.35, 0, 0.28, 0, 0.32, 0, 0.28, 0, 0.35, 0, 0.28, 0, 0.35],
    bassPattern: [0, -1, 7, -1, -1, -1, 0, -1, -1, -1, 7, -1, -1, -1, 5, -1],
    bassLevel: 0.85,
    crackle: 0.9,
    warm: 300,
  },
  tape: {
    bpm: 70,
    progression: [3, 0, 1, 0],
    keysOctave: 0,
    keysLevel: 0.75,
    kick: [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.8, 0, 0, 0, 0, 0],
    rim: [0, 0, 0.5, 0, 0, 0, 0, 0, 0, 0, 0.5, 0, 0, 0, 0.3, 0],
    hat: [0, 0.18, 0, 0.25, 0, 0.18, 0, 0.22, 0, 0.18, 0, 0.25, 0, 0.18, 0, 0.22],
    bassPattern: [0, -1, -1, -1, -1, -1, -1, -1, -1, -1, 0, -1, -1, -1, -1, -1],
    bassLevel: 0.95,
    crackle: 1.15,
    warm: -450,
  },
}

export class Ambient {
  private ctx: AudioContext | null = null

  /** Master chain: master → limiter → destination. */
  private master: GainNode | null = null
  private limiter: DynamicsCompressorNode | null = null

  /** Mix bus: tape-warmth low-pass → master. */
  private mixBus: GainNode | null = null
  private reverb: ConvolverNode | null = null

  private state: AmbientState = 'off'
  private supportGain: GainNode | null = null
  private padGain: GainNode | null = null
  private padFilter: BiquadFilterNode | null = null
  private voices: Array<{ oscA: OscillatorNode; oscB: OscillatorNode; gain: GainNode }> = []
  private rainGain: GainNode | null = null
  private rainFilter: BiquadFilterNode | null = null
  private keysGain: GainNode | null = null
  private noiseBuffer: AudioBuffer | null = null

  /** MUSIC bus: filter (scroll-reactive, muffled on stall) → gain → mix. */
  private musicFilter: BiquadFilterNode | null = null
  private musicGain: GainNode | null = null
  private crackleGain: GainNode | null = null
  private analyser: AnalyserNode | null = null
  private musicVolume = 0.8 // mini-player volume (0..1)

  /** Generative sequencer state. */
  private trackIndex = 0
  private schedulerId: number | null = null
  private step = 0
  private nextStepTime = 0
  private barCount = 0
  private crackleId: number | null = null
  private keysTimer: number | null = null
  private chordTimer: number | null = null
  private walkTimer: number | null = null

  /** 'file' track support (MediaElementSource). */
  private fileEl: HTMLAudioElement | null = null
  private fileSource: MediaElementAudioSourceNode | null = null

  /** Scroll activity (0..1, slow) — tiny music filter openings. */
  private activity = 0
  private activityTarget = 0
  private lazyMode = false

  /** Tab-hidden pause. */
  private hiddenPaused = false

  private humNodes: AudioScheduledSourceNode[] = []

  /** UI sync listeners (mini player). */
  private listeners = new Set<() => void>()

  subscribe(fn: () => void) {
    this.listeners.add(fn)
    return () => {
      this.listeners.delete(fn)
    }
  }

  private notify() {
    this.listeners.forEach((fn) => fn())
  }

  get isPlaying() {
    return this.state === 'running'
  }

  /** Current music activity (0..1) — for the mini player's gentle bars. */
  get level() {
    return this.activity
  }

  /** Active track metadata for the "NOW PLAYING" line. */
  get nowPlaying(): PlaylistTrack {
    return PLAYLIST[this.trackIndex % PLAYLIST.length]
  }

  /** Profile label for UI hints. */
  get label() {
    const t = this.nowPlaying
    return `${t.title.toUpperCase()} // LO-FI`
  }

  /* ------------------------------------------------------------------ */
  /* Context + graph creation (lazy, on first gesture)                   */
  /* ------------------------------------------------------------------ */

  private initContext() {
    if (this.ctx) return this.ctx
    const Ctor =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    if (!Ctor) return null
    this.ctx = new Ctor()
    return this.ctx
  }

  private buildGraph(ctx: AudioContext) {
    // --- Master: fade gain → limiter → out ---
    this.master = ctx.createGain()
    this.master.gain.value = 0

    this.limiter = ctx.createDynamicsCompressor()
    this.limiter.threshold.value = -14
    this.limiter.knee.value = 20
    this.limiter.ratio.value = 12
    this.limiter.attack.value = 0.01
    this.limiter.release.value = 0.25

    this.master.connect(this.limiter)
    this.limiter.connect(ctx.destination)

    // --- Mix bus with tape warmth: low-pass + slight high-shelf cut ---
    this.mixBus = ctx.createGain()
    const mixFilter = ctx.createBiquadFilter()
    mixFilter.type = 'lowpass'
    mixFilter.frequency.value = 8000
    mixFilter.Q.value = 0.5
    const shelf = ctx.createBiquadFilter()
    shelf.type = 'highshelf'
    shelf.frequency.value = 5200
    shelf.gain.value = -6
    this.mixBus.connect(mixFilter)
    mixFilter.connect(shelf)
    shelf.connect(this.master)

    // --- Generous reverb: generated impulse ---
    this.reverb = ctx.createConvolver()
    this.reverb.buffer = this.makeImpulse(ctx, 3.2, 2.8)
    const reverbGain = ctx.createGain()
    reverbGain.gain.value = 0.55
    this.reverb.connect(reverbGain)
    reverbGain.connect(this.mixBus)

    // Shared noise buffer (rain, air, key taps, crackle, drums)
    const noiseBuffer = ctx.createBuffer(1, ctx.sampleRate * 4, ctx.sampleRate)
    const data = noiseBuffer.getChannelData(0)
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1
    this.noiseBuffer = noiseBuffer

    // --- Support bus: everything under the music, ducked 10–15 dB ---
    this.supportGain = ctx.createGain()
    this.supportGain.gain.value = 0.32 // under the music by ~10-15 dB
    this.supportGain.connect(this.mixBus)

    this.buildPad(ctx)
    this.buildRoomTone(ctx)
    this.buildRain(ctx)

    // --- Music bus ---
    this.musicGain = ctx.createGain()
    this.musicGain.gain.value = 0
    this.musicFilter = ctx.createBiquadFilter()
    this.musicFilter.type = 'lowpass'
    this.musicFilter.frequency.value = 2800
    this.musicFilter.Q.value = 0.5
    this.musicGain.connect(this.musicFilter)
    this.musicFilter.connect(this.mixBus)
    // Analyser for the mini player's EQ bars
    this.analyser = ctx.createAnalyser()
    this.analyser.fftSize = 64
    this.analyser.smoothingTimeConstant = 0.82
    this.musicFilter.connect(this.analyser)

    // --- Vinyl crackle: sits outside the music filter, so it survives the muffle ---
    this.crackleGain = ctx.createGain()
    this.crackleGain.gain.value = 0
    this.crackleGain.connect(this.mixBus)
    const crackleSend = ctx.createGain()
    crackleSend.gain.value = 0.25
    this.crackleGain.connect(crackleSend)
    crackleSend.connect(this.reverb)
  }

  /** Stereo impulse response: exponential-decay noise, soft pre-delay. */
  private makeImpulse(ctx: AudioContext, seconds: number, decay: number) {
    const rate = ctx.sampleRate
    const len = Math.floor(rate * seconds)
    const buf = ctx.createBuffer(2, len, rate)
    const preDelay = Math.floor(rate * 0.02)
    for (let ch = 0; ch < 2; ch++) {
      const d = buf.getChannelData(ch)
      for (let i = preDelay; i < len; i++) {
        d[i] = (Math.random() * 2 - 1) * Math.pow(1 - (i - preDelay) / (len - preDelay), decay)
      }
    }
    return buf
  }

  /* --------------------------- SUPPORT: PAD ------------------------- */

  private buildPad(ctx: AudioContext) {
    this.padGain = ctx.createGain()
    this.padGain.gain.value = 1
    this.padFilter = ctx.createBiquadFilter()
    this.padFilter.type = 'lowpass'
    this.padFilter.frequency.value = 850
    this.padFilter.Q.value = 0.6
    this.padGain.connect(this.padFilter)
    this.padFilter.connect(this.supportGain!)
    const send = ctx.createGain()
    send.gain.value = 0.4
    this.padFilter.connect(send)
    send.connect(this.reverb!)

    const chord = CHORDS[0]
    this.voices = chord.map((freq, i) => {
      const oscA = ctx.createOscillator()
      oscA.type = 'triangle'
      oscA.frequency.value = freq
      const oscB = ctx.createOscillator()
      oscB.type = 'sawtooth'
      oscB.frequency.value = freq * 1.0015
      oscB.detune.value = i % 2 === 0 ? 6 : -6
      const gain = ctx.createGain()
      gain.gain.value = 0
      const drift = ctx.createOscillator()
      drift.type = 'sine'
      drift.frequency.value = 0.05 + i * 0.017
      const driftGain = ctx.createGain()
      driftGain.gain.value = 0.4 + i * 0.15
      drift.connect(driftGain)
      driftGain.connect(gain.gain)

      oscA.connect(gain)
      oscB.connect(gain)
      gain.connect(this.padGain!)
      oscA.start()
      oscB.start()
      drift.start()

      gain.gain.setValueAtTime(0, ctx.currentTime)
      gain.gain.linearRampToValueAtTime(0.011, ctx.currentTime + 5 + i * 0.7)
      return { oscA, oscB, gain }
    })
  }

  private glideToVoicing(freqs: number[], timeConstant: number) {
    const ctx = this.ctx
    if (!ctx) return
    this.voices.forEach((v, i) => {
      const target = freqs[Math.min(i, freqs.length - 1)]
      v.oscA.frequency.setTargetAtTime(target, ctx.currentTime, timeConstant)
      v.oscB.frequency.setTargetAtTime(target * 1.0015, ctx.currentTime, timeConstant)
    })
  }

  private scheduleChordDrift() {
    if (this.chordTimer !== null) window.clearTimeout(this.chordTimer)
    this.chordTimer = window.setTimeout(() => {
      if (this.state !== 'running') return
      this.chordIndex = ((this.chordIndex ?? 0) + 1) % CHORDS.length
      this.glideToVoicing(CHORDS[this.chordIndex], 3.4)
      this.scheduleChordDrift()
    }, 20000 + Math.random() * 14000)
  }

  private chordIndex = 0

  /* ------------------------- SUPPORT: ROOM -------------------------- */

  private buildRoomTone(ctx: AudioContext) {
    const humOsc1 = ctx.createOscillator()
    humOsc1.type = 'sine'
    humOsc1.frequency.value = 60
    const humOsc2 = ctx.createOscillator()
    humOsc2.type = 'sine'
    humOsc2.frequency.value = 120
    const humGain = ctx.createGain()
    humGain.gain.value = 0.004
    humOsc1.connect(humGain)
    humOsc2.connect(humGain)
    humGain.connect(this.supportGain!)
    humOsc1.start()
    humOsc2.start()
    this.humNodes.push(humOsc1, humOsc2)

    const air = ctx.createBufferSource()
    air.buffer = this.noiseBuffer
    air.loop = true
    const airLP = ctx.createBiquadFilter()
    airLP.type = 'lowpass'
    airLP.frequency.value = 340
    const airGain = ctx.createGain()
    airGain.gain.value = 0.006
    const airLfo = ctx.createOscillator()
    airLfo.type = 'sine'
    airLfo.frequency.value = 0.06
    const airLfoGain = ctx.createGain()
    airLfoGain.gain.value = 0.0015
    airLfo.connect(airLfoGain)
    airLfoGain.connect(airGain.gain)
    air.connect(airLP)
    airLP.connect(airGain)
    airGain.connect(this.supportGain!)
    air.start()
    airLfo.start()
    this.humNodes.push(air, airLfo)
  }

  /* ------------------------- SUPPORT: RAIN -------------------------- */

  private buildRain(ctx: AudioContext) {
    const rain = ctx.createBufferSource()
    rain.buffer = this.noiseBuffer
    rain.loop = true
    rain.playbackRate.value = 0.86
    this.rainFilter = ctx.createBiquadFilter()
    this.rainFilter.type = 'bandpass'
    this.rainFilter.frequency.value = 1100
    this.rainFilter.Q.value = 0.4
    this.rainGain = ctx.createGain()
    this.rainGain.gain.value = 0.013
    rain.connect(this.rainFilter)
    this.rainFilter.connect(this.rainGain)
    this.rainGain.connect(this.supportGain!)
    const send = ctx.createGain()
    send.gain.value = 0.3
    this.rainGain.connect(send)
    send.connect(this.reverb!)
    rain.start()
  }

  private scheduleRainWalk() {
    if (this.walkTimer !== null) window.clearInterval(this.walkTimer)
    this.walkTimer = window.setInterval(() => {
      if (!this.ctx || this.state !== 'running') return
      const t = this.ctx.currentTime
      this.rainFilter?.frequency.setTargetAtTime(950 + Math.random() * 550, t, 2.2)
      this.rainGain?.gain.setTargetAtTime(0.01 + Math.random() * 0.005, t, 2.2)
    }, 4000)
  }

  /* ----------------------- SUPPORT: KEYSTROKES ----------------------- */

  private scheduleKeys() {
    if (this.keysTimer !== null) window.clearTimeout(this.keysTimer)
    this.keysTimer = window.setTimeout(() => {
      if (this.state === 'running') this.playSoftTap()
      this.scheduleKeys()
    }, 20000 + Math.random() * 20000)
  }

  private playSoftTap() {
    const ctx = this.ctx
    if (!ctx || !this.noiseBuffer) return
    const t0 = ctx.currentTime
    const src = ctx.createBufferSource()
    src.buffer = this.noiseBuffer
    src.playbackRate.value = 0.7 + Math.random() * 0.3
    const lp = ctx.createBiquadFilter()
    lp.type = 'lowpass'
    lp.frequency.value = 650
    const gain = ctx.createGain()
    gain.gain.setValueAtTime(0.0001, t0)
    gain.gain.exponentialRampToValueAtTime(0.03, t0 + 0.006)
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.09)
    src.connect(lp)
    lp.connect(gain)
    gain.connect(this.keysGain ?? this.supportGain!)
    if (this.reverb) {
      const send = ctx.createGain()
      send.gain.value = 0.5
      gain.connect(send)
      send.connect(this.reverb)
    }
    src.start(t0, Math.random() * 3)
    src.stop(t0 + 0.12)
  }

  /* ================================================================== */
  /*  MAIN LAYER: LO-FI MUSIC                                           */
  /* ================================================================== */

  /** Start the playlist for the current track (generated or file). */
  private startTrack(fadeSeconds = 4) {
    const ctx = this.ctx
    if (!ctx || !this.musicGain || !this.musicFilter) return
    const track = this.nowPlaying
    const target = this.musicVolume * 0.55

    if (track.kind === 'file') {
      this.startFileTrack(track, target, fadeSeconds)
      return
    }

    // Generated track: scheduler drives notes into musicGain.
    const preset = PRESETS[track.preset]
    this.musicFilter.frequency.cancelScheduledValues(ctx.currentTime)
    this.musicFilter.frequency.setTargetAtTime(
      2600 + this.activity * 4800 + preset.warm,
      ctx.currentTime,
      0.4,
    )
    this.musicGain.gain.cancelScheduledValues(ctx.currentTime)
    this.musicGain.gain.setTargetAtTime(target, ctx.currentTime, fadeSeconds / 3)
    this.crackleGain!.gain.setTargetAtTime(0.5 * preset.crackle, ctx.currentTime, 1.5)

    // Sequencer: 16th-note lookahead scheduling (independent of rAF).
    this.step = 0
    this.barCount = 0
    this.nextStepTime = ctx.currentTime + 0.1
    if (this.schedulerId === null) {
      this.schedulerId = window.setInterval(() => this.scheduleAhead(), 90)
    }
    this.scheduleAhead()
    this.scheduleCrackle()
  }

  /* ---- file tracks: HTML audio → MediaElementSource ---- */

  private startFileTrack(
    track: Extract<PlaylistTrack, { kind: 'file' }>,
    target: number,
    fadeSeconds: number,
  ) {
    const ctx = this.ctx!
    if (!this.fileEl) {
      this.fileEl = new Audio()
      this.fileEl.loop = true
      this.fileEl.preload = 'auto'
      this.fileSource = ctx.createMediaElementSource(this.fileEl)
      this.fileSource.connect(this.musicGain!)
    }
    this.fileEl.src = track.url
    this.fileEl.volume = 1
    void this.fileEl.play().catch(() => {
      /* autoplay policies — sound was user-gesture-started, so this rarely fails */
    })
    this.musicGain!.gain.cancelScheduledValues(ctx.currentTime)
    this.musicGain!.gain.setTargetAtTime(target, ctx.currentTime, fadeSeconds / 3)
    this.crackleGain!.gain.setTargetAtTime(0.4, ctx.currentTime, 1.5)
    this.scheduleCrackle()
  }

  private stopFileTrack(fadeSeconds: number) {
    if (!this.fileEl || !this.ctx) return
    this.musicGain!.gain.cancelScheduledValues(this.ctx.currentTime)
    this.musicGain!.gain.setTargetAtTime(0.0001, this.ctx.currentTime, fadeSeconds / 3)
    window.setTimeout(() => {
      this.fileEl?.pause()
    }, fadeSeconds * 1000)
  }

  /* ---- generative sequencer ---- */

  private scheduleAhead() {
    const ctx = this.ctx
    if (!ctx || this.state !== 'running') return
    const track = this.nowPlaying
    if (track.kind !== 'generated') return
    const preset = PRESETS[track.preset]

    const stepDur = 60 / preset.bpm / 4
    const swing = stepDur * 0.28 // dusty swing on offbeat 16ths

    while (this.nextStepTime < ctx.currentTime + 0.35) {
      const s = this.step % 16
      const swingOffset = s % 2 === 1 ? swing : 0
      const jitter = (Math.random() - 0.5) * 0.008
      const t = this.nextStepTime + swingOffset + jitter
      const vel = 0.8 + Math.random() * 0.25

      const bar = Math.floor(this.step / 16)
      const chordIdx = preset.progression[Math.floor(bar / 2) % preset.progression.length]
      const chord = CHORDS[chordIdx]

      if (preset.kick[s] > 0) this.playKick(t, preset.kick[s] * vel)
      if (preset.rim[s] > 0) this.playRim(t, preset.rim[s] * vel)
      if (preset.hat[s] > 0) this.playHat(t, preset.hat[s] * vel)
      if (preset.bassPattern[s] >= 0) {
        const degree = preset.bassPattern[s]
        const root = chord[0] / 2
        const semis = degree === 0 ? 0 : degree === 7 ? 7 : degree === 5 ? 5 : degree === 3 ? 3 : 0
        this.playBass(t, root * Math.pow(2, semis / 12), preset.bassLevel * vel)
      }
      // Rhodes stab on chord changes and key accents
      if (s === 0 && bar % 2 === 0) {
        this.playKeys(t, chord, preset.keysLevel * vel, preset.keysOctave)
      } else if (s === 10 && bar % 2 === 1) {
        this.playKeys(t, chord.slice(1), preset.keysLevel * 0.55 * vel, preset.keysOctave)
      }

      this.step++
      if (this.step % 16 === 0) this.barCount++

      // Advance the playlist every ~24 bars (≈ 70–90 s per track)
      if (this.step % 16 === 0 && this.barCount > 0 && this.barCount % 24 === 0) {
        this.nextTrack(4 + Math.random() * 2)
        return
      }

      this.nextStepTime += stepDur
    }
  }

  /* ---- instruments ---- */

  private playKick(t: number, vel: number) {
    const ctx = this.ctx!
    const osc = ctx.createOscillator()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(120, t)
    osc.frequency.exponentialRampToValueAtTime(41, t + 0.11)
    const gain = ctx.createGain()
    gain.gain.setValueAtTime(0.0001, t)
    gain.gain.exponentialRampToValueAtTime(0.5 * vel, t + 0.008)
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.24)
    osc.connect(gain)
    gain.connect(this.musicGain!)
    osc.start(t)
    osc.stop(t + 0.26)
  }

  private playRim(t: number, vel: number) {
    const ctx = this.ctx!
    // Soft dusty rim: short filtered noise + tiny body, no snap
    const src = ctx.createBufferSource()
    src.buffer = this.noiseBuffer!
    const bp = ctx.createBiquadFilter()
    bp.type = 'bandpass'
    bp.frequency.value = 1500 + Math.random() * 400
    bp.Q.value = 1.1
    const gain = ctx.createGain()
    gain.gain.setValueAtTime(0.0001, t)
    gain.gain.exponentialRampToValueAtTime(0.16 * vel, t + 0.004)
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.11)
    src.connect(bp)
    bp.connect(gain)
    gain.connect(this.musicGain!)
    src.start(t, Math.random() * 3)
    src.stop(t + 0.13)

    const body = ctx.createOscillator()
    body.type = 'sine'
    body.frequency.value = 190
    const bodyGain = ctx.createGain()
    bodyGain.gain.setValueAtTime(0.0001, t)
    bodyGain.gain.exponentialRampToValueAtTime(0.06 * vel, t + 0.005)
    bodyGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.09)
    body.connect(bodyGain)
    bodyGain.connect(this.musicGain!)
    body.start(t)
    body.stop(t + 0.1)
  }

  private playHat(t: number, vel: number) {
    const ctx = this.ctx!
    const src = ctx.createBufferSource()
    src.buffer = this.noiseBuffer!
    const hp = ctx.createBiquadFilter()
    hp.type = 'highpass'
    hp.frequency.value = 7200
    const gain = ctx.createGain()
    gain.gain.setValueAtTime(0.0001, t)
    gain.gain.exponentialRampToValueAtTime(0.045 * vel, t + 0.003)
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.05)
    src.connect(hp)
    hp.connect(gain)
    gain.connect(this.musicGain!)
    src.start(t, Math.random() * 3)
    src.stop(t + 0.07)
  }

  private playBass(t: number, freq: number, vel: number) {
    const ctx = this.ctx!
    const osc = ctx.createOscillator()
    osc.type = 'triangle'
    osc.frequency.value = freq
    const lp = ctx.createBiquadFilter()
    lp.type = 'lowpass'
    lp.frequency.value = 500
    const gain = ctx.createGain()
    gain.gain.setValueAtTime(0.0001, t)
    gain.gain.linearRampToValueAtTime(0.24 * vel, t + 0.02)
    gain.gain.setTargetAtTime(0.0001, t + 0.3, 0.12)
    osc.connect(lp)
    lp.connect(gain)
    gain.connect(this.musicGain!)
    osc.start(t)
    osc.stop(t + 0.75)
  }

  /** FM Rhodes-style keys: sine carrier + sine modulator into its frequency. */
  private playKeys(t: number, chord: number[], level: number, octave: number) {
    const ctx = this.ctx!
    chord.forEach((freq, i) => {
      const carrier = ctx.createOscillator()
      carrier.type = 'sine'
      carrier.frequency.value = freq * Math.pow(2, octave)
      const modulator = ctx.createOscillator()
      modulator.type = 'sine'
      modulator.frequency.value = freq * Math.pow(2, octave) * 2.01
      const modGain = ctx.createGain()
      modGain.gain.value = freq * 1.6 // gentle FM brightness
      modulator.connect(modGain)
      modGain.connect(carrier.frequency)

      const gain = ctx.createGain()
      const vol = (level * 0.16) / (1 + i * 0.4)
      gain.gain.setValueAtTime(0.0001, t)
      gain.gain.linearRampToValueAtTime(vol, t + 0.045)
      gain.gain.setTargetAtTime(0.0001, t + 0.5, 0.35)

      const lp = ctx.createBiquadFilter()
      lp.type = 'lowpass'
      lp.frequency.value = 2400

      carrier.connect(lp)
      lp.connect(gain)
      gain.connect(this.musicGain!)
      const send = ctx.createGain()
      send.gain.value = 0.3
      gain.connect(send)
      send.connect(this.reverb!)

      carrier.start(t)
      modulator.start(t)
      carrier.stop(t + 1.6)
      modulator.stop(t + 1.6)
    })
  }

  /* ---- vinyl crackle (survives the muffle: sits outside the music filter) ---- */

  private scheduleCrackle() {
    if (this.crackleId !== null) return
    const tick = () => {
      if (this.state !== 'running') {
        this.crackleId = null
        return
      }
      const ctx = this.ctx
      if (ctx && this.crackleGain && this.noiseBuffer) {
        const track = this.nowPlaying
        const amount = track.kind === 'generated' ? PRESETS[track.preset].crackle : 1
        // Sparse dust ticks + the occasional louder pop
        const count = Math.random() < 0.6 ? 1 : 2
        for (let i = 0; i < count; i++) {
          const t0 = ctx.currentTime + i * (0.02 + Math.random() * 0.05)
          const src = ctx.createBufferSource()
          src.buffer = this.noiseBuffer
          src.playbackRate.value = 1.4 + Math.random() * 0.8
          const bp = ctx.createBiquadFilter()
          bp.type = 'bandpass'
          bp.frequency.value = 1200 + Math.random() * 3200
          bp.Q.value = 1.2
          const gain = ctx.createGain()
          const vol = (Math.random() < 0.08 ? 0.05 : 0.008 + Math.random() * 0.01) * amount
          gain.gain.setValueAtTime(0.0001, t0)
          gain.gain.exponentialRampToValueAtTime(vol, t0 + 0.002)
          gain.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.025)
          src.connect(bp)
          bp.connect(gain)
          gain.connect(this.crackleGain)
          src.start(t0, Math.random() * 3.5)
          src.stop(t0 + 0.05)
        }
      }
      this.crackleId = window.setTimeout(tick, 30 + Math.random() * 170)
    }
    this.crackleId = window.setTimeout(tick, 200)
  }

  /* ---- playlist control ---- */

  /** Advance to the next track (shuffle, no immediate repeats) with a crossfade. */
  nextTrack(fadeSeconds = 5) {
    if (PLAYLIST.length < 2) return
    const ctx = this.ctx
    if (!ctx) return

    const fade = Math.min(6, Math.max(4, fadeSeconds))
    const next = (this.trackIndex + 1 + Math.floor(Math.random() * (PLAYLIST.length - 1))) % PLAYLIST.length

    // Fade the current bed out, swap, fade the next one in.
    this.musicGain!.gain.cancelScheduledValues(ctx.currentTime)
    this.musicGain!.gain.setTargetAtTime(0.0001, ctx.currentTime, fade / 4)
    if (this.nowPlaying.kind === 'file') this.stopFileTrack(fade)

    window.setTimeout(() => {
      if (this.state !== 'running') return
      if (this.schedulerId !== null) {
        window.clearInterval(this.schedulerId)
        this.schedulerId = null
      }
      this.trackIndex = next
      this.notify()
      this.startTrack(fade / 2)
    }, (fade / 2) * 1000)
  }

  /** Mini-player volume (0..1) — scales the music layer under the master. */
  setMusicVolume(v: number) {
    this.musicVolume = Math.min(1, Math.max(0, v))
    if (this.state === 'running' && this.musicGain && this.ctx) {
      const track = this.nowPlaying
      if (track.kind === 'generated') {
        this.musicGain.gain.setTargetAtTime(this.musicVolume * 0.55, this.ctx.currentTime, 0.25)
      } else {
        this.musicGain.gain.setTargetAtTime(this.musicVolume * 0.55, this.ctx.currentTime, 0.25)
      }
    }
  }

  getMusicVolume() {
    return this.musicVolume
  }

  /** Analyser data for the mini player's EQ bars (0..1 per bin). */
  getLevels(bins: number): number[] {
    if (!this.analyser || this.state !== 'running') return Array.from({ length: bins }, () => 0)
    const data = new Uint8Array(this.analyser.frequencyBinCount)
    this.analyser.getByteFrequencyData(data)
    const out: number[] = []
    const stride = Math.max(1, Math.floor(data.length / bins))
    for (let i = 0; i < bins; i++) {
      let sum = 0
      for (let j = 0; j < stride; j++) sum += data[i * stride + j] ?? 0
      out.push(sum / stride / 255)
    }
    return out
  }

  /* ------------------------------------------------------------------ */
  /* Start / stop (fade in 3 s, fade out 1.5 s)                          */
  /* ------------------------------------------------------------------ */

  async start() {
    if (this.state === 'running') return

    const ctx = this.initContext()
    if (!ctx) return
    if (ctx.state === 'suspended') await ctx.resume()
    if (!this.master) this.buildGraph(ctx)

    document.addEventListener('visibilitychange', this.onVisibility)

    if (!this.keysGain) {
      this.keysGain = ctx.createGain()
      this.keysGain.gain.value = 1
      this.keysGain.connect(this.supportGain!)
    }

    const wasStalled = this.state === 'stalled'
    this.state = 'running'
    this.notify()

    const g = this.master!.gain
    const t = ctx.currentTime
    g.cancelScheduledValues(t)
    g.setValueAtTime(g.value, t)
    g.linearRampToValueAtTime(0.27, t + 3)

    this.startTrack(4)
    this.scheduleChordDrift()
    this.scheduleRainWalk()
    this.scheduleKeys()

    if (wasStalled) {
      // Entering with sound during the hold: play the story beat in
      // fast-forward — brief muffle, then the resolve.
      this.stallHold(true)
      window.setTimeout(() => {
        if (this.state === 'running') this.resolveRelease()
      }, 2200)
    }
  }

  stop() {
    if (!this.ctx || !this.master) {
      this.state = 'off'
      this.notify()
      return
    }
    const ctx = this.ctx
    const g = this.master.gain
    const t = ctx.currentTime
    g.cancelScheduledValues(t)
    g.setValueAtTime(g.value, t)
    g.linearRampToValueAtTime(0, t + 1.5)
    this.state = 'off'
    this.notify()

    window.setTimeout(() => {
      if (this.state !== 'off') return // visitor re-enabled mid-fade
      if (this.schedulerId !== null) {
        window.clearInterval(this.schedulerId)
        this.schedulerId = null
      }
      if (this.crackleId !== null) {
        window.clearTimeout(this.crackleId)
        this.crackleId = null
      }
      if (this.keysTimer !== null) window.clearTimeout(this.keysTimer)
      if (this.chordTimer !== null) window.clearTimeout(this.chordTimer)
      if (this.walkTimer !== null) window.clearInterval(this.walkTimer)
      this.keysTimer = this.chordTimer = this.walkTimer = null
      this.fileEl?.pause()
      void this.ctx?.suspend()
      document.removeEventListener('visibilitychange', this.onVisibility)
    }, 1600)
  }

  toggle() {
    if (this.isPlaying) {
      this.stop()
      return 'off' as const
    }
    void this.start()
    return 'on' as const
  }

  /* ------------------------------------------------------------------ */
  /* Story beats: the 99% stall and the resolve                          */
  /* ------------------------------------------------------------------ */

  /**
   * The music muffles through the low-pass (like hearing it from another
   * room), the beat softens; only crackle and rain remain. Safe while muted.
   */
  stallHold(alreadyRunning = false) {
    if (this.state === 'off') {
      this.state = 'stalled' // bookkeeping: entry-with-sound starts into the hold
      this.notify()
      return
    }
    if (this.state !== 'running') return
    this.glideToVoicing(HOLD_VOICING, 2.6)

    const ctx = this.ctx!
    const t = ctx.currentTime
    // Music muffles + softens; crackle and rain stay
    this.musicFilter?.frequency.setTargetAtTime(360, t, 0.55)
    this.musicGain?.gain.setTargetAtTime((this.musicVolume * 0.55) * 0.35, t, 0.55)
    this.rainGain?.gain.setTargetAtTime(0.004, t, 0.5) // rain stays, quieter bed
    this.keysGain?.gain.setTargetAtTime(0.1, t, 0.5)
    this.supportGain?.gain.setTargetAtTime(0.2, t, 0.5)
    if (!alreadyRunning) {
      window.setTimeout(() => {
        if (this.state !== 'running') return
        const t2 = this.ctx!.currentTime
        this.rainGain?.gain.setTargetAtTime(0.011, t2, 1.6)
        this.keysGain?.gain.setTargetAtTime(1, t2, 1.6)
      }, 1400)
    }
  }

  /** BUILD 100%: the filter opens, the track swells back + warm resolve. */
  resolveRelease() {
    const ctx = this.ctx
    if (!ctx) {
      if (this.state === 'stalled') this.state = 'off'
      this.notify()
      return
    }
    if (this.state === 'stalled') this.state = 'running'
    this.notify()

    const track = this.nowPlaying
    const preset = track.kind === 'generated' ? PRESETS[track.preset] : null
    const t = ctx.currentTime

    this.glideToVoicing(RESOLVE_VOICING, 2.2)
    // Filter opens, track swells back in with relief
    this.musicFilter?.frequency.setTargetAtTime(
      2600 + this.activity * 4800 + (preset?.warm ?? 0),
      t,
      0.8,
    )
    this.musicGain?.gain.setTargetAtTime(Math.min(1, this.musicVolume * 0.7), t, 0.4)
    window.setTimeout(() => {
      if (this.state === 'running') {
        this.musicGain?.gain.setTargetAtTime(this.musicVolume * 0.55, this.ctx!.currentTime, 1.2)
      }
    }, 1600)
    this.rainGain?.gain.setTargetAtTime(0.013, t, 1.4)
    this.keysGain?.gain.setTargetAtTime(1, t, 1.4)
    this.supportGain?.gain.setTargetAtTime(0.32, t, 1.4)

    this.playBell()
  }

  /** Soft bell-like tone: two quiet sines with a long decay, deep in reverb. */
  private playBell() {
    const ctx = this.ctx
    if (!ctx || !this.mixBus || !this.reverb) return
    const t0 = ctx.currentTime

    const tone = (freq: number, vol: number, decay: number) => {
      const osc = ctx.createOscillator()
      osc.type = 'sine'
      osc.frequency.value = freq
      const gain = ctx.createGain()
      gain.gain.setValueAtTime(0.0001, t0)
      gain.gain.exponentialRampToValueAtTime(vol, t0 + 0.03)
      gain.gain.exponentialRampToValueAtTime(0.0001, t0 + decay)
      osc.connect(gain)
      gain.connect(this.mixBus!)
      const send = ctx.createGain()
      send.gain.value = 0.7
      gain.connect(send)
      send.connect(this.reverb!)
      osc.start(t0)
      osc.stop(t0 + decay + 0.1)
    }

    tone(587.33, 0.05, 2.6) // D5
    tone(880.0, 0.022, 2.0) // A5, quieter
  }

  /* ------------------------------------------------------------------ */
  /* Interaction: scroll opens the music filter slightly, then eases back */
  /* ------------------------------------------------------------------ */

  setLazyMode(on: boolean) {
    this.lazyMode = on
  }

  updateScrollActivity(velocity: number, dt: number) {
    const ctx = this.ctx
    if (!ctx || this.state !== 'running') return

    const d = Math.min(dt, 0.1)
    // Lazy Mode autopilot: keep the sound steady, no changes.
    this.activityTarget = this.lazyMode ? this.activity : Math.min(1, velocity / 110)

    const rate = 0.7 // deliberately slow
    this.activity += (this.activityTarget - this.activity) * (1 - Math.exp(-rate * d))

    const track = this.nowPlaying
    const preset = track.kind === 'generated' ? PRESETS[track.preset] : null
    const t = ctx.currentTime
    this.musicFilter?.frequency.setTargetAtTime(
      2600 + this.activity * 4800 + (preset?.warm ?? 0),
      t,
      0.6,
    )
  }

  /* ------------------------------------------------------------------ */
  /* Soft interaction tones (no notification beeps, no sharp clicks)     */
  /* ------------------------------------------------------------------ */

  private softTone(freq: number, vol: number, attack: number, decay: number) {
    const dest = this.state === 'off' ? null : this.mixBus
    if (!dest) return
    const ctx = this.ctx!
    if (ctx.state === 'suspended') void ctx.resume()

    const osc = ctx.createOscillator()
    osc.type = 'sine'
    osc.frequency.value = freq
    const lp = ctx.createBiquadFilter()
    lp.type = 'lowpass'
    lp.frequency.value = 1200
    const gain = ctx.createGain()
    const t0 = ctx.currentTime
    gain.gain.setValueAtTime(0.0001, t0)
    gain.gain.linearRampToValueAtTime(vol, t0 + attack)
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + attack + decay)
    osc.connect(lp)
    lp.connect(gain)
    gain.connect(dest)
    if (this.reverb) {
      const send = ctx.createGain()
      send.gain.value = 0.35
      gain.connect(send)
      send.connect(this.reverb)
    }
    osc.start(t0)
    osc.stop(t0 + attack + decay + 0.1)
  }

  /** Soft low rounded UI tone — project hover/click, menu actions. */
  playUITone(pitch = 1) {
    this.softTone(174 * pitch, 0.045, 0.03, 0.4)
  }

  /** Quieter variant for hover states. */
  playHoverTone() {
    this.softTone(147, 0.028, 0.04, 0.35)
  }

  /** Terminal typing / keyboard feedback: soft, muffled tap. */
  playKeyClick(pitch = 1.0) {
    if (this.state === 'off') return
    this.softTone(120 + pitch * 60, 0.03, 0.008, 0.09)
  }

  /** Ceramic coffee mug tap easter egg. */
  playMugTap() {
    if (this.state === 'off') return
    this.softTone(240, 0.05, 0.012, 0.35)
  }

  /** Barely audible gauge tick (footer meters are visual only). */
  playGaugeTick() {
    const ctx = this.ctx
    if (this.state !== 'running' || !ctx || !this.noiseBuffer) return
    const t0 = ctx.currentTime
    const src = ctx.createBufferSource()
    src.buffer = this.noiseBuffer
    const lp = ctx.createBiquadFilter()
    lp.type = 'lowpass'
    lp.frequency.value = 900
    const gain = ctx.createGain()
    gain.gain.setValueAtTime(0.0001, t0)
    gain.gain.exponentialRampToValueAtTime(0.016, t0 + 0.004)
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.03)
    src.connect(lp)
    lp.connect(gain)
    gain.connect(this.mixBus!)
    src.start(t0, Math.random() * 3)
    src.stop(t0 + 0.05)
  }

  /* ------------------------------------------------------------------ */
  /* Tab-hidden auto-pause                                               */
  /* ------------------------------------------------------------------ */

  private onVisibility = () => {
    const ctx = this.ctx
    if (!ctx || !this.master) return
    const hidden = document.visibilityState === 'hidden'
    if (hidden === this.hiddenPaused) return
    this.hiddenPaused = hidden

    const g = this.master.gain
    const t = ctx.currentTime
    g.cancelScheduledValues(t)
    g.setValueAtTime(g.value, t)
    if (hidden) {
      g.linearRampToValueAtTime(0, t + 0.15)
      window.setTimeout(() => {
        if (this.hiddenPaused) {
          if (this.schedulerId !== null) {
            window.clearInterval(this.schedulerId)
            this.schedulerId = null
          }
          this.fileEl?.pause()
          void this.ctx?.suspend()
        }
      }, 200)
    } else {
      void ctx.resume().then(() => {
        if (this.state === 'running') {
          this.nextStepTime = ctx.currentTime + 0.1
          if (this.schedulerId === null) {
            this.schedulerId = window.setInterval(() => this.scheduleAhead(), 90)
          }
          if (this.nowPlaying.kind === 'file') {
            void this.fileEl?.play().catch(() => undefined)
          }
          g.linearRampToValueAtTime(0.27, t + 0.6)
        }
      })
    }
  }
}

export const soundManager = new Ambient()

// Dev-only QA hook: lets the local capture scripts read ambient internals.
if (import.meta.env.DEV) {
  ;(window as unknown as Record<string, unknown>).__sound = soundManager
}
