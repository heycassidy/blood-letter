import { Letter, LetterOriginKind, Player } from './types'
import { gameConfig } from './gameConfig'
import { getFromNumericMapWithMax, weightedRandomItems } from './utils'
import { createLetter } from './Letter'
import { getTotalScore } from './Player'
import { wordList } from './words'

export const wordsSet: Set<string> = new Set<string>(wordList)

export const getPoolTier = (
  round: number,
  poolTierMap: (typeof gameConfig)['poolTierMap']
): number => {
  return getFromNumericMapWithMax(poolTierMap, round)
}

export const getPoolCapacity = (
  round: number,
  poolCapacityMap: (typeof gameConfig)['poolCapacityMap']
): number => {
  return getFromNumericMapWithMax(poolCapacityMap, round)
}

export const getRandomPoolLetters = (
  letters: Letter[],
  tier: number,
  amount: number,
  randomSeed?: number
): Letter[] => {
  const { alphabet } = gameConfig

  const alphabetWithWeights = alphabet.map((letter) => {
    if (letter.tier === tier || letter.tier < tier) {
      return {
        letter,
        weight: 100,
      }
    }

    if (letter.tier === tier + 1) {
      return {
        letter,
        weight: 10,
      }
    }

    if (letter.tier === tier + 2) {
      return {
        letter,
        weight: 3,
      }
    }

    if (letter.tier === tier + 3) {
      return {
        letter,
        weight: 0.25,
      }
    }

    if (letter.tier === tier + 4) {
      return {
        letter,
        weight: 0.01,
      }
    }

    return {
      letter,
      weight: 0,
    }
  })

  const randomWeightedLetters = weightedRandomItems(
    alphabetWithWeights,
    amount,
    randomSeed
  )

  return randomWeightedLetters.map((letterWithWeight) => {
    const { name, tier, value } = letterWithWeight.letter
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
  healthCostMap: (typeof gameConfig)['healthCostMap']
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

export const getGameWinner = (players: Player[]): Player | null => {
  const { healthToLose, battleVictoriesToWin } = gameConfig

  const winner = getBattleWinner(players)

  if (!winner) {
    return null
  }

  const gameOver = players.some((player) => {
    return (
      player.health <= healthToLose ||
      player.battleVictories >= battleVictoriesToWin
    )
  })

  if (gameOver) {
    return winner
  }

  return null
}
