import {
  UUID,
  LetterOptions,
  AlphabetCharacter,
  LetterOriginKind,
} from '../lib/types'
import { nanoid } from 'nanoid'

class Letter implements LetterOptions {
  id: UUID = nanoid(10)

  readonly name: AlphabetCharacter
  readonly tier: number
  readonly value: number

  frozen?: boolean = false
  origin?: LetterOriginKind

  constructor(options: LetterOptions) {
    this.name = options.name
    this.tier = options.tier
    this.value = options.value
    this.frozen = options.frozen
    this.origin = options.origin

    // this.doSomething()
  }

  doSomething(): void {
    console.log('something')
  }
}

export default Letter
