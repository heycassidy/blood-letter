import { useEffect, useState } from 'react'
import type { Letter } from '../lib/types'
import css from 'styled-jsx/css'
import LetterCard from './LetterCard'

type Props = {
  letters: Letter[]
  buyLetter: (letter: Letter, index: number) => void
}

const LetterStore = ({ letters = [], buyLetter }: Props) => {
  const [storeLetters, setStoreLetters] = useState<Letter[]>([])

  useEffect(() => {
    setStoreLetters(letters)
  }, [letters])

  return (
    <div className="letter-store">
      <strong>Letter Store</strong>

      <div className="horizontal-list">
        {storeLetters.map((letter, index) => (
          <LetterCard
            letter={{ name: letter.name, tier: letter.tier }}
            key={index}
            onClick={() => {
              buyLetter(letter, index)
            }}
          />
        ))}
      </div>

      <style jsx>{styles}</style>
    </div>
  )
}

const styles = css`
  .letter-store {
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
`

export default LetterStore
