import { PhaseKind, LetterOriginKind, Player, Letter } from './types'
import { getTotalScore } from './Player'
import { createLetter } from './Letter'
import {
  randomItems,
  getFromNumericMapWithMax,
  itemIsInRange,
} from '../lib/helpers'

const alphabet: Letter[] = [
  createLetter({ name: 'e', tier: 1, value: 1 }),
  createLetter({ name: 't', tier: 1, value: 1 }),
  createLetter({ name: 'a', tier: 1, value: 1 }),
  createLetter({ name: 'i', tier: 1, value: 1 }),
  createLetter({ name: 'o', tier: 1, value: 1 }),
  createLetter({ name: 'n', tier: 1, value: 1 }),

  createLetter({ name: 's', tier: 2, value: 4 }),
  createLetter({ name: 'h', tier: 2, value: 4 }),
  createLetter({ name: 'r', tier: 2, value: 4 }),
  createLetter({ name: 'd', tier: 2, value: 4 }),

  createLetter({ name: 'l', tier: 3, value: 9 }),
  createLetter({ name: 'c', tier: 3, value: 9 }),
  createLetter({ name: 'u', tier: 3, value: 9 }),
  createLetter({ name: 'm', tier: 3, value: 9 }),

  createLetter({ name: 'w', tier: 4, value: 16 }),
  createLetter({ name: 'f', tier: 4, value: 16 }),
  createLetter({ name: 'g', tier: 4, value: 16 }),
  createLetter({ name: 'y', tier: 4, value: 16 }),

  createLetter({ name: 'p', tier: 5, value: 25 }),
  createLetter({ name: 'b', tier: 5, value: 25 }),
  createLetter({ name: 'v', tier: 5, value: 25 }),
  createLetter({ name: 'k', tier: 5, value: 25 }),

  createLetter({ name: 'j', tier: 6, value: 36 }),
  createLetter({ name: 'x', tier: 6, value: 36 }),
  createLetter({ name: 'q', tier: 6, value: 36 }),
  createLetter({ name: 'z', tier: 6, value: 36 }),
]

interface gameConfig {
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
  poolRefreshCost: number

  rackCapacity: number

  poolTierMap: { [key in number | 'max']: number }
  poolCapacityMap: { [key in number | 'max']: number }
  healthCostMap: { [key in number | 'max']: number }

  wordBonusComputation: (wordLength: number) => number
}

export const gameConfig: Readonly<gameConfig> = {
  alphabet,
  initialRound: 1,
  initialPhase: PhaseKind.Build,
  initialGold: 10,
  initialHealth: 10,
  healthToLose: 0,
  battleVictoriesToWin: 10,
  numberOfPlayers: 2,

  letterBuyCost: 3,
  letterSellValue: 2,
  poolRefreshCost: 1,

  rackCapacity: 6,

  // round : pool tier
  poolTierMap: {
    1: 1,
    2: 1,
    3: 2,
    4: 2,
    5: 3,
    6: 3,
    7: 4,
    8: 4,
    9: 5,
    10: 5,
    max: 6,
  },

  // round : pool capacity
  poolCapacityMap: {
    1: 3,
    2: 3,
    3: 4,
    4: 4,
    5: 4,
    6: 5,
    7: 5,
    8: 5,
    9: 6,
    10: 6,
    max: 6,
  },

  // round : health cost for losing
  healthCostMap: {
    1: 1,
    2: 1,
    3: 1,
    4: 1,
    5: 2,
    6: 2,
    7: 2,
    8: 3,
    9: 3,
    10: 3,
    max: 3,
  },

  wordBonusComputation: (wordLength) => wordLength ** 2,
}

export const getPoolTier = (
  round: number,
  poolTierMap: gameConfig['poolTierMap']
): number => {
  return getFromNumericMapWithMax(poolTierMap, round)
}

export const getPoolCapacity = (
  round: number,
  poolCapacityMap: gameConfig['poolCapacityMap']
): number => {
  return getFromNumericMapWithMax(poolCapacityMap, round)
}

export const getRandomPoolLetters = (
  letters: Letter[],
  tier: number,
  amount: number,
  randomSeed?: number
): Letter[] => {
  const tierAndBelowLetters = letters.filter((letter) =>
    itemIsInRange(letter.tier, 1, tier)
  )

  return randomItems(tierAndBelowLetters, amount, randomSeed).map((letter) => {
    const { name, tier, value } = letter
    return createLetter({ name, tier, value, origin: LetterOriginKind.Pool })
  })
}

export const getPoolForRound = (
  round: number,
  randomSeed?: number
): Letter[] => {
  const { alphabet, poolTierMap, poolCapacityMap } = gameConfig

  const poolTier = getPoolTier(round, poolTierMap)
  const poolCapacity = getPoolCapacity(round, poolCapacityMap)

  return getRandomPoolLetters(alphabet, poolTier, poolCapacity, randomSeed)
}

export const getRefreshedPool = (
  pool: Letter[],
  round: number,
  randomSeed?: number
): Letter[] => {
  return getPoolForRound(round, randomSeed).map((letter, index) => {
    return pool[index]?.frozen ? pool[index] : letter
  })
}

export const getHealthCost = (
  round: number,
  healthCostMap: gameConfig['healthCostMap']
): number => {
  return getFromNumericMapWithMax(healthCostMap, round)
}

export const getBattleWinner = (players: Player[]): Player | null =>
  players.reduce((acc: Player | null, player: Player): Player | null => {
    if (!acc || getTotalScore(player) > getTotalScore(acc)) {
      return player
    } else if (getTotalScore(player) === getTotalScore(acc)) {
      return null
    }
    return acc
  }, null)
