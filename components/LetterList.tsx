import { forwardRef, type ReactNode } from 'react'
import { css } from '@/styled-system/css'
import type { SystemStyleObject } from '@/styled-system/types'

type Props = {
  children: ReactNode[]
  capacity: number
}

type Ref = HTMLDivElement

const gridCSS: SystemStyleObject = {
  display: 'grid',
  gridTemplateRows: '[token(spacing.12)]',
  gridTemplateColumns: '[repeat(var(--capacity), token(spacing.12))]',
  justifyContent: 'start',
  gridAutoFlow: 'column',
  gap: '2',
  boxSizing: 'content-box',
}

const slotCSS: SystemStyleObject = {
  backgroundColor: 'gray.4',
  width: '12',
  height: '12',
}

const listStyles = css(gridCSS, { position: 'relative' })
const backgroundStyles = css(gridCSS, { position: 'absolute' })
const slotStyles = css(slotCSS)

const LetterList = forwardRef<Ref, Props>((props, ref) => {
  const { children = [], capacity = 1 } = props

  return (
    <div
      ref={ref}
      className={listStyles}
      style={
        {
          '--capacity': capacity,
        } as React.CSSProperties
      }
    >
      {children}

      <div className={backgroundStyles}>
        {[...Array(capacity)].map((_, i) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: static placeholder slots have no identity
          <span className={slotStyles} key={`empty-slot-${i}`}></span>
        ))}
      </div>
    </div>
  )
})
LetterList.displayName = 'LetterList'

export default LetterList
