import React, { useState, useCallback } from 'react'
import { GameView, MatchState, INITIAL_MATCH } from './types'
import { MenuView }       from './views/MenuView'
import { ModeView }       from './views/ModeView'
import { GameView as GV } from './views/GameView'
import { ResultView }     from './views/ResultView'
import { HighScoresView } from './views/HighScoresView'
import { Countdown }      from '@cloudphone/components/Countdown'
import { Screen }         from '@cloudphone/components/Screen'

export function App() {
  const [view, setView]   = useState<GameView>('menu')
  const [match, setMatch] = useState<MatchState>(INITIAL_MATCH)

  const goTo = useCallback((v: GameView) => setView(v), [])

  const startMatch = useCallback((modeIdx: number) => {
    setMatch({ ...INITIAL_MATCH, modeIdx })
    setView('countdown')
  }, [])

  const updateMatch = useCallback((patch: Partial<MatchState>) => {
    setMatch(prev => ({ ...prev, ...patch }))
  }, [])

  // Countdown feeds directly into the game view
  if (view === 'countdown') {
    return (
      <Screen title="RPS DUEL" softkeys={{ center: 'GET READY' }}>
        <Countdown onComplete={() => goTo('game')} />
      </Screen>
    )
  }

  if (view === 'menu')       return <MenuView onSelect={(v) => {
    if (v === 'quickplay') startMatch(2)
    else goTo(v)
  }} />

  if (view === 'mode')       return <ModeView
    onSelect={startMatch}
    onBack={() => goTo('menu')}
  />

  if (view === 'game')       return <GV
    match={match}
    onUpdate={updateMatch}
    onMatchOver={() => goTo('result')}
    onQuit={() => goTo('menu')}
  />

  if (view === 'result')     return <ResultView
    match={match}
    onRematch={() => startMatch(match.modeIdx)}
    onMenu={() => goTo('menu')}
  />

  if (view === 'highscores') return <HighScoresView
    onBack={() => goTo('menu')}
  />

  return null
}
