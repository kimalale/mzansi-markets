/**
 * useKeyPress — listen for a specific key anywhere in a view
 *
 * Useful for one-off bindings outside of useDPad navigation.
 *
 * @example
 * useKeyPress(CP_KEYS.NUM_1, () => playRound('rock'))
 * useKeyPress(CP_KEYS.NUM_2, () => playRound('paper'))
 * useKeyPress(CP_KEYS.NUM_3, () => playRound('scissors'))
 */

import { useEffect } from 'react'
import { CPKey } from '../types'

export function useKeyPress(key: CPKey | CPKey[], handler: () => void, disabled = false) {
  useEffect(() => {
    if (disabled) return
    const keys = Array.isArray(key) ? key : [key]
    const onKey = (e: KeyboardEvent) => {
      if (keys.includes(e.key as CPKey)) {
        e.preventDefault()
        handler()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [key, handler, disabled])
}
