import { ComponentPropsWithoutRef } from 'react'
import { Letter } from '../lib/types'

const useFreezableLetterCard = (
  letter: Letter,
  enabled?: boolean
): [boolean, ComponentPropsWithoutRef<any>] => {
  let props: ComponentPropsWithoutRef<any> = {}
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
