import { forwardRef, ComponentPropsWithRef } from 'react'
import useSelectableLetterCard from '../hooks/useSelectableLetterCard'
import useFreezableLetterCard from '../hooks/useFreezableLetterCard'
import { BlotCardProps } from '../lib/types'
import { css } from '../stitches.config'

type Ref = HTMLDivElement

const BlotCard = forwardRef<Ref, BlotCardProps & ComponentPropsWithRef<'div'>>(
  (props, ref) => {
    const { blot, className, dragging, selectable, freezable, ...rest } = props

    const { name } = blot

    const dynamicStyles = {
      opacity: dragging ? 0.5 : undefined,
    }

    const styles = css(baseStyles, dynamicStyles)

    return (
      <div ref={ref} className={`${styles()} ${className}`} {...rest}>
        {/* <div className="name">{name}</div> */}
      </div>
    )
  }
)
BlotCard.displayName = 'BlotCard'

const baseStyles = {
  // border: '1px solid $neutral875',
  backgroundColor: '$red600',
  borderRadius: '50em',
  position: 'relative',
  display: 'flex',
  userSelect: 'none',
  width: '1.5rem',
  height: '1.5rem',
  zIndex: 1,

  '.name': {
    fontWeight: '700',
    fontSize: '.25rem',
    // margin: 'auto',
  },
}

export default BlotCard
