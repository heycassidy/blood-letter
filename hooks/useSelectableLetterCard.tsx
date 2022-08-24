import { useState, useEffect } from 'react'
import { useBuildPhaseContext } from '../context/BuildPhaseContext'
import { Letter } from '../lib/types'

const useSelectableLetterCard = (letter: Letter) => {
  const { selectedLetter, selectLetter } = useBuildPhaseContext()
  const [selected, setSelected] = useState(false)

  useEffect(() => {
    if (selectedLetter) {
      setSelected(selectedLetter.id === letter.id)
    }
  }, [selectedLetter])

  const styles = {
    border: selected ? '2px solid red' : undefined,
  }

  const props = {
    onClick: () => {
      selectLetter(letter)
    },
  }

  return [props, styles]
}

export default useSelectableLetterCard
