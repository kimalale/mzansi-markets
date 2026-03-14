/**
 * useDPad — D-pad focus management for CloudPhone
 *
 * The core hook for all navigation. Manages focused index,
 * wraps around edges, handles confirm/back, and supports
 * horizontal, vertical, or grid layouts.
 *
 * @example
 * // Horizontal 3-item row (like RPS choices)
 * const { focused, isFocused } = useDPad({
 *   length: 3,
 *   axis: 'horizontal',
 *   onConfirm: (idx) => handleChoice(idx),
 * })
 *
 * @example
 * // Vertical menu list
 * const { focused, isFocused } = useDPad({
 *   length: menuItems.length,
 *   axis: 'vertical',
 *   onConfirm: (idx) => navigate(menuItems[idx].route),
 *   onBack: () => goBack(),
 * })
 *
 * @example
 * // 3-column grid (cols=3, items=9)
 * const { focused, isFocused } = useDPad({
 *   length: 9,
 *   axis: 'grid',
 *   cols: 3,
 *   onConfirm: (idx) => selectTile(idx),
 * })
 */

import { useState, useEffect, useCallback } from 'react'
import { CP_KEYS, DPadAxis } from '../types'

export interface UseDPadOptions {
  /** Total number of focusable items */
  length: number
  /** Navigation axis. Default: 'vertical' */
  axis?: DPadAxis
  /** Number of columns — required when axis='grid' */
  cols?: number
  /** Initial focused index. Default: 0 */
  initialIndex?: number
  /** Called when user presses Enter or LSK (Escape) on focused item */
  onConfirm?: (index: number) => void
  /** Called when user presses RSK (Backspace) */
  onBack?: () => void
  /** Called whenever focus changes */
  onChange?: (index: number) => void
  /** Disable all input (e.g. during animations) */
  disabled?: boolean
  /** Wrap around at edges. Default: true */
  wrap?: boolean
}

export interface UseDPadReturn {
  focused: number
  setFocus: (index: number) => void
  isFocused: (index: number) => boolean
}

export function useDPad({
  length,
  axis = 'vertical',
  cols,
  initialIndex = 0,
  onConfirm,
  onBack,
  onChange,
  disabled = false,
  wrap = true,
}: UseDPadOptions): UseDPadReturn {
  const [focused, setFocusedState] = useState(initialIndex)

  const setFocus = useCallback((index: number) => {
    if (length === 0) return
    const next = wrap
      ? ((index % length) + length) % length
      : Math.max(0, Math.min(length - 1, index))
    setFocusedState(next)
    onChange?.(next)
  }, [length, wrap, onChange])

  useEffect(() => {
    if (disabled) return

    const handler = (e: KeyboardEvent) => {
      switch (e.key) {
        case CP_KEYS.UP:
          e.preventDefault()
          if (axis === 'vertical' || axis === 'both') setFocus(focused - 1)
          if (axis === 'grid' && cols) setFocus(focused - cols)
          break

        case CP_KEYS.DOWN:
          e.preventDefault()
          if (axis === 'vertical' || axis === 'both') setFocus(focused + 1)
          if (axis === 'grid' && cols) setFocus(focused + cols)
          break

        case CP_KEYS.LEFT:
          e.preventDefault()
          if (axis === 'horizontal' || axis === 'both') setFocus(focused - 1)
          if (axis === 'grid') setFocus(focused - 1)
          break

        case CP_KEYS.RIGHT:
          e.preventDefault()
          if (axis === 'horizontal' || axis === 'both') setFocus(focused + 1)
          if (axis === 'grid') setFocus(focused + 1)
          break

        case CP_KEYS.CONFIRM:
        case CP_KEYS.LSK:
          e.preventDefault()
          onConfirm?.(focused)
          break

        case CP_KEYS.RSK:
          e.preventDefault()
          onBack?.()
          break
      }
    }

    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [focused, axis, cols, disabled, setFocus, onConfirm, onBack])

  const isFocused = useCallback((index: number) => index === focused, [focused])

  return { focused, setFocus, isFocused }
}
