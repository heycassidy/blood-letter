import { useState, useEffect } from 'react'
import { useBuildPhaseContext } from '../context/BuildPhaseContext'
import { Letter } from '../lib/types'

const useSelectableLetterCard = (letter: Letter, enabled?: boolean) => {
  if (!enabled) {
    return [{}, {}]
  }

  const { selectedLetter, selectLetter } = useBuildPhaseContext()
  const [selected, setSelected] = useState(false)

  useEffect(() => {
    setSelected(selectedLetter?.id === letter.id)
  }, [selectedLetter])

  const styles = {
    border: selected ? '2px solid red' : undefined,
  }

  const props = {
    onClick: () => {
      selectLetter(selected ? null : letter)
    },
  }

  return [props, styles]
}

export default useSelectableLetterCard
