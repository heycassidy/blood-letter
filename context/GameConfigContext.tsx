import { PhaseKind, GameConfig } from '../lib/types'
import Letter from '../lib/Letter'
import { createContext } from 'react'

const alphabet: Letter[] = [
  new Letter({ name: 'e', tier: 1, value: 1 }),
  new Letter({ name: 't', tier: 1, value: 1 }),
  new Letter({ name: 'a', tier: 1, value: 1 }),
  new Letter({ name: 'i', tier: 1, value: 1 }),
  new Letter({ name: 'o', tier: 1, value: 1 }),
  new Letter({ name: 'n', tier: 1, value: 1 }),

  new Letter({ name: 's', tier: 2, value: 4 }),
  new Letter({ name: 'h', tier: 2, value: 4 }),
  new Letter({ name: 'r', tier: 2, value: 4 }),
  new Letter({ name: 'd', tier: 2, value: 4 }),

  new Letter({ name: 'l', tier: 3, value: 9 }),
  new Letter({ name: 'c', tier: 3, value: 9 }),
  new Letter({ name: 'u', tier: 3, value: 9 }),
  new Letter({ name: 'm', tier: 3, value: 9 }),

  new Letter({ name: 'w', tier: 4, value: 16 }),
  new Letter({ name: 'f', tier: 4, value: 16 }),
  new Letter({ name: 'g', tier: 4, value: 16 }),
  new Letter({ name: 'y', tier: 4, value: 16 }),

  new Letter({ name: 'p', tier: 5, value: 25 }),
  new Letter({ name: 'b', tier: 5, value: 25 }),
  new Letter({ name: 'v', tier: 5, value: 25 }),
  new Letter({ name: 'k', tier: 5, value: 25 }),

  new Letter({ name: 'j', tier: 6, value: 36 }),
  new Letter({ name: 'x', tier: 6, value: 36 }),
  new Letter({ name: 'q', tier: 6, value: 36 }),
  new Letter({ name: 'z', tier: 6, value: 36 }),
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
  poolRefreshCost: 1,

  rackCapacity: 6,

  wordBonusComputation: (letters) => letters.length ** 2,

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
})
