import {
  UUID,
  LetterOptions,
  AlphabetCharacter,
  ItemOriginKind,
} from '../lib/types'
import Blot from './Blot'
import { nanoid } from 'nanoid'

class Letter implements LetterOptions {
  id: UUID = nanoid(10)

  readonly name: AlphabetCharacter
  readonly tier: number
  readonly value: number

  frozen?: boolean
  origin?: ItemOriginKind
  blot?: Blot

  constructor(options: LetterOptions) {
    this.name = options.name
    this.tier = options.tier
    this.value = options.value
    this.frozen = options.frozen ?? false
    this.origin = options.origin
  }
}

export default Letter
