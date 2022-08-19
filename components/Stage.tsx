import { useLayoutEffect, useState } from 'react'
import type { Letter } from '../lib/types'
import css from 'styled-jsx/css'
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
    <div className="stage">
      <strong>Stage</strong>

      <SortableContext items={letters} strategy={horizontalListSortingStrategy}>
        <LetterList capacity={capacity}>
          {stageLetters.map((letter) => (
            <SortableLetterCard
              key={letter.id}
              id={letter.id}
              letter={{ name: letter.name, tier: letter.tier, id: letter.id }}
              onClick={() => {
                sellLetter(letter)
              }}
            />
          ))}
        </LetterList>
      </SortableContext>

      <style jsx>{styles}</style>
    </div>
  )
}

const styles = css`
  .stage {
    border: 1px solid black;
    background-color: #e7e7e7;
    padding: 0.5rem;
    display: grid;
    gap: 0.5rem;
  }
  .info-list {
    display: flex;
    flex-wrap: wrap;
    gap: 0.25rem;
  }
  .info-box {
    line-height: 1;
    padding: 0.125rem 0.5rem;
    background: #d3d3d3;
  }
`

export default Stage
