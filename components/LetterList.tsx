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

  const listStyles = css(gridCSS, propAwareStyles, { position: 'relative' })
  const backgroundStyles = css(gridCSS, propAwareStyles, {
    position: 'absolute',
  })
  const slotStyles = css(slotCSS)

  return (
    <div ref={ref} className={listStyles()}>
      {children}

      <div className={backgroundStyles()}>
        {[...Array(capacity)].map((_, i) => (
          <span className={slotStyles()} key={`empty-slot-${i}`}></span>
        ))}
      </div>
    </div>
  )
})
LetterList.displayName = 'LetterList'

const gridCSS = {
  display: 'grid',
  gridTemplateRows: '3rem',
  justifyContent: 'start',
  gridAutoFlow: 'column',
  gap: '0.5rem',
  boxSizing: 'content-box',
}

const slotCSS = {
  backgroundColor: '$neutral275',
  width: '3rem',
  height: '3rem',
}

export default LetterList
