import Letter from '../lib/Letter'

export interface GameConfig {
  alphabet: Letter[]
  initialRound: number
  initialPhase: PhaseKind
  initialGold: number
  initialHealth: number
  healthToLose: number
  battleVictoriesToWin: number
  numberOfPlayers: number
  gameMode: GameModeKind

  letterBuyCost: number
  letterSellValue: number
  poolRefreshCost: number

  rackCapacity: number

  poolTierMap: { [key in number | 'max']: number }
  poolCapacityMap: { [key in number | 'max']: number }
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
  rackScore: number
  wordBonus: number
  roundScore: number
  battleVictories: number
  playerClassification: PlayerClassificationKind
}

export enum PhaseKind {
  Build = 'BUILD',
  Battle = 'BATTLE',
}

export enum PlayerClassificationKind {
  Human = 'HUMAN',
  Computer = 'COMPUTER',
}

export enum GameModeKind {
  PassToPlay = 'PASS_TO_PLAY',
  AgainstComputer = 'AGAINST_COMPUTER',
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
  origin?: LetterOriginKind
}

export interface LetterCardProps {
  letter: Letter
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
  playersWhoCompletedRound: Player[]
  battleWinner: Player | undefined | false
  gameOver: boolean
  gameWinner: Player | undefined
  gameCount: number

  updatePlayer: (id: UUID, player: Partial<Player>) => void
  togglePhase: () => void
  endTurn: () => void
  incrementRound: () => void
  restartGame: () => void

  getPoolLetters: (alphabet: Letter[], tier: number, amount: number) => Letter[]

  getPoolTier: (round: number) => number
  getPoolCapacity: (round: number) => number
  getHealthCost: (round: number) => number
}

export enum LetterOriginKind {
  Pool = 'POOL',
  Rack = 'RACK',
  Battle = 'BATTLE',
}

export enum DroppableKind {
  Pool = 'POOL',
  Rack = 'RACK',
}

export interface BuildPhaseState {
  rack: Letter[]
  pool: Letter[]
  gold: number
  selectedLetter: Letter | null
  draggingLetter: Letter | null

  buyLetter: (letter: Letter) => void
  sellLetter: (letter: Letter) => void
  toggleLetterFreeze: (letter: Letter) => void
  selectLetter: (letter: Letter | null) => void
  moveLetterToLetter: (letter: Letter, overLetter: Letter) => void
  refreshPool: () => void
}
