/**
 * useStorage — typed localStorage wrapper for CloudPhone widgets
 *
 * localStorage IS supported on CloudPhone's server-side browser.
 * This hook provides a typed, reactive interface with fallback
 * defaults and safe JSON handling.
 *
 * @example
 * const [score, setScore] = useStorage('hs_rps', 0)
 * const [prefs, setPrefs] = useStorage('user_prefs', { sound: true, lang: 'en' })
 *
 * @example
 * // Clear a key
 * const [_, __, clearScore] = useStorage('hs_rps', 0)
 * clearScore()
 */

import { useState, useCallback } from 'react'

type StorageReturn<T> = [
  value: T,
  setValue: (val: T | ((prev: T) => T)) => void,
  clear: () => void,
]

export function useStorage<T>(key: string, defaultValue: T): StorageReturn<T> {
  const [stored, setStored] = useState<T>(() => {
    try {
      const item = localStorage.getItem(key)
      return item ? (JSON.parse(item) as T) : defaultValue
    } catch {
      return defaultValue
    }
  })

  const setValue = useCallback((val: T | ((prev: T) => T)) => {
    setStored(prev => {
      const next = typeof val === 'function' ? (val as (p: T) => T)(prev) : val
      try {
        localStorage.setItem(key, JSON.stringify(next))
      } catch {
        // Storage quota exceeded — silently fail, state still updates
      }
      return next
    })
  }, [key])

  const clear = useCallback(() => {
    localStorage.removeItem(key)
    setStored(defaultValue)
  }, [key, defaultValue])

  return [stored, setValue, clear]
}

// ── Convenience: high score tracker ──────────────────────

export interface HighScore {
  value: number
  date: string
}

export function useHighScore(key: string): {
  highScore: HighScore | null
  submit: (value: number) => boolean  // returns true if new record
  clear: () => void
} {
  const [hs, setHs, clear] = useStorage<HighScore | null>(key, null)

  const submit = useCallback((value: number) => {
    if (!hs || value > hs.value) {
      setHs({ value, date: new Date().toLocaleDateString() })
      return true
    }
    return false
  }, [hs, setHs])

  return { highScore: hs, submit, clear }
}
