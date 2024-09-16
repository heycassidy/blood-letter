import {
  UUID,
  LetterOptions,
  AlphabetCharacter,
  LetterOriginKind,
} from '../lib/types'
import { nanoid } from 'nanoid'

class Letter implements LetterOptions {
  readonly id: UUID
  readonly name: AlphabetCharacter
  readonly tier: number
  readonly value: number

  frozen?: boolean
  origin?: LetterOriginKind

  constructor(options: Readonly<LetterOptions>) {
    this.id = options.id ?? nanoid(10)
    this.name = options.name
    this.tier = options.tier
    this.value = options.value
    this.frozen = options.frozen ?? false
    this.origin = options.origin
  }
}

export default Letter
