import { useLayoutEffect, useState } from 'react'
import { DroppableKind, Letter } from '../lib/types'
import { css } from '../stitches.config'
import LetterList from './LetterList'
import { DraggableLetterCard } from './DraggableLetterCard'
import { useDroppable } from '@dnd-kit/core'

type Props = {
  letters: Letter[]
  amount: number
}

const LetterStore = ({ letters = [], amount }: Props) => {
  const { setNodeRef } = useDroppable({
    id: DroppableKind.Store,
  })

  const [storeLetters, setStoreLetters] = useState<Letter[]>([])

  useLayoutEffect(() => {
    setStoreLetters(letters)
  }, [letters])

  return (
    <div className={styles()}>
      <strong>Letter Store</strong>

      <LetterList capacity={amount} ref={setNodeRef}>
        {storeLetters.map((letter) => (
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

export default LetterStore
