import { Letter, PhaseKind } from '../lib/types'
import { createContext } from 'react'
import { nanoid } from 'nanoid'

const alphabet: Letter[] = [
  { name: 'e', tier: 1, id: nanoid(10) },
  { name: 't', tier: 1, id: nanoid(10) },
  { name: 'a', tier: 1, id: nanoid(10) },
  { name: 'i', tier: 1, id: nanoid(10) },
  { name: 'o', tier: 1, id: nanoid(10) },
  { name: 'n', tier: 1, id: nanoid(10) },

  { name: 's', tier: 2, id: nanoid(10) },
  { name: 'h', tier: 2, id: nanoid(10) },
  { name: 'r', tier: 2, id: nanoid(10) },
  { name: 'd', tier: 2, id: nanoid(10) },

  { name: 'l', tier: 3, id: nanoid(10) },
  { name: 'c', tier: 3, id: nanoid(10) },
  { name: 'u', tier: 3, id: nanoid(10) },
  { name: 'm', tier: 3, id: nanoid(10) },

  { name: 'w', tier: 4, id: nanoid(10) },
  { name: 'f', tier: 4, id: nanoid(10) },
  { name: 'g', tier: 4, id: nanoid(10) },
  { name: 'y', tier: 4, id: nanoid(10) },

  { name: 'p', tier: 5, id: nanoid(10) },
  { name: 'b', tier: 5, id: nanoid(10) },
  { name: 'v', tier: 5, id: nanoid(10) },
  { name: 'k', tier: 5, id: nanoid(10) },

  { name: 'j', tier: 6, id: nanoid(10) },
  { name: 'x', tier: 6, id: nanoid(10) },
  { name: 'q', tier: 6, id: nanoid(10) },
  { name: 'z', tier: 6, id: nanoid(10) },
]

const storeTierFromRound = (round: number): number => {
  if (round > 10) return 6

  const tiers: { [tier: number]: number } = {
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
  }

  return tiers[round]
}

const storeCapacityFromRound = (round: number): number => {
  if (round > 10) return 6

  const capacities: { [tier: number]: number } = {
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
  }

  return capacities[round]
}

const healthLossFromRound = (round: number): number => {
  if (round > 10) return 3

  const capacities: { [tier: number]: number } = {
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
  }

  return capacities[round]
}

export const GameConfig = createContext({
  alphabet,
  initialGold: 10,
  initialHealth: 10,
  storeRefreshCost: 1,
  letterBuyCost: 3,
  letterSellValue: 2,
  initialRound: 1,
  initialPhase: PhaseKind.Build,
  stageCapacity: 6,
  storeTierFromRound,
  storeCapacityFromRound,
  healthLossFromRound,
})
