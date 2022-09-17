import { forwardRef, ComponentPropsWithRef } from 'react'
import useSelectableLetterCard from '../hooks/useSelectableLetterCard'
import useFreezableLetterCard from '../hooks/useFreezableLetterCard'
import { LetterCardProps } from '../lib/types'
import { css } from '../stitches.config'

type Ref = HTMLDivElement

const LetterCard = forwardRef<
  Ref,
  LetterCardProps & ComponentPropsWithRef<'div'>
>((props, ref) => {
  const { letter, dragging, selectable, freezable, ...rest } = props

  const [selectableProps, selectableStyles] = useSelectableLetterCard(
    letter,
    selectable
  )

  const [freezableStyles] = useFreezableLetterCard(letter, freezable)

  const { name, value } = letter

  const dynamicStyles = {
    opacity: dragging ? 0.5 : undefined,
  }

  const styles = css(
    baseStyles,
    dynamicStyles,
    selectableStyles,
    freezableStyles
  )

  return (
    <div ref={ref} className={styles()} {...selectableProps} {...rest}>
      <div className="value">{value}</div>
      <div className="name">{name.toUpperCase()}</div>
    </div>
  )
})
LetterCard.displayName = 'LetterCard'

const baseStyles = {
  border: '1px solid $neutral875',
  backgroundColor: 'white',
  position: 'relative',
  display: 'flex',
  userSelect: 'none',
  width: '3rem',
  height: '3rem',
  zIndex: 1,

  '.name': {
    fontWeight: '700',
    fontSize: '1.5rem',
    margin: 'auto',
  },
  '.tier, .value': {
    position: 'absolute',
    padding: '0.125rem',
    right: '0',
    lineHeight: '1',
    fontSize: '0.8rem',
  },
  '.tier': {
    bottom: 0,
  },
  '.value': {
    top: 0,
  },
}

export default LetterCard
