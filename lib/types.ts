import Letter from '../lib/Letter'

export type UUID = string | number

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
  battleWinner: Player | undefined | null
  gameOver: boolean
  gameWinner: Player | undefined
  gameCount: number
  gameMode: GameModeKind.AgainstComputer

  rack: Letter[]
  pool: Letter[]
  gold: number
  selectedLetter: Letter | null
  draggingLetter: Letter | null

  restartGame: () => void
}

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
  classification: PlayerClassificationKind
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
