/**
 * ChoiceGrid — Horizontal or grid layout of D-pad-selectable items
 *
 * @example
 * // Horizontal (RPS choices)
 * <ChoiceGrid
 *   items={[
 *     { icon: '✊', label: 'ROCK',     hint: '◀' },
 *     { icon: '✋', label: 'PAPER',    hint: '●' },
 *     { icon: '✌️', label: 'SCISSORS', hint: '▶' },
 *   ]}
 *   focused={focused}
 *   onSelect={(idx) => play(idx)}
 * />
 */

import React from 'react'

export interface ChoiceItem {
  icon: string
  label: string
  hint?: string
  selected?: boolean
}

interface ChoiceGridProps {
  items: ChoiceItem[]
  focused: number
  onSelect?: (index: number) => void
  /** Width of each item in px. Default: 58 */
  itemWidth?: number
  /** Height of each item in px. Default: 52 */
  itemHeight?: number
}

export function ChoiceGrid({ items, focused, onSelect, itemWidth = 58, itemHeight = 52 }: ChoiceGridProps) {
  return (
    <div className="flex gap-[6px]">
      {items.map((item, i) => (
        <div
          key={i}
          onClick={() => onSelect?.(i)}
          style={{ width: itemWidth, height: itemHeight }}
          className={[
            'flex flex-col items-center justify-center gap-[3px] rounded-[5px] border relative cursor-pointer transition-all duration-100 select-none',
            item.selected
              ? 'border-cp-win bg-[#0a1a10]'
              : focused === i
                ? 'border-cp-accent bg-cp-bg3 -translate-y-0.5'
                : 'border-cp-border bg-cp-bg2',
          ].join(' ')}
        >
          <span className="text-[22px] leading-none">{item.icon}</span>
          <span className={`text-[6px] tracking-wide ${focused === i ? 'text-cp-accent2' : 'text-cp-muted'}`}>
            {item.label}
          </span>
          {item.hint && (
            <span className={`absolute bottom-[2px] right-[3px] text-[6px] ${focused === i ? 'text-cp-accent' : 'text-cp-border2'}`}>
              {item.hint}
            </span>
          )}
        </div>
      ))}
    </div>
  )
}
