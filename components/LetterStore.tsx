import { useContext, useEffect, useState } from 'react'
import type { Letter } from '../lib/types'
import { GameConfig } from '../lib/GameConfig'
import css from 'styled-jsx/css'
import LetterCard from './Letter'
import { computeLetterValueFromTier } from '../lib/helpers'

const LetterStore = ({
  highestTier = 1,
  amount = 3,
}: {
  highestTier: number
  amount: number
}) => {
  const [storeLetters, setStoreLetters] = useState<Letter[]>([])
  const [valueSum, setValueSum] = useState(0)
  const { alphabet } = useContext(GameConfig)

  const tiers = [...Array(highestTier)].map((_, i) => i + 1)

  const availableLetters = alphabet.filter((letter) =>
    tiers.includes(letter.tier)
  )

  const randomLetters = (amount: number) =>
    [...Array(amount)]
      .map(() => Math.floor(Math.random() * availableLetters.length))
      .map((index) => availableLetters[index])

  useEffect(() => {
    setStoreLetters(randomLetters(amount))
  }, [])

  useEffect(() => {
    setValueSum(
      storeLetters
        .map((letter) => computeLetterValueFromTier(letter.tier))
        .reduce((sum, value) => sum + value, 0)
    )
  }, [storeLetters])

  return (
    <div className="letter-store">
      <strong>Letter Store</strong>
      <div className="info-list">
        <span className="info-box">Tier: {highestTier}</span>
        <span className="info-box">Value Sum: {valueSum}</span>
      </div>

      <div className="horizontal-list">
        {storeLetters.map((letter, index) => (
          <LetterCard name={letter.name} tier={letter.tier} key={index} />
        ))}
      </div>

      <button
        onClick={() => {
          setStoreLetters(randomLetters(amount))
        }}
      >
        Refresh
      </button>

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

export default LetterStore
