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
