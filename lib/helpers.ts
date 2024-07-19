import { randomInt } from 'd3-random'
import { alea } from 'seedrandom'

import { UUID } from './types'

export const itemIsInRange = (item: number, start = 0, stop = 10): boolean =>
  integerRange(start, stop).includes(item)

export const integerRange = (start = 0, stop = 10): number[] =>
  [...Array(stop + start - 1)].map((_, i) => i + start)

export const seededRandomInteger = (props: {
  min: number
  max: number
  seed: number
}) => {
  const { min, max, seed } = props

  const source = alea(`${seed}`)

  return randomInt.source(source)(min, max)()
}

export const randomItem = <T>(items: T[], seed?: number): T => {
  if (seed) {
    return items[seededRandomInteger({ min: 0, max: items.length, seed })]
  } else {
    return items[Math.floor(Math.random() * items.length)]
  }
}

export const weightedRandomItem = <T extends { weight: number }>(
  items: T[],
  seed?: number
): T => {
  const sumOfWeights = sumItemProperty(items, 'weight')
  let weights: number[] = []

  for (const [index, item] of items.entries()) {
    const m = Math.round((item.weight / sumOfWeights) * 100)
    weights = [...weights, ...Array(m).fill(index)]
  }

  const weightedRandomIndex = randomItem(weights, seed)

  return items[weightedRandomIndex]
}

export const randomItems = <T>(
  items: T[],
  amount: number,
  seed?: number
): T[] => {
  return [...Array(amount)].map((_, i) =>
    randomItem(items, seed ? seed + i : undefined)
  )
}

export const assignIds = <T>(items: T[], id: UUID | (() => UUID)): T[] =>
  items.map((item) => ({
    ...item,
    id: typeof id === 'string' || typeof id === 'number' ? id : id(),
  }))

export const cyclicalNext = <Item>(items: Item[], currentItem: Item): Item => {
  const currentIndex = items.indexOf(currentItem)
  const nextIndex = (currentIndex + 1) % items.length

  return items[nextIndex]
}

export const getFromNumericMapWithMax = <T>(
  map: { [key in number | 'max']: T },
  item: number | 'max'
): T => map[item in map ? item : 'max']

export const sumItemProperty = (
  items: { [key in symbol]: number }[],
  property: string
): number =>
  items.reduce(
    (sum: number, item: { [key: string]: number }) => sum + item[property],
    0
  )

export const concatItemProperty = (
  items: { [key in symbol]: string }[],
  field: string
): string =>
  items.reduce(
    (str: string, item: { [key: string]: string }) => `${str}${item[field]}`,
    ''
  )
