import type { Letter } from '../lib/types'
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

export const GameConfig = createContext({
  alphabet,
})
