import type { ComponentPropsWithoutRef } from 'react'
import type { Letter } from '../lib/types'

const useFreezableLetterCard = (
  letter: Letter,
  enabled?: boolean
): [boolean, ComponentPropsWithoutRef<'div'>] => {
  const props: ComponentPropsWithoutRef<'div'> = {}
  let frozen = false

  if (!enabled) {
    return [frozen, props]
  }

  frozen = letter?.frozen ?? false

  if (frozen) {
    props['data-frozen'] = ''
  }

  return [frozen, props]
}

export default useFreezableLetterCard
