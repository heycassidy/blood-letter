import { UUID } from './types'

export const itemIsInRange = (item: number, start = 0, stop = 10): boolean =>
  integerRange(start, stop).includes(item)

export const integerRange = (start = 0, stop = 10): number[] =>
  [...Array(stop + start - 1)].map((_, i) => i + start)

export const randomItems = <T>(items: T[], amount: number): T[] =>
  [...Array(amount)].map(() => items[Math.floor(Math.random() * items.length)])

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
  items: { [key in symbol]: number }[],
  field: string
): string =>
  items.reduce(
    (str: string, item: { [key: string]: string }) => `${str}${item[field]}`,
    ''
  )
