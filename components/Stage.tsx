import { useLayoutEffect, useState } from 'react'
import type { Letter } from '../lib/types'
import { css } from '../stitches.config'
import LetterList from './LetterList'
import SortableLetterCard from './SortableLetterCard'
import {
  SortableContext,
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable'
import { useBuildPhaseContext } from '../context/BuildPhaseContext'

type Props = {
  letters: Letter[]
  capacity: number
}

const Stage = ({ letters = [], capacity }: Props) => {
  const { sellLetter } = useBuildPhaseContext()
  const [stageLetters, setStageLetters] = useState<Letter[]>(letters)

  useLayoutEffect(() => {
    setStageLetters(letters)
  }, [letters])

  return (
    <div className={styles()}>
      <strong>Stage</strong>

      <SortableContext items={letters} strategy={horizontalListSortingStrategy}>
        <LetterList capacity={capacity}>
          {stageLetters.map((letter) => (
            <SortableLetterCard
              key={letter.id}
              id={letter.id}
              letter={letter}
              onClick={() => {
                sellLetter(letter)
              }}
            />
          ))}
        </LetterList>
      </SortableContext>
    </div>
  )
}

const styles = css({
  border: '1px solid black',
  backgroundColor: '$neutral175',
  padding: '0.5rem',
  display: 'grid',
  gap: '0.5rem',
})

export default Stage
