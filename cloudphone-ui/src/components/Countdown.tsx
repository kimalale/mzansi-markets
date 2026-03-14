/**
 * Countdown — Animated 3..2..1..FIGHT screen
 *
 * @example
 * const [counting, setCounting] = useState(true)
 *
 * {counting && (
 *   <Countdown onComplete={() => setCounting(false)} />
 * )}
 */

import React, { useEffect, useState } from 'react'
import { sfx } from '../engine/sound'

interface CountdownProps {
  from?: number
  onComplete: () => void
  /** ms between each tick. Default: 800 */
  interval?: number
}

export function Countdown({ from = 3, onComplete, interval = 800 }: CountdownProps) {
  const [current, setCurrent] = useState<number | 'FIGHT'>(from)

  useEffect(() => {
    sfx.play('tick')
    let n = from

    const timer = setInterval(() => {
      n--
      if (n > 0) {
        sfx.play('tick')
        setCurrent(n)
      } else {
        clearInterval(timer)
        sfx.play('go')
        setCurrent('FIGHT')
        setTimeout(onComplete, 700)
      }
    }, interval)

    return () => clearInterval(timer)
  }, [from, interval, onComplete])

  const isFight = current === 'FIGHT'

  return (
    <div className="flex flex-col items-center justify-center h-full gap-1">
      <span className="text-[8px] text-cp-muted tracking-[0.2em]">GET READY</span>
      <span
        key={String(current)}
        className={[
          'font-hud font-bold leading-none animate-cd-pop',
          isFight
            ? 'text-[40px] text-cp-win tracking-wide'
            : 'text-[72px] text-cp-accent',
        ].join(' ')}
      >
        {current}
      </span>
    </div>
  )
}
