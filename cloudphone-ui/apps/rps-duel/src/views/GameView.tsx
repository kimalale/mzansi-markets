import React, { useState, useCallback } from 'react'
import { Screen }       from '@cloudphone/components/Screen'
import { ChoiceGrid }   from '@cloudphone/components/ChoiceGrid'
import { useDPad }      from '@cloudphone/hooks/useDPad'
import { sfx }          from '@cloudphone/engine/sound'
import {
  Choice, RoundResult, MatchState, MATCH_MODES,
  CHOICES, ICONS, getResult, randomChoice,
} from '../types'

type Phase = 'choose' | 'animating' | 'next'

interface Props {
  match:        MatchState
  onUpdate:     (patch: Partial<MatchState>) => void
  onMatchOver:  () => void
  onQuit:       () => void
}

const CHOICE_ITEMS = CHOICES.map((c, i) => ({
  icon:  ICONS[c],
  label: c.toUpperCase(),
  hint:  i === 0 ? '◀' : i === 1 ? '●' : '▶',
}))

export function GameView({ match, onUpdate, onMatchOver, onQuit }: Props) {
  const [phase,      setPhase]      = useState<Phase>('choose')
  const [yourPick,   setYourPick]   = useState<Choice | null>(null)
  const [cpuPick,    setCpuPick]    = useState<Choice | null>(null)
  const [roundResult, setRoundResult] = useState<RoundResult | null>(null)
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null)

  const mode = MATCH_MODES[match.modeIdx]

  const playRound = useCallback((choiceIdx: number) => {
    if (phase !== 'choose') return

    const you = CHOICES[choiceIdx]
    const cpu = randomChoice()
    const res = getResult(you, cpu)

    setPhase('animating')
    setYourPick(you)
    setSelectedIdx(choiceIdx)
    setCpuPick(null)
    setRoundResult(null)

    setTimeout(() => {
      setCpuPick(cpu)
      setRoundResult(res)

      const nextYouWins = match.youWins + (res === 'win' ? 1 : 0)
      const nextCpuWins = match.cpuWins + (res === 'lose' ? 1 : 0)
      const nextRounds  = match.roundsPlayed + 1

      sfx.play(res)
      onUpdate({ youWins: nextYouWins, cpuWins: nextCpuWins, roundsPlayed: nextRounds })

      const matchOver =
        mode.rounds !== Infinity &&
        (nextYouWins >= mode.target || nextCpuWins >= mode.target || nextRounds >= mode.rounds)

      if (matchOver) {
        setTimeout(onMatchOver, 900)
      } else {
        setPhase('next')
      }
    }, 500)
  }, [phase, match, mode, onUpdate, onMatchOver])

  const nextRound = useCallback(() => {
    if (phase !== 'next') return
    setYourPick(null)
    setCpuPick(null)
    setRoundResult(null)
    setSelectedIdx(null)
    setPhase('choose')
    sfx.play('select')
  }, [phase])

  const { focused } = useDPad({
    length:    3,
    axis:      'horizontal',
    onConfirm: (i) => phase === 'choose' ? playRound(i) : nextRound(),
    onBack:    onQuit,
    onChange:  () => sfx.play('nav'),
    disabled:  phase === 'animating',
  })

  const lsk = phase === 'choose' ? 'PLAY' : phase === 'next' ? 'NEXT' : '...'

  // Match pip bar
  const pips = mode.rounds !== Infinity ? (
    <div className="flex gap-[4px] mb-2">
      {Array.from({ length: mode.rounds }).map((_, i) => (
        <div
          key={i}
          className={[
            'w-[12px] h-[5px] rounded-sm border',
            i < match.youWins ? 'bg-cp-win border-cp-win'
            : i < match.youWins + match.cpuWins ? 'bg-cp-lose border-cp-lose'
            : 'bg-transparent border-cp-border2',
          ].join(' ')}
        />
      ))}
      <div className="w-[5px] h-[5px] rounded-full bg-cp-border mx-[2px] self-center" />
      {Array.from({ length: mode.rounds }).map((_, i) => (
        <div
          key={i}
          className={[
            'w-[12px] h-[5px] rounded-sm border',
            i < match.cpuWins ? 'bg-cp-lose border-cp-lose' : 'bg-transparent border-cp-border2',
          ].join(' ')}
        />
      ))}
    </div>
  ) : null

  const resultLabel = roundResult === 'win' ? 'YOU WIN!'
    : roundResult === 'lose' ? 'YOU LOSE'
    : roundResult === 'draw' ? 'DRAW'
    : 'CHOOSE YOUR MOVE'

  const resultClass = roundResult === 'win'  ? 'text-cp-win'
    : roundResult === 'lose' ? 'text-cp-lose'
    : roundResult === 'draw' ? 'text-cp-draw'
    : 'text-cp-border2'

  const iconClass = (res: RoundResult | null, side: 'you' | 'cpu') => {
    const won = res === (side === 'you' ? 'win' : 'lose')
    const lost = res === (side === 'you' ? 'lose' : 'win')
    return [
      'w-[52px] h-[52px] flex items-center justify-center rounded-[6px] border text-[28px] transition-all duration-200',
      won  ? 'border-cp-win  bg-[#0a1f10] animate-pop-win' :
      lost ? 'border-cp-lose bg-[#1f0a0a]' :
      res === 'draw' ? 'border-cp-draw bg-[#1a150a]' :
             'border-cp-border bg-cp-bg2',
    ].join(' ')
  }

  const roundLabel = mode.rounds === Infinity
    ? `ROUND ${match.roundsPlayed + 1}`
    : `ROUND ${match.roundsPlayed + 1} OF ${mode.rounds}`

  return (
    <Screen
      title="RPS DUEL"
      softkeys={{ lsk, rsk: 'QUIT' }}
      headerRight={
        <span>
          W:<span className="text-cp-accent2">{match.youWins}</span>{' '}
          L:<span className="text-cp-accent2">{match.cpuWins}</span>
        </span>
      }
    >
      <div className="flex flex-col items-center justify-start pt-[6px] h-full">

        <div className="text-[7px] text-cp-muted tracking-[0.15em] mb-[3px]">{roundLabel}</div>

        {pips}

        {/* Battle */}
        <div className="flex items-center gap-2 mb-[6px]">
          <div className="flex flex-col items-center gap-[3px]">
            <div className="text-[7px] text-cp-muted tracking-wide">YOU</div>
            <div className={iconClass(roundResult, 'you')}>
              {yourPick ? ICONS[yourPick] : '?'}
            </div>
          </div>
          <div className="font-hud text-[9px] text-cp-border2">VS</div>
          <div className="flex flex-col items-center gap-[3px]">
            <div className="text-[7px] text-cp-muted tracking-wide">CPU</div>
            <div className={iconClass(roundResult, 'cpu')}>
              {cpuPick ? ICONS[cpuPick] : '?'}
            </div>
          </div>
        </div>

        {/* Result */}
        <div className={`font-hud text-[12px] font-bold tracking-[0.15em] h-[18px] mb-[6px] ${resultClass}`}>
          {resultLabel}
        </div>

        {/* Choices */}
        <ChoiceGrid
          items={CHOICE_ITEMS.map((item, i) => ({
            ...item,
            selected: selectedIdx === i,
          }))}
          focused={phase === 'choose' ? focused : -1}
          onSelect={(i) => phase === 'choose' && playRound(i)}
        />

        <div className="text-[7px] text-cp-border2 tracking-wide mt-[5px]">
          {phase === 'choose' ? '◀ ▶ MOVE  ● CONFIRM'
           : phase === 'next' ? 'CENTER / LSK — NEXT ROUND'
           : ''}
        </div>

      </div>
    </Screen>
  )
}
