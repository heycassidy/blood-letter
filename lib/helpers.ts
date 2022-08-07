import type { Letter, LetterTierMap } from '../lib/types'

export const computeLetterValueFromTier = (tier: number): number => tier ** 2

export const groupLettersByTier = (letters: Letter[]): LetterTierMap => {
  return letters.reduce((result: LetterTierMap, letter: Letter) => {
    const tier = letter.tier

    return tier in result
      ? { ...result, [tier]: [...result[tier], letter] }
      : { ...result, [tier]: [letter] }
  }, {})
}
