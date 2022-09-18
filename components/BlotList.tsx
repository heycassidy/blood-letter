import { ReactNode, forwardRef } from 'react'
import { css } from '../stitches.config'

type Props = {
  children: ReactNode[]
  capacity: number
}

type Ref = HTMLDivElement

const BlotList = forwardRef<Ref, Props>((props, ref) => {
  const { children = [], capacity = 1 } = props

  const propAwareStyles = {
    gridTemplateColumns: `repeat(${capacity}, 2rem)`,
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
BlotList.displayName = 'BlotList'

const gridCSS = {
  display: 'grid',
  gridTemplateRows: '2rem',
  justifyContent: 'start',
  justifyItems: 'center',
  alignItems: 'center',
  gridAutoFlow: 'column',
  gap: '0.5rem',
  boxSizing: 'content-box',
}

const slotCSS = {
  backgroundColor: '$neutral275',
  borderRadius: '50em',
  width: '1.5rem',
  height: '1.5rem',
}

export default BlotList
