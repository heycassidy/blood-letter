import { ReactNode, forwardRef } from 'react'
import { css } from '../stitches.config'

type Props = {
  children: ReactNode[]
  capacity: number
}

type Ref = HTMLDivElement

const LetterList = forwardRef<Ref, Props>((props, ref) => {
  const { children = [], capacity = 1 } = props

  const propAwareStyles = {
    gridTemplateColumns: `repeat(${capacity}, 3rem)`,
  }

  const styles = css(baseStyles, propAwareStyles)

  return (
    <div ref={ref} className={styles()}>
      {children}

      {capacity > children.length &&
        [...Array(capacity - children.length)].map((_, i) => (
          <span className="empty-slot" key={`empty-slot-${i}`}></span>
        ))}
    </div>
  )
})
LetterList.displayName = 'LetterList'

const baseStyles = {
  display: 'grid',
  gridTemplateRows: '3rem',
  justifyContent: 'start',
  gridAutoFlow: 'column',
  gap: '0.5rem',
  boxSizing: 'content-box',
  '.empty-slot': {
    border: '1px solid white',
    aspectRatio: '1 / 1',
  },
}

export default LetterList
