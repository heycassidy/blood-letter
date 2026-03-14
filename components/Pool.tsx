import { useDroppable } from '@dnd-kit/react'
import { DroppableKind, type Letter } from '@/lib/types'
import { css } from '@/styled-system/css'
import { DraggableLetterCard } from './DraggableLetterCard'
import LetterList from './LetterList'

type Props = {
  letters: Letter[]
  amount: number
}

const Pool = ({ letters = [], amount }: Props) => {
  const { ref } = useDroppable({
    id: DroppableKind.Pool,
  })

  return (
    <div className={styles}>
      <LetterList capacity={amount} ref={ref}>
        {letters.map((letter) => (
          <DraggableLetterCard
            id={letter.id}
            key={letter.id}
            letter={letter}
            selectable
            freezable
          />
        ))}
      </LetterList>
    </div>
  )
}

const styles = css({
  borderStyle: 'solid',
  borderWidth: '1px',
  borderColor: 'gray.11',
  backgroundColor: 'gray.3',
  padding: '2',
  display: 'grid',
  gap: '2',
})

export default Pool
