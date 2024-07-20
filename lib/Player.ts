import { immerable } from 'immer'
import { UUID, PlayerOptions, PlayerClassificationKind } from '../lib/types'
import Letter from './Letter'
import { nanoid } from 'nanoid'
import { gameConfig, getPoolForRound } from '../lib/gameConfig'
import { sumItemProperty, concatItemProperty } from './helpers'
import { wordList } from './words'

const { initialRound, initialHealth } = gameConfig

class Player implements PlayerOptions {
  [immerable] = true

  readonly id: UUID
  readonly name: string
  readonly classification: PlayerClassificationKind

  seed: number
  health: number
  rack: Letter[]
  pool: Letter[]
  battleVictories: number

  constructor(options: Readonly<PlayerOptions>) {
    this.id = options.id ?? nanoid(10)
    this.name = options.name
    this.classification = options.classification
    this.seed = options.startingSeed ?? Math.random()

    this.health = options.health ?? initialHealth
    this.battleVictories = options.battleVictories ?? 0
    this.rack = options.rack ?? []
    this.pool = options.pool ?? getPoolForRound(initialRound)
  }

  clone() {
    return new Player({
      id: this.id,
      name: this.name,
      classification: this.classification,
      health: this.health,
      battleVictories: this.battleVictories,
      rack: this.rack,
      pool: this.pool,
    })
  }

  get rackWord(): string {
    return concatItemProperty(
      this.rack.map((letter) => ({ name: letter.name })),
      'name'
    )
  }

  get rackScore(): number {
    return sumItemProperty(
      this.rack.map((letter) => ({ value: letter.value })),
      'value'
    )
  }

  get wordBonus(): number {
    return wordList.includes(this.rackWord)
      ? gameConfig.wordBonusComputation(this.rackWord.length)
      : 0
  }

  get totalScore(): number {
    return this.rackScore + this.wordBonus
  }
}

export default Player
