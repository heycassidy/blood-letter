import { useLayoutEffect, useState } from 'react'
import { DroppableKind } from '../lib/types'
import Letter from '../lib/Letter'
import Blot from '../lib/Blot'
import { css } from '../stitches.config'
import LetterList from './LetterList'
import BlotList from './BlotList'
import BlotCard from './BlotCard'
import { useDroppable } from '@dnd-kit/core'

type Props = {
  blots: Blot[]
  amount: number
}

const Well = ({ blots, amount }: Props) => {
  const [wellBlots, setWellBlots] = useState<Blot[]>([])

  useLayoutEffect(() => {
    setWellBlots(blots)
  }, [blots])

  return (
    <div className={styles()}>
      <BlotList capacity={amount}>
        {wellBlots.map((blot) => (
          <BlotCard key={blot.id} blot={blot} />
        ))}
      </BlotList>
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

export default Well
