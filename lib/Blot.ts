import { nanoid } from 'nanoid'

import { UUID, BlotOptions, BlotOriginKind } from './types'
import Letter from './Letter'

class Blot implements BlotOptions {
  id: UUID = nanoid(10)

  readonly name: string // One or two words
  readonly tier: number
  readonly description: string

  origin?: BlotOriginKind

  attachedTo?: Letter
  effect: () => void

  constructor(options: BlotOptions) {
    this.name = options.name
    this.tier = options.tier
    this.description = options.description

    this.attachedTo = options.attachedTo
    this.effect = options.effect
  }

  applyEffect(): void {
    this.effect()
  }
}

export default Blot
