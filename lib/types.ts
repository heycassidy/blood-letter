import { GameActionKind } from '../context/GameContextReducer'

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
  players: Player[]
  activePlayerIndex: number
  battleWinnerIndex: number | undefined
  gameWinnerIndex: number | undefined
  round: number
  phase: PhaseKind
  gameOver: boolean
  gameCount: number
  gameMode: GameModeKind.AgainstComputer | GameModeKind.PassToPlay
  gameStarted: boolean

  rack: Letter[]
  pool: Letter[]
  gold: number
  selectedLetter: Letter | null
  draggingLetter: Letter | null
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

export interface MCTSMove {
  name: string
  weight: number
  execute: (state: GameState) => GameState
  actionKind: GameActionKind
}

export interface Letter {
  id: UUID
  name: AlphabetCharacter
  tier: number
  value: number
  frozen?: boolean
  origin?: LetterOriginKind
}

export interface LetterOptions {
  id?: UUID
  name: AlphabetCharacter
  tier: number
  value: number
  frozen?: boolean
  origin?: LetterOriginKind
}

export interface Player {
  id: UUID
  name: string
  classification: PlayerClassificationKind
  seed: number
  health: number
  rack: Letter[]
  pool: Letter[]
  battleVictories: number
}

export interface PlayerOptions {
  id?: UUID
  name: string
  classification: PlayerClassificationKind
  startingSeed?: number
  health?: number
  rack?: Letter[]
  pool?: Letter[]
  battleVictories?: number
}
