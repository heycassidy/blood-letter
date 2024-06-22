import Letter from '../lib/Letter'
import Blot from './Blot'

export interface GameConfig {
  alphabet: Letter[]
  allBlots: Blot[]
  gameMode: GameModeKind
  initialRound: number
  initialPhase: PhaseKind
  initialGold: number
  initialHealth: number
  healthToLose: number
  battleVictoriesToWin: number
  numberOfPlayers: number

  letterBuyCost: number
  letterSellValue: number
  blotBuyCost: number
  poolRefreshCost: number

  rackCapacity: number

  poolTierMap: { [key in number | 'max']: number }
  poolCapacityMap: { [key in number | 'max']: number }
  wellTierMap: { [key in number | 'max']: number }
  wellCapacityMap: { [key in number | 'max']: number }
  healthCostMap: { [key in number | 'max']: number }

  wordBonusComputation: (letters: Letter[]) => number
}

export type UUID = string | number

export interface Player {
  id: UUID
  name: string
  health: number
  gold: number
  rack: Letter[]
  rackWord: string
  pool: Letter[]
  well: Blot[]
  rackScore: number
  wordBonus: number
  roundScore: number
  completedTurn: boolean
  battleVictories: number
}

export enum PhaseKind {
  Build = 'BUILD',
  Battle = 'BATTLE',
}

export enum GameModeKind {
  PassToPlay = 'PASS_TO_PLAY',
  Arena = 'ARENA',
  Versus = 'VERSUS',
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

export interface LetterOptions {
  name: AlphabetCharacter
  tier: number
  value: number
  frozen?: boolean
  origin?: ItemOriginKind
}

export interface BlotOptions {
  name: string
  tier: number
  description: string
  frozen?: boolean
  origin?: ItemOriginKind
  attachedTo?: Letter
  effect: () => void
}

export interface LetterCardProps {
  letter: Letter
  dragging?: boolean
  selectable?: boolean
  freezable?: boolean
}

export interface BlotCardProps {
  blot: Blot
  dragging?: boolean
  selectable?: boolean
  freezable?: boolean
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

  poolTier: number
  poolCapacity: number
  wellTier: number
  wellCapacity: number
  healthCost: number

  updatePlayer: (id: UUID, player: Partial<Player>) => void
  setActivePlayer: (id: UUID) => void
  togglePlayer: () => void
  togglePhase: () => void
  incrementRound: () => void
  restartGame: () => void

  getPoolLetters: (alphabet: Letter[], tier: number, amount: number) => Letter[]
  getWellBlots: (allBlots: Blot[], tier: number, amount: number) => Blot[]
}

export enum ItemOriginKind {
  Pool = 'POOL',
  Rack = 'RACK',
  Battle = 'BATTLE',
  Well = 'WELL',
  Letter = 'LETTER',
}

export enum DroppableKind {
  Pool = 'POOL',
  Rack = 'RACK',
  Letter = 'LETTER',
}

export interface BuildPhaseState {
  rack: Letter[]
  pool: Letter[]
  well: Blot[]
  gold: number
  selectedLetter: Letter | null

  buyLetter: (letter: Letter) => void
  sellLetter: (letter: Letter) => void
  freezeLetter: (letter: Letter) => void
  selectLetter: (letter: Letter | null) => void
  refreshPool: () => void

  addLetterToRack: (letterId: UUID, overId: UUID) => void
  removeLetterFromRack: (letterId: UUID) => void
  moveLetterInRack: (letterId: UUID, overId: UUID) => void
  addBlotToLetter: (blotId: UUID, letterID: UUID) => void
  removeBlotFromLetter: (blotId: UUID) => void
  spendGold: (amount: number) => void
  setLetterOrigins: () => void
  shallowMergeState: (partialState: Partial<BuildPhaseState>) => void
}

export interface DragAndDropState {
  draggingItem: Letter | Blot | null
}
