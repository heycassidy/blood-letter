import { Letter, PhaseKind, GameConfig } from '../lib/types'
import { createContext } from 'react'
import { nanoid } from 'nanoid'

const alphabet: Letter[] = [
  { name: 'e', tier: 1, value: 1, id: nanoid(10) },
  { name: 't', tier: 1, value: 1, id: nanoid(10) },
  { name: 'a', tier: 1, value: 1, id: nanoid(10) },
  { name: 'i', tier: 1, value: 1, id: nanoid(10) },
  { name: 'o', tier: 1, value: 1, id: nanoid(10) },
  { name: 'n', tier: 1, value: 1, id: nanoid(10) },

  { name: 's', tier: 2, value: 4, id: nanoid(10) },
  { name: 'h', tier: 2, value: 4, id: nanoid(10) },
  { name: 'r', tier: 2, value: 4, id: nanoid(10) },
  { name: 'd', tier: 2, value: 4, id: nanoid(10) },

  { name: 'l', tier: 3, value: 9, id: nanoid(10) },
  { name: 'c', tier: 3, value: 9, id: nanoid(10) },
  { name: 'u', tier: 3, value: 9, id: nanoid(10) },
  { name: 'm', tier: 3, value: 9, id: nanoid(10) },

  { name: 'w', tier: 4, value: 16, id: nanoid(10) },
  { name: 'f', tier: 4, value: 16, id: nanoid(10) },
  { name: 'g', tier: 4, value: 16, id: nanoid(10) },
  { name: 'y', tier: 4, value: 16, id: nanoid(10) },

  { name: 'p', tier: 5, value: 25, id: nanoid(10) },
  { name: 'b', tier: 5, value: 25, id: nanoid(10) },
  { name: 'v', tier: 5, value: 25, id: nanoid(10) },
  { name: 'k', tier: 5, value: 25, id: nanoid(10) },

  { name: 'j', tier: 6, value: 36, id: nanoid(10) },
  { name: 'x', tier: 6, value: 36, id: nanoid(10) },
  { name: 'q', tier: 6, value: 36, id: nanoid(10) },
  { name: 'z', tier: 6, value: 36, id: nanoid(10) },
]

export const GameConfigContext = createContext<GameConfig>({
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
  storeRefreshCost: 1,

  stageCapacity: 6,

  wordBonusComputation: (letters) => letters.length ** 2,

  storeTierMap: {
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
  storeCapacityMap: {
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
})
