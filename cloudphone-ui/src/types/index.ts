// ─────────────────────────────────────────────────────────
// CloudPhone Platform Types
// ─────────────────────────────────────────────────────────

/** Official CloudPhone display resolutions */
export type CPResolution = 'QQVGA' | 'QVGA'

export const CP_DIMENSIONS: Record<CPResolution, { width: number; height: number; headerH: number; softkeyH: number }> = {
  QQVGA: { width: 160, height: 120, headerH: 20, softkeyH: 16 },
  QVGA:  { width: 240, height: 320, headerH: 40, softkeyH: 24 },
}

/** D-pad key mapping — matches CloudPhone browser key events */
export const CP_KEYS = {
  UP:        'ArrowUp',
  DOWN:      'ArrowDown',
  LEFT:      'ArrowLeft',
  RIGHT:     'ArrowRight',
  CONFIRM:   'Enter',
  LSK:       'Escape',     // Left soft key
  RSK:       'Backspace',  // Right soft key
  NUM_0:     '0',
  NUM_1:     '1',
  NUM_2:     '2',
  NUM_3:     '3',
  NUM_4:     '4',
  NUM_5:     '5',
  NUM_6:     '6',
  NUM_7:     '7',
  NUM_8:     '8',
  NUM_9:     '9',
} as const

export type CPKey = typeof CP_KEYS[keyof typeof CP_KEYS]

/** Navigation axis for useDPad */
export type DPadAxis = 'horizontal' | 'vertical' | 'both' | 'grid'

/** Softkey label pair */
export interface SoftKeys {
  lsk?: string
  rsk?: string
  center?: string
}
