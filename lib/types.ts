export interface Player {
  id: string
  name: string
  health: number
  gold: number
  stage: Letter[]
  store: Letter[]
}

export enum Phase {
  Stage = 1,
  Battle,
}

export type AlphabetCharacter =
  | 'a'
  | 'b'
  | 'c'
  | 'd'
  | 'e'
  | 'f'
  | 'g'
  | 'h'
  | 'i'
  | 'j'
  | 'k'
  | 'l'
  | 'm'
  | 'n'
  | 'o'
  | 'p'
  | 'q'
  | 'r'
  | 's'
  | 't'
  | 'u'
  | 'v'
  | 'w'
  | 'x'
  | 'y'
  | 'z'

export type Letter = { name: AlphabetCharacter; tier: number; id: string }

export interface LetterTierMap {
  [index: string]: Letter[]
}

export interface GameState {
  players: Map<string, Player>
  activePlayer: Player
  round: number
  phase: Phase
  gameOver: boolean
  winner: Player | undefined

  updatePlayer: (id: string, player: Partial<Player>) => void
  setActivePlayer: (id: string) => void
  togglePlayer: () => void
}

export interface BuildPhaseState {
  stage: Letter[]
  store: Letter[]
  gold: number

  buyLetter: (letter: Letter) => void
  sellLetter: (letter: Letter) => void
  rollStore: () => void
}
