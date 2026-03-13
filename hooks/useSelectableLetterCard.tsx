import type { ComponentPropsWithoutRef } from 'react'
import { useGameContext, useGameDispatchContext } from '../context/GameContext'
import { GameActionKind } from '../context/GameContextReducer'
import type { Letter } from '../lib/types'

const useSelectableLetterCard = (
  letter: Letter,
  enabled?: boolean
): [boolean, ComponentPropsWithoutRef<'div'>] => {
  const { selectedLetter } = useGameContext()
  const dispatch = useGameDispatchContext()

  if (!enabled) {
    return [false, {}]
  }

  const props: ComponentPropsWithoutRef<'div'> = {}
  const selected = selectedLetter?.id === letter.id

  props['aria-selected'] = selected

  if (selected) {
    props.onClick = () => {
      dispatch({
        type: GameActionKind.DeselectLetter,
      })
    }
  }

  if (!selected) {
    props.onClick = () => {
      dispatch({
        type: GameActionKind.SelectLetter,
        payload: { letter: letter },
      })
    }
  }

  return [selected, props] as [boolean, ComponentPropsWithoutRef<'div'>]
}

export default useSelectableLetterCard
