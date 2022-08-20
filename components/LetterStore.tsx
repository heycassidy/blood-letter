import { useEffect, useState } from 'react'
import type { Letter } from '../lib/types'
import css from 'styled-jsx/css'
import LetterList from './LetterList'
import LetterCard from './LetterCard'
import { useBuildPhaseContext } from '../context/BuildPhaseContext'

type Props = {
  letters: Letter[]
  amount: number
}

const LetterStore = ({ letters = [], amount }: Props) => {
  const { buyLetter } = useBuildPhaseContext()
  const [storeLetters, setStoreLetters] = useState<Letter[]>([])

  useEffect(() => {
    setStoreLetters(letters)
  }, [letters])

  return (
    <div className="letter-store">
      <strong>Letter Store</strong>

      <LetterList capacity={amount}>
        {storeLetters.map((letter) => (
          <LetterCard
            letter={letter}
            key={letter.id}
            onClick={() => {
              buyLetter(letter)
            }}
          />
        ))}
      </LetterList>

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
`

export default LetterStore
