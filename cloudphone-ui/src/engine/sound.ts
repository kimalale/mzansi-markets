/**
 * sound.ts — Web Audio API sound engine for CloudPhone widgets
 *
 * No audio files needed. All sounds are synthesised in real-time
 * using the Web Audio API, which is fully supported in CloudPhone's
 * Chromium browser engine.
 *
 * Usage:
 *   import { sfx } from '@cloudphone/engine/sound'
 *   sfx.play('nav')
 *   sfx.play('win')
 *
 * Custom sounds:
 *   sfx.define('mySound', [
 *     { freq: 440, dur: 0.08, type: 'square', vol: 0.12 },
 *     { freq: 660, dur: 0.12, type: 'square', vol: 0.12, delay: 0.1 },
 *   ])
 *   sfx.play('mySound')
 */

export type OscType = OscillatorType

export interface Tone {
  freq: number
  dur: number
  type?: OscType
  vol?: number
  /** Seconds after play() call to start this tone */
  delay?: number
}

export type SoundName = string

class SoundEngine {
  private ctx: AudioContext | null = null
  private library: Map<SoundName, Tone[]> = new Map()
  private muted = false

  constructor() {
    this.loadDefaults()
  }

  private getCtx(): AudioContext {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
    }
    // Resume if suspended (browser autoplay policy)
    if (this.ctx.state === 'suspended') {
      void this.ctx.resume()
    }
    return this.ctx
  }

  private playTone(ctx: AudioContext, tone: Tone): void {
    const { freq, dur, type = 'square', vol = 0.12, delay = 0 } = tone
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.type = type
    osc.frequency.value = freq
    const t = ctx.currentTime + delay
    gain.gain.setValueAtTime(0, t)
    gain.gain.linearRampToValueAtTime(vol, t + 0.01)
    gain.gain.exponentialRampToValueAtTime(0.001, t + dur)
    osc.start(t)
    osc.stop(t + dur + 0.05)
  }

  /** Register a custom sound */
  define(name: SoundName, tones: Tone[]): void {
    this.library.set(name, tones)
  }

  /** Play a named sound. Silently ignores unknown names. */
  play(name: SoundName): void {
    if (this.muted) return
    const tones = this.library.get(name)
    if (!tones) return
    try {
      const ctx = this.getCtx()
      tones.forEach(t => this.playTone(ctx, t))
    } catch {
      // Audio blocked or unavailable — never crash the game
    }
  }

  mute():   void { this.muted = true }
  unmute(): void { this.muted = false }
  toggle(): void { this.muted = !this.muted }
  isMuted(): boolean { return this.muted }

  private loadDefaults(): void {
    // UI navigation
    this.define('nav',    [{ freq: 440, dur: 0.05, type: 'square', vol: 0.08 }])
    this.define('select', [{ freq: 660, dur: 0.08, type: 'square', vol: 0.12 }])
    this.define('back',   [{ freq: 330, dur: 0.06, type: 'square', vol: 0.08 }])
    this.define('error',  [{ freq: 220, dur: 0.15, type: 'sawtooth', vol: 0.1 }])

    // Countdown
    this.define('tick',   [{ freq: 880, dur: 0.12, type: 'sine', vol: 0.18 }])
    this.define('go',     [
      { freq: 880,  dur: 0.06, type: 'square', vol: 0.20 },
      { freq: 1100, dur: 0.12, type: 'square', vol: 0.20, delay: 0.08 },
    ])

    // Game outcomes
    this.define('win',    [
      { freq: 660,  dur: 0.08, type: 'square', vol: 0.15 },
      { freq: 880,  dur: 0.08, type: 'square', vol: 0.15, delay: 0.10 },
      { freq: 1100, dur: 0.20, type: 'square', vol: 0.15, delay: 0.20 },
    ])
    this.define('lose',   [
      { freq: 300, dur: 0.15, type: 'sawtooth', vol: 0.12 },
      { freq: 220, dur: 0.25, type: 'sawtooth', vol: 0.10, delay: 0.18 },
    ])
    this.define('draw',   [
      { freq: 440, dur: 0.10, type: 'square', vol: 0.10 },
      { freq: 440, dur: 0.10, type: 'square', vol: 0.10, delay: 0.15 },
    ])

    // Match victory fanfare
    this.define('fanfare', [
      { freq: 440,  dur: 0.12, type: 'square', vol: 0.18 },
      { freq: 550,  dur: 0.12, type: 'square', vol: 0.18, delay: 0.12 },
      { freq: 660,  dur: 0.12, type: 'square', vol: 0.18, delay: 0.24 },
      { freq: 880,  dur: 0.20, type: 'square', vol: 0.18, delay: 0.36 },
    ])
    this.define('defeat',  [
      { freq: 300, dur: 0.20, type: 'sawtooth', vol: 0.15 },
      { freq: 200, dur: 0.40, type: 'sawtooth', vol: 0.12, delay: 0.25 },
    ])

    // Utility
    this.define('notify', [
      { freq: 660, dur: 0.08, type: 'sine', vol: 0.12 },
      { freq: 880, dur: 0.10, type: 'sine', vol: 0.12, delay: 0.10 },
    ])
    this.define('confirm', [{ freq: 750, dur: 0.10, type: 'sine', vol: 0.15 }])
  }
}

/** Singleton sound engine — import and use anywhere */
export const sfx = new SoundEngine()
