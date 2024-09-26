import { forwardRef, ComponentPropsWithRef } from 'react'
import useSelectableLetterCard from '../hooks/useSelectableLetterCard'
import useFreezableLetterCard from '../hooks/useFreezableLetterCard'
import { LetterCardProps } from '../lib/types'
import { css } from '../styled-system/css'

type Ref = HTMLDivElement

const LetterCard = forwardRef<
  Ref,
  LetterCardProps & ComponentPropsWithRef<'div'>
>((props, ref) => {
  const { letter, dragging, selectable, freezable, ...rest } = props

  const [selected, selectableProps] = useSelectableLetterCard(
    letter,
    selectable
  )

  const [frozen, freezableProps] = useFreezableLetterCard(letter, freezable)

  const { name, value } = letter

  return (
    <div
      ref={ref}
      className={styles}
      {...selectableProps}
      {...freezableProps}
      {...rest}
    >
      <div
        className={css({
          position: 'absolute',
          padding: '0.5',
          top: '0',
          right: '0',
          lineHeight: 'tight',
          fontSize: 'xs',
        })}
      >
        {value}
      </div>
      <div
        className={css({
          fontWeight: 'bold',
          fontSize: '2xl',
          margin: 'auto',
        })}
      >
        {name.toUpperCase()}
      </div>
    </div>
  )
})
LetterCard.displayName = 'LetterCard'

const styles = css({
  borderStyle: 'solid',
  borderWidth: '1px',
  borderColor: 'gray.900',
  backgroundColor: 'white',
  position: 'relative',
  display: 'flex',
  userSelect: 'none',
  width: '12',
  height: '12',
  zIndex: 1,
  _pressed: { opacity: '0.5' },
  _selected: { borderWidth: '3px' },
  _frozen: {
    color: 'blue.700',
    backgroundColor: 'blue.50',
    borderColor: 'blue.600',
    boxShadow: 'inner',
    boxShadowColor: 'blue.300',
  },
})

export default LetterCard
