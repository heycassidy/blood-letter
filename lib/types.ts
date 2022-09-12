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

export type UUID = string | number

export interface Player {
  id: UUID
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
  id: UUID
  origin?: LetterOriginKind
}

export interface LetterCardProps {
  letter: Letter
  dragging?: boolean
  selectable?: boolean
}

export interface LetterTierMap {
  [index: string]: Letter[]
}

export interface GameState {
  players: Map<UUID, Player>
  activePlayer: Player
  round: number
  phase: PhaseKind
  battleWinner: Player | undefined | false
  gameOver: boolean
  gameWinner: Player | undefined
  gameCount: number

  updatePlayer: (id: UUID, player: Partial<Player>) => void
  setActivePlayer: (id: UUID) => void
  togglePlayer: () => void
  togglePhase: () => void
  incrementRound: () => void
  restartGame: () => void

  getStoreLetters: (
    alphabet: Letter[],
    tier: number,
    amount: number,
    idSupplier: () => UUID
  ) => Letter[]

  getStoreTier: (round: number) => number
  getStoreCapacity: (round: number) => number
  getHealthCost: (round: number) => number
}

export enum LetterOriginKind {
  Store,
  Stage,
  Battle,
}

export enum DroppableKind {
  Store = 'droppable-store',
  Stage = 'droppable-stage',
}

export interface BuildPhaseState {
  stage: Letter[]
  store: Letter[]
  gold: number
  selectedLetter: Letter | null
  draggingLetter: Letter | null

  buyLetter: (letter: Letter) => void
  sellLetter: (letter: Letter) => void
  selectLetter: (letter: Letter | null) => void
  rollStore: () => void
}
