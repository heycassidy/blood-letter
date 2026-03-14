import { pointerIntersection } from '@dnd-kit/collision'
import { useDroppable } from '@dnd-kit/react'
import { DroppableKind, type Letter } from '@/lib/types'
import { css } from '@/styled-system/css'
import LetterList from './LetterList'
import { SortableLetterCard } from './SortableLetterCard'

type Props = {
  letters: Letter[]
  capacity: number
}

const Rack = ({ letters = [], capacity }: Props) => {
  const { ref } = useDroppable({
    id: DroppableKind.Rack,
    collisionDetector: pointerIntersection,
  })

  return (
    <div className={styles}>
      <LetterList capacity={capacity} ref={ref}>
        {letters.map((letter, index) => (
          <SortableLetterCard
            id={letter.id}
            key={letter.id}
            index={index}
            letter={letter}
            selectable
          />
        ))}
      </LetterList>
    </div>
  )
}

const styles = css({
  border: '[1px solid black]',
  backgroundColor: 'gray.3',
  padding: '2',
  display: 'grid',
  gap: '2',
})

export default Rack
