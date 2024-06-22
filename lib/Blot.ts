import { nanoid } from 'nanoid'

import { UUID, BlotOptions, ItemOriginKind } from './types'
import Letter from './Letter'

class Blot implements BlotOptions {
  id: UUID = nanoid(10)

  readonly name: string // One or two words
  readonly tier: number
  readonly description: string

  frozen?: boolean = false
  origin?: ItemOriginKind

  attachedTo?: Letter
  effect: () => void

  constructor(options: BlotOptions) {
    this.name = options.name
    this.tier = options.tier
    this.description = options.description
    this.frozen = options.frozen
    this.origin = options.origin

    this.attachedTo = options.attachedTo
    this.effect = options.effect
  }

  applyEffect(): void {
    this.effect()
  }
}

export default Blot
