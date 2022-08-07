import type { Letter } from '../lib/types'
import { createContext } from 'react'

const alphabet: Letter[] = [
  { name: 'e', tier: 1 },
  { name: 't', tier: 1 },
  { name: 'a', tier: 1 },
  { name: 'i', tier: 1 },
  { name: 'o', tier: 1 },
  { name: 'n', tier: 1 },

  { name: 's', tier: 2 },
  { name: 'h', tier: 2 },
  { name: 'r', tier: 2 },
  { name: 'd', tier: 2 },

  { name: 'l', tier: 3 },
  { name: 'c', tier: 3 },
  { name: 'u', tier: 3 },
  { name: 'm', tier: 3 },

  { name: 'w', tier: 4 },
  { name: 'f', tier: 4 },
  { name: 'g', tier: 4 },
  { name: 'y', tier: 4 },

  { name: 'p', tier: 5 },
  { name: 'b', tier: 5 },
  { name: 'v', tier: 5 },
  { name: 'k', tier: 5 },

  { name: 'j', tier: 6 },
  { name: 'x', tier: 6 },
  { name: 'q', tier: 6 },
  { name: 'z', tier: 6 },
]

export const GameConfig = createContext({
  alphabet,
})
