import { useGameContext, useGameDispatchContext } from '../context/GameContext'
import Letter from '../lib/Letter'
import { GameActionKind } from '../context/GameContextReducer'

const useSelectableLetterCard = (letter: Letter, enabled?: boolean) => {
  if (!enabled) {
    return [{}, {}]
  }

  const { selectedLetter } = useGameContext()
  const dispatch = useGameDispatchContext()

  const selected = selectedLetter?.id === letter.id

  let styles = {}

  if (selected) {
    styles = {
      borderWidth: '3px',
    }
  }

  const props = {
    onClick: () => {
      if (selected) {
        dispatch({
          type: GameActionKind.DeselectLetter,
        })
      } else {
        dispatch({
          type: GameActionKind.SelectLetter,
          payload: { letter },
        })
      }
    },
  }

  return [props, styles]
}

export default useSelectableLetterCard
