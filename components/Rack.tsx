import { useState } from 'react'
import { useIsomorphicLayoutEffect } from '../hooks/useIsomorphicLayoutEffect'
import { DroppableKind, Letter } from '../lib/types'
import { css } from '../styled-system/css'
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

const Rack = ({ letters = [], capacity }: Props) => {
  const { setNodeRef } = useDroppable({
    id: DroppableKind.Rack,
  })

  const [rackLetters, setRackLetters] = useState<Letter[]>(letters)

  useIsomorphicLayoutEffect(() => {
    setRackLetters(letters)
  }, [letters])

  return (
    <div className={styles}>
      <SortableContext
        items={rackLetters}
        strategy={horizontalListSortingStrategy}
      >
        <LetterList capacity={capacity} ref={setNodeRef}>
          {rackLetters.map((letter) => (
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
  border: '[1px solid black]',
  backgroundColor: 'gray.200',
  padding: '2',
  display: 'grid',
  gap: '2',
})

export default Rack
