export type Choice = 'rock' | 'paper' | 'scissors'
export type RoundResult = 'win' | 'lose' | 'draw'
export type GameView = 'menu' | 'mode' | 'countdown' | 'game' | 'result' | 'highscores'

export interface MatchMode {
  label: string
  rounds: number      // Infinity for endless
  target: number      // wins needed — Infinity for endless
}

export const MATCH_MODES: MatchMode[] = [
  { label: 'BEST OF 3', rounds: 3,        target: 2        },
  { label: 'BEST OF 5', rounds: 5,        target: 3        },
  { label: 'ENDLESS',   rounds: Infinity, target: Infinity },
]

export const CHOICES: Choice[] = ['rock', 'paper', 'scissors']

export const ICONS: Record<Choice, string> = {
  rock:     '✊',
  paper:    '✋',
  scissors: '✌️',
}

export const BEATS: Record<Choice, Choice> = {
  rock:     'scissors',
  scissors: 'paper',
  paper:    'rock',
}

export function getResult(you: Choice, cpu: Choice): RoundResult {
  if (you === cpu) return 'draw'
  return BEATS[you] === cpu ? 'win' : 'lose'
}

export function randomChoice(): Choice {
  return CHOICES[Math.floor(Math.random() * 3)]
}

export interface MatchState {
  modeIdx:     number
  youWins:     number
  cpuWins:     number
  roundsPlayed: number
}

export const INITIAL_MATCH: MatchState = {
  modeIdx:      0,
  youWins:      0,
  cpuWins:      0,
  roundsPlayed: 0,
}

export interface HSRecord {
  wins:    number
  total:   number
  winPct:  number
  date:    string
}
