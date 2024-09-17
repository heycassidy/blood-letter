import { useState } from 'react'
import { useIsomorphicLayoutEffect } from '../hooks/useIsomorphicLayoutEffect'
import { DroppableKind, Letter } from '../lib/types'
import { css } from '../stitches.config'
import LetterList from './LetterList'
import { DraggableLetterCard } from './DraggableLetterCard'
import { useDroppable } from '@dnd-kit/core'

type Props = {
  letters: Letter[]
  amount: number
}

const Pool = ({ letters = [], amount }: Props) => {
  const { setNodeRef } = useDroppable({
    id: DroppableKind.Pool,
  })

  const [poolLetters, setPoolLetters] = useState<Letter[]>([])

  useIsomorphicLayoutEffect(() => {
    setPoolLetters(letters)
  }, [letters])

  return (
    <div className={styles()}>
      <LetterList capacity={amount} ref={setNodeRef}>
        {poolLetters.map((letter) => (
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
  border: '1px solid black',
  backgroundColor: '$neutral175',
  padding: '0.5rem',
  display: 'grid',
  gap: '0.5rem',
})

export default Pool
