import React from 'react'
import { Screen }     from '@cloudphone/components/Screen'
import { useDPad }    from '@cloudphone/hooks/useDPad'
import { sfx }        from '@cloudphone/engine/sound'
import { MATCH_MODES } from '../types'

interface Props {
  onSelect: (modeIdx: number) => void
  onBack:   () => void
}

export function ModeView({ onSelect, onBack }: Props) {
  const { isFocused } = useDPad({
    length: MATCH_MODES.length,
    axis: 'vertical',
    onConfirm: (i) => { sfx.play('select'); onSelect(i) },
    onBack:    ()  => { sfx.play('back');   onBack()    },
    onChange:  ()  => sfx.play('nav'),
  })

  return (
    <Screen title="RPS DUEL" softkeys={{ lsk: 'SELECT', rsk: 'BACK' }}>
      <div className="flex flex-col items-center justify-center h-full gap-[8px]">
        <div className="text-[8px] text-cp-muted tracking-[0.2em] mb-1">
          SELECT MATCH LENGTH
        </div>

        {MATCH_MODES.map((mode, i) => (
          <div
            key={mode.label}
            onClick={() => { sfx.play('select'); onSelect(i) }}
            className={[
              'w-[190px] flex items-center gap-3 px-3 py-[7px] rounded-sm border transition-all duration-100 cursor-pointer',
              isFocused(i)
                ? 'border-cp-accent bg-cp-bg3'
                : 'border-cp-border bg-cp-bg2',
            ].join(' ')}
          >
            <span className={`font-hud text-[14px] w-6 text-center ${isFocused(i) ? 'text-cp-accent' : 'text-cp-muted'}`}>
              {mode.rounds === Infinity ? '∞' : mode.rounds}
            </span>
            <div>
              <div className={`text-[8px] tracking-wide ${isFocused(i) ? 'text-cp-text' : 'text-cp-muted'}`}>
                {mode.label}
              </div>
              <div className="text-[7px] text-cp-border2">
                {mode.target === Infinity ? 'Play until you quit' : `First to ${mode.target} wins`}
              </div>
            </div>
          </div>
        ))}
      </div>
    </Screen>
  )
}
