import { useLayoutEffect, useState } from 'react'
import { Letter } from '../lib/types'
import { css } from '../stitches.config'
import LetterList from './LetterList'
import LetterCard from './LetterCard'
import {
  SortableContext,
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable'

type Props = {
  letters: Letter[]
  capacity: number
}

const Stage = ({ letters = [], capacity }: Props) => {
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
            <LetterCard letter={letter} key={letter.id} sortable selectable />
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
