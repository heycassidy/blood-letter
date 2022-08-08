import { useEffect, useState } from 'react'
import type { Letter } from '../lib/types'
import css from 'styled-jsx/css'
import LetterCard from './LetterCard'
import { computeLetterValueFromTier } from '../lib/helpers'

type Props = {
  letters: Letter[]
  clearStage: () => void
  sellLetter: (letter: Letter, index: number) => void
}

const Stage = ({ letters = [], clearStage, sellLetter }: Props) => {
  const [stageLetters, setStageLetters] = useState<Letter[]>(letters)
  const [valueSum, setValueSum] = useState(0)

  useEffect(() => {
    setStageLetters(letters)
  }, [letters])

  useEffect(() => {
    setValueSum(
      stageLetters
        .map((letter) => computeLetterValueFromTier(letter.tier))
        .reduce((sum, value) => sum + value, 0)
    )
  }, [stageLetters])

  return (
    <div className="stage">
      <strong>Stage</strong>

      <div className="info-list">
        <span className="info-box">Value Sum: {valueSum}</span>
      </div>

      <div className="horizontal-list">
        {stageLetters.map((letter, index) => (
          <LetterCard
            letter={{ name: letter.name, tier: letter.tier }}
            key={index}
            onClick={() => {
              sellLetter(letter, index)
            }}
          />
        ))}
      </div>

      <button onClick={clearStage}>Clear Stage</button>

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
  .horizontal-list {
    display: grid;
    justify-content: start;
    grid-auto-flow: column;
    gap: 0.5rem;
  }
  .info-list {
    display: flex;
    gap: 0.25rem;
  }
  .info-box {
    line-height: 1;
    padding: 0.125rem 0.5rem;
    background: #d3d3d3;
  }
`

export default Stage
