import { createContext } from 'react'
import type { PlayerState } from '../lib/types'

export const PlayerContext = createContext<PlayerState>({
  gold: 10,
  setGold: (gold: number) => ({ gold }),
})
