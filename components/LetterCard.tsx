import { forwardRef, ComponentPropsWithRef } from 'react'
import useSelectableLetterCard from '../hooks/useSelectableLetterCard'
import { LetterCardProps } from '../lib/types'
import { css } from '../stitches.config'

type Ref = HTMLDivElement

const LetterCard = forwardRef<
  Ref,
  LetterCardProps & ComponentPropsWithRef<'div'>
>((props, ref) => {
  const { letter, dragging, selectable, ...rest } = props

  const [selectableProps, selectableStyles] = useSelectableLetterCard(
    letter,
    selectable
  )

  const { name, tier, value } = letter

  const dynamicStyles = {
    opacity: dragging ? 0.5 : undefined,
  }

  const styles = css(baseStyles, dynamicStyles, selectableStyles)

  return (
    <div ref={ref} className={styles()} {...selectableProps} {...rest}>
      <div className="tier">{tier}</div>
      <div className="name">{name.toUpperCase()}</div>
      <div className="value">{value}</div>
    </div>
  )
})
LetterCard.displayName = 'LetterCard'

const baseStyles = {
  border: '1px solid $neutral875',
  backgroundColor: 'white',
  position: 'relative',
  aspectRatio: '1',
  maxWidth: 'fit-content',
  display: 'flex',
  userSelect: 'none',
  width: '100%',
  height: '100%',

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
    top: 0,
  },
  '.value': {
    bottom: 0,
  },
}

export default LetterCard
