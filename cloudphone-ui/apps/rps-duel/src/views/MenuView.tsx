import React from 'react'
import { Screen }    from '@cloudphone/components/Screen'
import { MenuItem }  from '@cloudphone/components/MenuItem'
import { useDPad }   from '@cloudphone/hooks/useDPad'
import { sfx }       from '@cloudphone/engine/sound'
import { useStorage } from '@cloudphone/hooks/useStorage'
import { HSRecord }   from '../types'

type MenuDest = 'quickplay' | 'mode' | 'highscores'

const ITEMS: { label: string; icon: string; dest: MenuDest }[] = [
  { label: 'QUICK PLAY',  icon: '⚔️', dest: 'quickplay'  },
  { label: 'MATCH MODE',  icon: '🏆', dest: 'mode'        },
  { label: 'HIGH SCORES', icon: '📊', dest: 'highscores'  },
]

interface Props {
  onSelect: (dest: MenuDest) => void
}

export function MenuView({ onSelect }: Props) {
  const [hs] = useStorage<Record<string, HSRecord>>('rps_hs', {})
  const bestPct = Object.values(hs).reduce((b, r) => Math.max(b, r.winPct), 0)

  const { isFocused } = useDPad({
    length: ITEMS.length,
    axis: 'vertical',
    onConfirm: (i) => { sfx.play('select'); onSelect(ITEMS[i].dest) },
    onChange: () => sfx.play('nav'),
  })

  return (
    <Screen
      title="RPS DUEL"
      softkeys={{ lsk: 'SELECT', center: 'R·P·S' }}
      headerRight={<span>HS: <span className="text-cp-accent2">{bestPct > 0 ? bestPct + '%' : '—'}</span></span>}
    >
      <div className="flex flex-col items-center justify-center h-full gap-[6px]">
        <div className="font-hud text-[18px] text-cp-accent tracking-[0.15em] font-bold mb-1">
          RPS DUEL
        </div>
        <div className="text-[7px] text-cp-muted tracking-[0.2em] mb-2">
          ROCK · PAPER · SCISSORS
        </div>
        {ITEMS.map((item, i) => (
          <MenuItem
            key={item.dest}
            label={item.label}
            icon={item.icon}
            focused={isFocused(i)}
            onClick={() => { sfx.play('select'); onSelect(item.dest) }}
          />
        ))}
      </div>
    </Screen>
  )
}
