import { ReactNode } from 'react'
import { css } from '../stitches.config'

type Props = {
  children: ReactNode[]
  capacity: number
}

const LetterList = ({ children = [], capacity = 1 }: Props) => {
  const propAwareStyles = {
    gridTemplateColumns: `repeat(${capacity}, 3rem)`,
  }

  return (
    <>
      <div className={styles(propAwareStyles)}>
        {children}

        {capacity > children.length &&
          [...Array(capacity - children.length)].map((_, i) => (
            <span className="empty-slot" key={`empty-slot-${i}`}></span>
          ))}
      </div>
    </>
  )
}

const styles = css({
  display: 'grid',
  gridTemplateRows: '3rem',
  justifyContent: 'start',
  gridAutoFlow: 'column',
  gap: '0.5rem',
  boxSizing: 'content-box',
  '.empty-slot': {
    border: '1px solid white',
    aspectRatio: '1',
  },
})

export default LetterList
