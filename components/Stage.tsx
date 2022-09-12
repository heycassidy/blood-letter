import { useLayoutEffect, useState } from 'react'
import { Letter, DroppableKind } from '../lib/types'
import { css } from '../stitches.config'
import LetterList from './LetterList'
import {
  SortableContext,
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable'
import { useDroppable } from '@dnd-kit/core'
import { SortableLetterCard } from './SortableLetterCard'

type Props = {
  letters: Letter[]
  capacity: number
}

const Stage = ({ letters = [], capacity }: Props) => {
  const { setNodeRef } = useDroppable({
    id: DroppableKind.Stage,
  })

  const [stageLetters, setStageLetters] = useState<Letter[]>(letters)

  useLayoutEffect(() => {
    setStageLetters(letters)
  }, [letters])

  return (
    <div className={styles()}>
      <strong>Stage</strong>

      <SortableContext
        items={stageLetters}
        strategy={horizontalListSortingStrategy}
      >
        <LetterList capacity={capacity} ref={setNodeRef}>
          {stageLetters.map((letter) => (
            <SortableLetterCard
              id={letter.id}
              key={letter.id}
              letter={letter}
              selectable
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
