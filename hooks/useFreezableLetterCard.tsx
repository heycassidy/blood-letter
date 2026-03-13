import type { ComponentPropsWithoutRef } from 'react'
import type { Letter } from '../lib/types'

type FreezableProps = ComponentPropsWithoutRef<'div'> & {
  'data-frozen'?: string
}

const useFreezableLetterCard = (
  letter: Letter,
  enabled?: boolean
): [boolean, FreezableProps] => {
  const props: FreezableProps = {}
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
