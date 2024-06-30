import { UUID, PlayerOptions, PlayerClassificationKind } from '../lib/types'
import Letter from './Letter'
import { nanoid } from 'nanoid'
import {
  gameConfig,
  getPoolTier,
  getPoolCapacity,
  getRandomPoolLetters,
} from '../lib/gameConfig'
import { sumItemProperty, concatItemProperty } from './helpers'
import { wordList } from './words'

class Player implements PlayerOptions {
  readonly id: UUID
  readonly name: string
  readonly classification: PlayerClassificationKind

  health: number
  rack: Letter[]
  pool: Letter[]
  battleVictories: number

  constructor(options: Readonly<PlayerOptions>) {
    const { initialRound, initialHealth } = gameConfig

    this.id = options.id ?? nanoid(10)
    this.name = options.name
    this.classification = options.classification

    this.health = options.health ?? initialHealth
    this.battleVictories = options.battleVictories ?? 0
    this.rack = options.rack ?? []
    this.pool = options.pool ?? this.getPoolForRound(initialRound)
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

  // Randomizes pool according to current round while preserving frozen letters
  refreshPool(round: number): void {
    this.pool = this.getPoolForRound(round).map((letter, index) => {
      return this.pool[index]?.frozen ? this.pool[index] : letter
    })
  }

  get rackWord(): string {
    return concatItemProperty(
      this.rack.map((letter) => ({ ...letter })),
      'name'
    )
  }

  get rackScore(): number {
    return sumItemProperty(
      this.rack.map((letter) => ({ ...letter })),
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

  getPoolForRound(round: number): Letter[] {
    const { alphabet, poolTierMap, poolCapacityMap } = gameConfig

    const poolTier = getPoolTier(round, poolTierMap)
    const poolCapacity = getPoolCapacity(round, poolCapacityMap)

    return getRandomPoolLetters(alphabet, poolTier, poolCapacity)
  }
}

export default Player
