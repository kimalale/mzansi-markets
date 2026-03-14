import React from 'react'
import { Screen }     from '@cloudphone/components/Screen'
import { useStorage } from '@cloudphone/hooks/useStorage'
import { useKeyPress } from '@cloudphone/hooks/useKeyPress'
import { CP_KEYS }    from '@cloudphone/types'
import { sfx }        from '@cloudphone/engine/sound'
import { HSRecord, MATCH_MODES } from '../types'

interface Props {
  onBack: () => void
}

export function HighScoresView({ onBack }: Props) {
  const [hs] = useStorage<Record<string, HSRecord>>('rps_hs', {})

  useKeyPress([CP_KEYS.RSK, CP_KEYS.LSK], () => { sfx.play('back'); onBack() })

  const tracked = MATCH_MODES.filter(m => m.rounds !== Infinity)

  return (
    <Screen title="HIGH SCORES" softkeys={{ rsk: 'BACK' }}>
      <div className="flex flex-col items-center justify-center h-full gap-[6px]">

        <div className="font-hud text-[10px] text-cp-accent tracking-[0.2em] mb-1">
          HIGH SCORES
        </div>

        {tracked.map((mode, i) => {
          const key    = `mode_${i}`
          const record = hs[key]
          return (
            <div key={key} className="w-[200px] flex justify-between items-center px-2 py-[5px] bg-cp-bg2 border border-cp-border rounded-sm">
              <div>
                <div className="text-[8px] text-cp-muted tracking-wide">{mode.label}</div>
                {record && (
                  <div className="text-[7px] text-cp-border2">{record.date}</div>
                )}
              </div>
              {record ? (
                <div className="text-right">
                  <div className="font-hud text-[10px] text-cp-accent2">
                    {record.wins}W / {record.total}R
                  </div>
                  <div className="text-[7px] text-cp-muted">{record.winPct}% WIN RATE</div>
                </div>
              ) : (
                <div className="text-[8px] text-cp-border2 tracking-wide">NO RECORD</div>
              )}
            </div>
          )
        })}

        {Object.keys(hs).length === 0 && (
          <div className="text-[8px] text-cp-border2 tracking-[0.1em] mt-2">
            PLAY MATCH MODE TO SET RECORDS
          </div>
        )}

      </div>
    </Screen>
  )
}
