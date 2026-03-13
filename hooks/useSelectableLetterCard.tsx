import type { ComponentPropsWithoutRef } from 'react'
import { useGameContext, useGameDispatchContext } from '../context/GameContext'
import { GameActionKind } from '../context/GameContextReducer'
import type { Letter } from '../lib/types'

const useSelectableLetterCard = (
  letter: Letter,
  enabled?: boolean
): [boolean, ComponentPropsWithoutRef<any>] => {
  let selected = false
  const props: ComponentPropsWithoutRef<any> = {}

  if (!enabled) {
    return [selected, props]
  }

  const { selectedLetter } = useGameContext()
  const dispatch = useGameDispatchContext()

  selected = selectedLetter?.id === letter.id

  props['aria-selected'] = selected.toString()

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

  return [selected, props]
}

export default useSelectableLetterCard
