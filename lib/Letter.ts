import { nanoid } from 'nanoid'
import { Letter, LetterOptions } from '../lib/types'

// Function to create a Letter object
function createLetter(options: Readonly<LetterOptions>): Letter {
  return {
    id: options.id ?? nanoid(10),
    name: options.name,
    tier: options.tier,
    value: options.value,
    frozen: options.frozen ?? false,
    origin: options.origin,
  }
}

// Function to clone the Letter object
function cloneLetter(letter: Letter): Letter {
  return createLetter({
    id: letter.id,
    name: letter.name,
    tier: letter.tier,
    value: letter.value,
    frozen: letter.frozen,
    origin: letter.origin,
  })
}

export { createLetter, cloneLetter }
