import type { ComponentPropsWithoutRef } from 'react'
import type { Letter } from '../lib/types'

const useFreezableLetterCard = (
  letter: Letter,
  enabled?: boolean
): [boolean, ComponentPropsWithoutRef<any>] => {
  const props: ComponentPropsWithoutRef<any> = {}
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
