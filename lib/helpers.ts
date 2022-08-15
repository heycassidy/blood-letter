import type { Letter, LetterTierMap } from '../lib/types'
import { nanoid } from 'nanoid'

export const computeLetterValueFromTier = (tier: number): number => tier ** 2

export const groupLettersByTier = (letters: Letter[]): LetterTierMap => {
  return letters.reduce((result: LetterTierMap, letter: Letter) => {
    const tier = letter.tier

    return tier in result
      ? { ...result, [tier]: [...result[tier], letter] }
      : { ...result, [tier]: [letter] }
  }, {})
}

export const randomLetters = (amount: number, letters: Letter[]) =>
  [...Array(amount)].map(() => {
    return {
      ...letters[Math.floor(Math.random() * letters.length)],
      id: nanoid(10),
    }
  })

export const getNextMod = (items: unknown[], currentItem: unknown): unknown => {
  const currentIndex = items.indexOf(currentItem)
  const nextIndex = (currentIndex + 1) % items.length

  return items[nextIndex]
}
