import { useBuildPhaseContext } from '../context/BuildPhaseContext'
import Letter from '../lib/Letter'

const useSelectableLetterCard = (letter: Letter, enabled?: boolean) => {
  if (!enabled) {
    return [{}, {}]
  }

  const { selectedLetter, selectLetter } = useBuildPhaseContext()

  const selected = selectedLetter?.id === letter.id

  let styles = {}

  if (selected) {
    styles = {
      borderWidth: '3px',
    }
  }

  const props = {
    onClick: () => {
      selectLetter(selected ? null : letter)
    },
  }

  return [props, styles]
}

export default useSelectableLetterCard
