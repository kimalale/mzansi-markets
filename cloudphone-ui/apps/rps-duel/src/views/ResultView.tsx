import React, { useEffect } from 'react'
import { Screen }      from '@cloudphone/components/Screen'
import { useDPad }     from '@cloudphone/hooks/useDPad'
import { useStorage }  from '@cloudphone/hooks/useStorage'
import { sfx }         from '@cloudphone/engine/sound'
import { MatchState, MATCH_MODES, HSRecord } from '../types'

interface Props {
  match:      MatchState
  onRematch:  () => void
  onMenu:     () => void
}

const ACTIONS = ['REMATCH', 'MENU']

export function ResultView({ match, onRematch, onMenu }: Props) {
  const mode = MATCH_MODES[match.modeIdx]
  const won  = match.youWins > match.cpuWins
  const draw = match.youWins === match.cpuWins

  const [hs, setHs] = useStorage<Record<string, HSRecord>>('rps_hs', {})
  const [isNewHS, setIsNewHS] = React.useState(false)

  useEffect(() => {
    // Play sound
    if (draw)      sfx.play('draw')
    else if (won)  sfx.play('fanfare')
    else           sfx.play('defeat')

    // Save high score for bo3/bo5 only
    if (mode.rounds !== Infinity && match.roundsPlayed > 0) {
      const key = `mode_${match.modeIdx}`
      const pct = Math.round(match.youWins / match.roundsPlayed * 100)
      const prev = hs[key]
      if (!prev || pct > prev.winPct) {
        setHs(prev => ({
          ...prev,
          [key]: {
            wins:   match.youWins,
            total:  match.roundsPlayed,
            winPct: pct,
            date:   new Date().toLocaleDateString(),
          },
        }))
        setIsNewHS(true)
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const { isFocused } = useDPad({
    length: ACTIONS.length,
    axis: 'horizontal',
    onConfirm: (i) => { sfx.play('select'); i === 0 ? onRematch() : onMenu() },
    onBack:    ()  => { sfx.play('back');   onMenu() },
    onChange:  ()  => sfx.play('nav'),
  })

  const bigLabel = draw ? 'DRAW' : won ? 'VICTORY!' : 'DEFEAT'
  const bigClass = draw ? 'text-cp-draw' : won ? 'text-cp-win' : 'text-cp-lose'

  return (
    <Screen title="RPS DUEL" softkeys={{ lsk: 'SELECT', rsk: 'MENU' }}>
      <div className="flex flex-col items-center justify-center h-full gap-[6px]">

        <div className={`font-hud text-[22px] font-bold tracking-[0.15em] ${bigClass}`}>
          {bigLabel}
        </div>

        <div className="font-hud text-[28px] text-cp-text tracking-wide">
          <span className={won ? 'text-cp-win' : 'text-cp-text'}>{match.youWins}</span>
          <span className="text-cp-border2 text-[18px]"> — </span>
          <span className={!won && !draw ? 'text-cp-lose' : 'text-cp-text'}>{match.cpuWins}</span>
        </div>

        <div className="text-[7px] text-cp-muted tracking-[0.15em]">
          YOUR WINS — CPU WINS
        </div>

        <div className="h-[14px] text-[8px] text-cp-draw tracking-wide">
          {isNewHS ? '★ NEW HIGH SCORE!' : ''}
        </div>

        <div className="flex gap-2 mt-2">
          {ACTIONS.map((label, i) => (
            <div
              key={label}
              onClick={() => { sfx.play('select'); i === 0 ? onRematch() : onMenu() }}
              className={[
                'px-[14px] py-[6px] rounded-sm border text-[8px] tracking-wide cursor-pointer transition-all duration-100',
                isFocused(i)
                  ? 'border-cp-accent text-cp-accent2 bg-cp-bg3'
                  : 'border-cp-border text-cp-muted bg-cp-bg2',
              ].join(' ')}
            >
              {label}
            </div>
          ))}
        </div>

      </div>
    </Screen>
  )
}
