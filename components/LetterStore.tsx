import { useEffect, useState } from 'react'
import { Letter } from '../lib/types'
import { css } from '../stitches.config'
import LetterList from './LetterList'
import LetterCard from './LetterCard'

type Props = {
  letters: Letter[]
  amount: number
}

const LetterStore = ({ letters = [], amount }: Props) => {
  const [storeLetters, setStoreLetters] = useState<Letter[]>([])

  useEffect(() => {
    setStoreLetters(letters)
  }, [letters])

  return (
    <div className={styles()}>
      <strong>Letter Store</strong>

      <LetterList capacity={amount}>
        {storeLetters.map((letter) => (
          <LetterCard letter={letter} key={letter.id} selectable />
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
