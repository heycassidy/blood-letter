export interface GameConfig {
  alphabet: Letter[]
  initialRound: number
  initialPhase: PhaseKind
  initialGold: number
  initialHealth: number
  healthToLose: number
  battleVictoriesToWin: number
  numberOfPlayers: number

  letterBuyCost: number
  letterSellValue: number
  storeRefreshCost: number

  stageCapacity: number

  storeTierMap: { [key in number | 'max']: number }
  storeCapacityMap: { [key in number | 'max']: number }
  healthCostMap: { [key in number | 'max']: number }

  wordBonusComputation: (letters: Letter[]) => number
}

export interface Player {
  id: string
  name: string
  health: number
  gold: number
  stage: Letter[]
  stageWord: string
  store: Letter[]
  stageScore: number
  wordBonus: number
  roundScore: number
  completedTurn: boolean
  battleVictories: number
}

export enum PhaseKind {
  Build = 'BUILD',
  Battle = 'BATTLE',
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

export type Letter = {
  name: AlphabetCharacter
  tier: number
  value: number
  id: string
}

export interface LetterTierMap {
  [index: string]: Letter[]
}

export interface GameState {
  players: Map<string, Player>
  activePlayer: Player
  round: number
  phase: PhaseKind
  battleWinner: Player | undefined | false
  gameOver: boolean
  gameWinner: Player | undefined
  gameCount: number

  updatePlayer: (id: string, player: Partial<Player>) => void
  setActivePlayer: (id: string) => void
  togglePlayer: () => void
  togglePhase: () => void
  incrementRound: () => void
  restartGame: () => void

  getStoreLetters: (
    alphabet: Letter[],
    tier: number,
    amount: number,
    idSupplier: () => string
  ) => Letter[]

  getStoreTier: (round: number) => number
  getStoreCapacity: (round: number) => number
  getHealthCost: (round: number) => number
}

export interface BuildPhaseState {
  stage: Letter[]
  store: Letter[]
  gold: number

  buyLetter: (letter: Letter) => void
  sellLetter: (letter: Letter) => void
  rollStore: () => void
}
