/**
 * Screen — Root layout container for a CloudPhone widget
 *
 * Enforces QVGA (240×320) dimensions, renders the fixed 40px
 * header, scrollable content area, and 24px softkey bar.
 *
 * @example
 * <Screen
 *   title="RPS DUEL"
 *   softkeys={{ lsk: 'PLAY', rsk: 'QUIT' }}
 *   headerRight={<span>W:3 L:1</span>}
 * >
 *   <GameView />
 * </Screen>
 */

import React from 'react'
import { SoftKeys } from '../types'

interface ScreenProps {
  /** App title shown in header (left side) */
  title: string
  /** Optional content for header right side (score, status) */
  headerRight?: React.ReactNode
  /** Softkey labels at bottom */
  softkeys?: SoftKeys
  children: React.ReactNode
  /** Extra class on content area */
  className?: string
}

export function Screen({ title, headerRight, softkeys, children, className = '' }: ScreenProps) {
  return (
    <div className="w-[240px] h-[320px] bg-cp-bg flex flex-col overflow-hidden relative font-mono scanlines">

      {/* Header — 40px */}
      <div className="h-[40px] flex-shrink-0 bg-cp-bg2 border-b border-cp-border flex items-center justify-between px-2">
        <span className="font-hud text-[10px] text-cp-accent tracking-widest font-bold">
          {title}
        </span>
        {headerRight && (
          <span className="text-[8px] text-cp-muted">
            {headerRight}
          </span>
        )}
      </div>

      {/* Content area */}
      <div className={`flex-1 overflow-hidden relative ${className}`}>
        {children}
      </div>

      {/* Softkey bar — 24px */}
      <div className="h-[24px] flex-shrink-0 bg-cp-bg2 border-t border-cp-border flex items-center justify-between px-2">
        <span className="text-[8px] text-cp-accent tracking-wide min-w-[48px]">
          {softkeys?.lsk ?? ''}
        </span>
        <span className="text-[7px] text-cp-muted tracking-widest">
          {softkeys?.center ?? ''}
        </span>
        <span className="text-[8px] text-cp-muted tracking-wide min-w-[48px] text-right">
          {softkeys?.rsk ?? ''}
        </span>
      </div>
    </div>
  )
}
